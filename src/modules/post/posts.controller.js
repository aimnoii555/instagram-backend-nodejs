import { pool } from '../../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';

function mediaTypeOf(mime) {
    if (!mime) return 'image';
    return mime.startsWith('video/') ? 'video' : 'image';
}
function publicUrlFor(filePath) {
    // แปลง "uploads/xxx/yyy.jpg" -> "/uploads/xxx/yyy.jpg"
    const norm = filePath.replace(/\\/g, '/');
    return '/' + norm.replace(/^\/?/, '');
}

// แปลง URL สาธารณะ /uploads/... -> ไฟล์พาธจริง
function filePathFromUrl(publicUrl) {

    // posts.controller.js อยู่ใน src/modules/posts => root = project/src
    const __filename = fileURLToPath(import.meta.url);

    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '..', '..', '..'); // ไปที่รากโปรเจกต์
    const relative = publicUrl.replace(/^\//, ''); // ตัด / นำหน้า
    return path.resolve(projectRoot, relative);
}


// --- helpers (ปรับให้อ่านจาก alias ใหม่) ---
function shapeUserBasic(row) {
    return {
        id: row.user_id,
        username: row.user_username,
        avatar_url: row.user_avatar_url ?? null
    };
}
function shapePost(row, media = []) {
    return {
        id: row.post_id,                     // << ใช้ post_id
        caption: row.caption ?? null,
        location: row.location ?? null,
        created_at: row.created_at,
        user: shapeUserBasic(row),
        media: media.sort((a, b) => a.position - b.position),
        likes: Number(row.likes || 0),
        comments: Number(row.comments || 0),
        liked: !!row.liked
    };
}



function shapeMedia(row) {
    return {
        id: row.id,
        url: row.media_url,
        type: row.media_type,
        thumb_url: row.thumb_url,
        width: row.width,
        height: row.height,
        duration_ms: row.duration_ms,
        position: row.position
    };
}


/**  DELETE /comments/:id — ลบคอมเมนต์ของตัวเอง */
export async function deleteComment(req, res, next) {
    const myId = req.user.id;
    const cid = Number(req.params.id);
    if (!cid) return res.status(400).json({ error: 'Invalid comment id' });

    try {
        const [[c]] = await pool.query(
            'SELECT id, user_id FROM comments WHERE id = ? LIMIT 1', [cid]
        );
        if (!c) return res.status(404).json({ error: 'Comment not found' });
        if (c.user_id !== myId) return res.status(403).json({ error: 'Forbidden' });

        await pool.query('DELETE FROM comments WHERE id = ?', [cid]);
        return res.status(204).send();
    } catch (e) { return next(e); }
}


/** DELETE /posts/:id — Soft delete */
export async function deletePost(req, res, next) {
    const myId = req.user.id;
    const postId = Number(req.params.id);
    const reason = (req.body?.reason || '').toString().slice(0, 255) || null;

    try {
        const [[own]] = await pool.query('SELECT user_id, deleted_at FROM posts WHERE id = ? LIMIT 1', [postId]);
        if (!own) return res.status(404).json({ error: 'Post not found' });
        if (own.user_id !== myId) return res.status(403).json({ error: 'Forbidden' });
        if (own.deleted_at) return res.status(200).json({ status: 'ok', deleted: true }); // ลบไว้แล้ว

        await pool.query(
            'UPDATE posts SET deleted_at = NOW(), deleted_by = ?, deleted_reason = ?, updated_at = NOW() WHERE id = ?',
            [myId, reason, postId]
        );
        return res.status(204).send();
    } catch (e) { return next(e); }
}


/** PUT /posts/:id/restore — ยกเลิกการลบ (ภายใน retention window) */
export async function restorePost(req, res, next) {
    const myId = req.user.id;
    const postId = Number(req.params.id);

    try {
        const [[row]] = await pool.query(
            'SELECT user_id, deleted_at FROM posts WHERE id = ? LIMIT 1', [postId]
        );
        if (!row) return res.status(404).json({ error: 'Post not found' });
        if (row.user_id !== myId) return res.status(403).json({ error: 'Forbidden' });
        if (!row.deleted_at) return res.status(200).json({ status: 'ok', restored: true });

        // ตรวจระยะเวลา
        const [[age]] = await pool.query('SELECT TIMESTAMPDIFF(DAY, ?, NOW()) AS days', [row.deleted_at]);
        if (age.days > env.softDelete.retentionDays) {
            return res.status(410).json({ error: 'Restore window expired' }); // 410 Gone
        }

        await pool.query(
            'UPDATE posts SET deleted_at = NULL, deleted_by = NULL, deleted_reason = NULL, updated_at = NOW() WHERE id = ?',
            [postId]
        );
        return res.status(204).send();
    } catch (e) { return next(e); }
}


/** POST /posts (auth) multipart: files[] + body: caption, location */
export async function createPost(req, res, next) {
    const userId = req.user.id;
    const caption = (req.body?.caption || '').toString();
    const location = (req.body?.location || '').toString() || null;
    const files = req.files || [];

    if (!files.length) {
        return res.status(400).json({ error: 'At least one media file is required' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [rPost] = await conn.query(
            'INSERT INTO posts (user_id, caption, location) VALUES (?, ?, ?)',
            [userId, caption, location]
        );
        const postId = rPost.insertId;

        const values = [];
        files.forEach((f, idx) => {
            const type = mediaTypeOf(f.mimetype);
            const media_url = publicUrlFor(path.join(f.destination, f.filename));
            values.push([postId, media_url, type, null, null, null, idx]);
        });

        await conn.query(
            `INSERT INTO post_media
        (post_id, media_url, media_type, thumb_url, width, height, position)
       VALUES ?`,
            [values]
        );

        // ดึงข้อมูลตอบกลับ
        const [[postRow]] = await conn.query(
            `SELECT p.id, p.caption, p.location, p.created_at,
              u.id AS id, u.username, u.avatar_url,
              0 AS likes, 0 AS comments, 0 AS liked
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = ? LIMIT 1`,
            [postId]
        );
        const [mediaRows] = await conn.query(
            'SELECT * FROM post_media WHERE post_id = ? ORDER BY position ASC',
            [postId]
        );

        await conn.commit(); conn.release();
        return res.status(201).json({ post: shapePost(postRow, mediaRows.map(shapeMedia)) });
    } catch (err) {
        try { await conn.rollback(); } catch { }
        try { conn.release(); } catch { }
        return next(err);
    }
}

/** GET /posts/:id (public; liked ถ้ามี token) */
export async function getPost(req, res, next) {
    const postId = Number(req.params.id);
    const myId = req.user?.id || 0;



    try {
        const [rows] = await pool.query(
            `SELECT p.id, p.caption, p.location, p.created_at,
              u.id AS id, u.username, u.avatar_url,
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments,
              EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked
            FROM posts p
            JOIN users u ON u.id = p.user_id
            WHERE p.id = ? AND p.deleted_at IS NULL LIMIT 1`,
            [myId, postId]
        );

        const ownerId = rows[0].id; // โค้ดเดิม map u.id AS id (เจ้าของโพสต์)
        const allowed = await canViewUserContent(myId, ownerId);
        if (!allowed) return res.status(403).json({ error: 'This account is private' });

        if (!rows.length) return res.status(404).json({ error: 'Post not found' });
        const [mediaRows] = await pool.query(
            'SELECT * FROM post_media WHERE post_id = ? ORDER BY position ASC',
            [postId]
        );
        return res.json({ post: shapePost(rows[0], mediaRows.map(shapeMedia)) });
    } catch (err) {
        return next(err);
    }
}

/** GET /users/:id/posts?limit=20&offset=0 */
export async function listUserPosts(req, res, next) {
    const uid = Number(req.params.id);
    const myId = req.user?.id || 0;

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const allowed = await canViewUserContent(myId, uid);

    if (!allowed) {
        return res.status(403).json({ error: 'This account is private' });
    }

    try {
        const [rows] = await pool.query(
            `SELECT p.id, p.caption, p.location, p.created_at,
              u.id AS id, u.username, u.avatar_url,
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments,
              EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked
            FROM posts p
            JOIN users u ON u.id = p.user_id
            WHERE p.user_id = ? AND p.deleted_at IS NULL
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT ? OFFSET ?`,
            [myId, uid, limit, offset]
        );
        const ids = rows.map(r => r.id);
        let mediaMap = {};
        if (ids.length) {
            const [mediaRows] = await pool.query(
                `SELECT * FROM post_media WHERE post_id IN (${ids.map(() => '?').join(',')})
         ORDER BY post_id ASC, position ASC`,
                ids
            );
            for (const m of mediaRows) {
                (mediaMap[m.post_id] ||= []).push(shapeMedia(m));
            }
        }
        return res.json({
            posts: rows.map(r => shapePost(r, mediaMap[r.id] || [])),
            paging: { limit, offset }
        });
    } catch (err) {
        return next(err);
    }
}

/** GET /feed?limit=20&offset=0 (auth) */
export async function getFeed(req, res, next) {
    const myId = req.user.id;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    try {
        const [rows] = await pool.query(
            `SELECT
         p.id AS post_id, p.caption, p.location, p.created_at,
         u.id AS user_id, u.username AS user_username, u.avatar_url AS user_avatar_url,
         (SELECT COUNT(*) FROM likes    l WHERE l.post_id = p.id) AS likes,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments,
         EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.deleted_at IS NULL AND (p.user_id = ?
          OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?))
       ORDER BY p.created_at DESC, p.id DESC
       LIMIT ? OFFSET ?`,
            [myId, myId, myId, limit, offset]
        );

        // ใช้ post_id เสมอ
        const ids = rows.map(r => r.post_id);
        let mediaMap = {};
        if (ids.length) {
            const [mediaRows] = await pool.query(
                `SELECT * FROM post_media
         WHERE post_id IN (${ids.map(() => '?').join(',')})
         ORDER BY post_id ASC, position ASC`,
                ids
            );
            for (const m of mediaRows) {
                (mediaMap[m.post_id] ||= []).push({
                    id: m.id,
                    url: m.media_url,
                    type: m.media_type,
                    thumb_url: m.thumb_url,
                    width: m.width,
                    height: m.height,
                    duration_ms: m.duration_ms,
                    position: m.position
                });
            }
        }

        return res.json({
            posts: rows.map(r => shapePost(r, mediaMap[r.post_id] || [])),
            paging: { limit, offset }
        });
    } catch (err) {
        return next(err);
    }
}

/** POST /posts/:id/like (auth) */
export async function likePost(req, res, next) {
    const myId = req.user.id;
    const postId = Number(req.params.id);

    try {

        const [[p]] = await pool.query('SELECT deleted_at FROM posts WHERE id = ? LIMIT 1', [postId]);
        if (!p || p.deleted_at) return res.status(404).json({ error: 'Post not found' });

        const [r] = await pool.query(
            'INSERT IGNORE INTO likes (user_id, post_id) VALUES (?, ?)',
            [myId, postId]
        );

        if (r.affectedRows === 1) {
            const [[owner]] = await pool.query('SELECT user_id FROM posts WHERE id = ? LIMIT 1', [postId]);
            if (owner && owner.user_id !== myId) {
                await pool.query(
                    'INSERT INTO notifications (user_id, actor_id, type, ref_id, message) VALUES (?, ?, "like", ?, ?)',
                    [owner.user_id, myId, postId, 'liked your post']
                );
            }
        }

        return res.status(r.affectedRows ? 201 : 200).json({ status: 'ok', liked: true });
    } catch (err) {
        return next(err);
    }
}

/** DELETE /posts/:id/like (auth) */
export async function unlikePost(req, res, next) {
    const myId = req.user.id;
    const postId = Number(req.params.id);
    try {
        await pool.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [myId, postId]);
        return res.json({ status: 'ok', liked: false });
    } catch (err) {
        return next(err);
    }
}

/** POST /posts/:id/comments {text, parent_id?} (auth) */
export async function addComment(req, res, next) {
    const myId = req.user.id;
    const postId = Number(req.params.id);
    const text = (req.body?.text || '').toString().trim();
    const parentId = req.body?.parent_id ? Number(req.body.parent_id) : null;
    if (!text) return res.status(400).json({ error: 'text is required' });




    try {

        const [[p]] = await pool.query('SELECT deleted_at FROM posts WHERE id = ? LIMIT 1', [postId]);
        if (!p || p.deleted_at) return res.status(404).json({ error: 'Post not found' });


        const [r] = await pool.query(
            'INSERT INTO comments (post_id, user_id, text, parent_id) VALUES (?, ?, ?, ?)',
            [postId, myId, text, parentId, 'commented on your post']
        );
        const commentId = r.insertId;
        const [[row]] = await pool.query(
            `SELECT c.id, c.text, c.parent_id, c.created_at,
              u.id AS user_id, u.username, u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ? LIMIT 1`,
            [commentId]
        );
        return res.status(201).json({
            comment: {
                id: row.id,
                text: row.text,
                parent_id: row.parent_id,
                created_at: row.created_at,
                user: { id: row.user_id, username: row.username, avatar_url: row.avatar_url }
            }
        });
    } catch (err) {
        return next(err);
    }
}

/** GET /posts/:id/comments?limit=20&offset=0 (thread flat + parent_id) */
export async function listComments(req, res, next) {
    const postId = Number(req.params.id);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    try {
        const [rows] = await pool.query(
            `SELECT c.id, c.text, c.parent_id, c.created_at,
              u.id AS user_id, u.username, u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC, c.id ASC
       LIMIT ? OFFSET ?`,
            [postId, limit, offset]
        );
        return res.json({
            comments: rows.map(r => ({
                id: r.id,
                text: r.text,
                parent_id: r.parent_id,
                created_at: r.created_at,
                user: { id: r.user_id, username: r.username, avatar_url: r.avatar_url }
            })),
            paging: { limit, offset }
        });
    } catch (err) {
        return next(err);
    }
}

// บังคับ “สิทธิ์เข้าถึง” สำหรับคอนเทนต์ Posts (โปรไฟล์คนอื่น / รายการ / รายละเอียด)
async function canViewUserContent(viewerId, ownerId) {
    if (viewerId === ownerId) return true;
    const [[u]] = await pool.query('SELECT is_private FROM users WHERE id = ? LIMIT 1', [ownerId]);
    if (!u) return false;
    if (u.is_private === 0) return true;
    const [fx] = await pool.query(
        'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1',
        [viewerId, ownerId]
    );
    return fx.length > 0;
}
