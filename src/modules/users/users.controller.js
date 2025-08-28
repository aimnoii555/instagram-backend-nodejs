import { pool } from '../../config/db.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import { env } from '../../config/env.js';


function shapeUser(row) {
    return {
        id: row.id,
        username: row.username,
        email: row.email ?? null,      // สำหรับ /me จะมี email; public profile จะไม่คืน email
        name: row.name ?? null,
        avatar_url: row.avatar_url ?? null,
        bio: row.bio ?? null,
        website: row.website ?? null,
        is_private: row.is_private ?? 0,
        created_at: row.created_at
    };
}

function pick(str, max) {
    if (str == null) return null;
    const s = String(str).trim();
    if (!s) return null;
    return s.slice(0, max);
}

function normWebsite(url) {
    if (!url) return null;
    let t = String(url).trim();
    if (!t) return null;
    if (!/^https?:\/\//i.test(t)) t = 'https://' + t;
    return t.slice(0, 255);
}

/** GET /users/:username → โปรไฟล์ + นับโพสต์/ผู้ติดตาม/กำลังติดตาม + is_following (ถ้าล็อกอิน) */
export async function getPublicProfileByUsername(req, res, next) {
    const { username } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT id, username, name, avatar_url, bio, website, is_private, created_at
            FROM users WHERE username = ? LIMIT 1`,
            [username]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        const u = rows[0];

        const userId = u.id;

        const [[postCount]] = await pool.query(
            'SELECT COUNT(*) AS posts FROM posts WHERE user_id = ?',
            [userId]
        );
        const [[followersCount]] = await pool.query(
            'SELECT COUNT(*) AS followers FROM follows WHERE following_id = ?',
            [userId]
        );
        const [[followingCount]] = await pool.query(
            'SELECT COUNT(*) AS following FROM follows WHERE follower_id = ?',
            [userId]
        );

        // เช็คว่า "ฉัน" ติดตามเขาไหม (ถ้ามี token)
        let is_following = false;
        if (req.user?.id) {
            const myId = req.user.id;
            const [fx] = await pool.query(
                'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1',
                [myId, userId]
            );
            is_following = fx.length > 0;
        }

        // โปรไฟล์: บอกสถานะ pending ให้ชัด
        let pending = false;
        if (req.user?.id) {
            const myId = req.user.id;
            const [pr] = await pool.query(
                'SELECT 1 FROM follow_requests WHERE follower_id = ? AND following_id = ? LIMIT 1',
                [myId, userId]
            );
            pending = pr.length > 0;
        }

        return res.json({
            user: {
                ...shapeUser(u),
                email: undefined  // ไม่โชว์อีเมลใน public profile
            },
            stats: {
                posts: Number(postCount.posts || 0),
                followers: Number(followersCount.followers || 0),
                following: Number(followingCount.following || 0)
            },
            is_following,
            pending
        });
    } catch (err) {
        return next(err);
    }
}


/** GET /me/trash?type=post|reel&limit=20&offset=0
 * รายการที่ลบแบบ soft ภายใน retention window พร้อม days_left
 * response.items: [{ type, id, deleted_at, days_left, ... }]
 */
export async function getTrash(req, res, next) {
    try {
        const myId = req.user.id;
        const type = (req.query.type || 'post').toString().toLowerCase();
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        const R = env.softDelete.retentionDays;

        if (!['post', 'reel'].includes(type)) {
            return res.status(400).json({ error: "type must be 'post' or 'reel'" });
        }

        if (type === 'post') {
            const [rows] = await pool.query(
                `SELECT p.id, p.caption, p.location, p.deleted_at,
                GREATEST(0, ? - TIMESTAMPDIFF(DAY, p.deleted_at, NOW())) AS days_left
                FROM posts p
                WHERE p.user_id = ?
                AND p.deleted_at IS NOT NULL
                AND TIMESTAMPDIFF(DAY, p.deleted_at, NOW()) <= ?
                ORDER BY p.deleted_at DESC, p.id DESC
                LIMIT ? OFFSET ?`,
                [R, myId, R, limit, offset]
            );

            // ดึง media ทุกชิ้นของโพสต์เหล่านี้ (ไว้ทำ preview/grid)
            const ids = rows.map(r => r.id);
            let mediaMap = {};
            if (ids.length) {
                const [media] = await pool.query(
                    `SELECT id, post_id, media_url, media_type, position
                    FROM post_media
                    WHERE post_id IN (${ids.map(() => '?').join(',')})
                    ORDER BY post_id ASC, position ASC`,
                    ids
                );
                for (const m of media) {
                    (mediaMap[m.post_id] ||= []).push({
                        id: m.id,
                        url: m.media_url,
                        type: m.media_type,
                        position: m.position
                    });
                }
            }

            return res.json({
                items: rows.map(r => ({
                    type: 'post',
                    id: r.id,
                    caption: r.caption ?? null,
                    location: r.location ?? null,
                    deleted_at: r.deleted_at,
                    days_left: Number(r.days_left || 0),
                    media: mediaMap[r.id] || []
                })),
                paging: { limit, offset },
                meta: { retention_days: R }
            });
        }

        // type === 'reel'
        const [rows] = await pool.query(
            `SELECT r.id, r.video_url, r.thumb_url, r.caption, r.deleted_at,
              GREATEST(0, ? - TIMESTAMPDIFF(DAY, r.deleted_at, NOW())) AS days_left
            FROM reels r
            WHERE r.user_id = ?
                AND r.deleted_at IS NOT NULL
                AND TIMESTAMPDIFF(DAY, r.deleted_at, NOW()) <= ?
            ORDER BY r.deleted_at DESC, r.id DESC
            LIMIT ? OFFSET ?`,
            [R, myId, R, limit, offset]
        );

        return res.json({
            items: rows.map(r => ({
                type: 'reel',
                id: r.id,
                video_url: r.video_url,
                thumb_url: r.thumb_url,
                caption: r.caption ?? null,
                deleted_at: r.deleted_at,
                days_left: Number(r.days_left || 0)
            })),
            paging: { limit, offset },
            meta: { retention_days: R }
        });
    } catch (e) {
        return next(e);
    }
}




/** PUT /me/password
 * body: { current_password, new_password }
 * - ตรวจ current_password
 * - อัปเดต password_hash
 * - revoke refresh token ทั้งหมดของผู้ใช้ (ให้ล็อกอินใหม่)
 */
export async function changePassword(req, res, next) {
    try {
        const myId = req.user.id;
        const current_password = (req.body?.current_password || '').toString();
        const new_password = (req.body?.new_password || '').toString();

        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'current_password and new_password are required' });
        }
        if (new_password.length < 8) {
            return res.status(400).json({ error: 'new_password must be at least 8 characters' });
        }

        const [[row]] = await pool.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [myId]);
        if (!row) return res.status(404).json({ error: 'User not found' });

        const ok = await comparePassword(current_password, row.password_hash);
        if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

        const newHash = await hashPassword(new_password);

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            await conn.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newHash, myId]);
            // revoke refresh ทั้งหมด (ทุกอุปกรณ์ต้องล็อกอินใหม่)
            await conn.query('UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW() WHERE user_id = ? AND revoked = 0', [myId]);
            await conn.commit(); conn.release();
        } catch (txErr) {
            try { await conn.rollback(); } catch { }
            try { conn.release(); } catch { }
            return next(txErr);
        }

        return res.status(204).send(); // ให้ client พา user ไป login ใหม่
    } catch (e) { return next(e); }
}



/** GET /me (auth) → ข้อมูลตัวเอง + สถิติ */
export async function getMe(req, res, next) {
    try {
        const myId = req.user.id;

        const [rows] = await pool.query(
            `SELECT id, username, email, name, avatar_url, bio, website, is_private, created_at
       FROM users WHERE id = ? LIMIT 1`,
            [myId]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        const me = rows[0];

        const [[postCount]] = await pool.query(
            'SELECT COUNT(*) AS posts FROM posts WHERE user_id = ?',
            [myId]
        );
        const [[followersCount]] = await pool.query(
            'SELECT COUNT(*) AS followers FROM follows WHERE following_id = ?',
            [myId]
        );
        const [[followingCount]] = await pool.query(
            'SELECT COUNT(*) AS following FROM follows WHERE follower_id = ?',
            [myId]
        );

        return res.json({
            user: shapeUser(me),
            stats: {
                posts: Number(postCount.posts || 0),
                followers: Number(followersCount.followers || 0),
                following: Number(followingCount.following || 0)
            }
        });
    } catch (err) {
        return next(err);
    }
}

/** PUT /me (auth) → อัปเดต name, bio, website, avatar_url */
export async function updateMe(req, res, next) {
    try {
        const myId = req.user.id;
        const name = pick(req.body?.name, 100);
        const bio = pick(req.body?.bio, 150);
        const website = normWebsite(req.body?.website);
        const avatar_url = pick(req.body?.avatar_url, 500);

        const [result] = await pool.query(
            `UPDATE users SET
         name = ?, bio = ?, website = ?, avatar_url = ?,
         updated_at = NOW()
       WHERE id = ?`,
            [name, bio, website, avatar_url, myId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // ส่งข้อมูลล่าสุดกลับ
        const [[me]] = await pool.query(
            `SELECT id, username, email, name, avatar_url, bio, website, is_private, created_at
       FROM users WHERE id = ? LIMIT 1`,
            [myId]
        );

        return res.json({ user: shapeUser(me) });
    } catch (err) {
        return next(err);
    }
}

/** POST /users/:id/follow (auth) */
export async function followUser(req, res, next) {
    try {
        const myId = req.user.id;
        const targetId = Number(req.params.id);

        if (!targetId || targetId === myId) {
            return res.status(400).json({ error: 'Invalid target user' });
        }


        // มีผู้ใช้ปลายทางจริงไหม
        const [[target]] = await pool.query('SELECT id,is_private FROM users WHERE id = ? LIMIT 1', [targetId]);

        if (!target) return res.status(404).json({ error: 'User not found' });

        if (target.is_private) {
            // ถ้า private → สร้างคำขอ (pending) แทนการ follow ทันที
            await pool.query(
                'INSERT IGNORE INTO follow_requests (follower_id, following_id) VALUES (?, ?)',
                [myId, targetId]
            );
            return res.status(202).json({
                status: 'pending',
                following: false,
                pending: true
            });
        }


        // ใช้ INSERT IGNORE เพราะมี PK (follower_id, following_id)
        // public → follow ได้ทันที
        const [result] = await pool.query(
            'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
            [myId, targetId]
        );


        const newlyFollowed = result.affectedRows === 1;
        if (newlyFollowed && targetId !== myId) {
            await pool.query(
                'INSERT INTO notifications (user_id, actor_id, type, ref_id, message) VALUES (?, ?, "follow", ?, ?)',
                [targetId, myId, targetId, 'started following you']
            );
        }

        return res.status(newlyFollowed ? 201 : 200).json({
            status: 'ok',
            following: true,
            newly_followed: newlyFollowed,
            pendding: false
        });
    } catch (err) {
        return next(err);
    }
}

/** DELETE /users/:id/follow (auth) */
/** DELETE /users/:id/follow (auth)
 *  - ถ้าฟอลโลว์อยู่ → ยกเลิกฟอลโลว์
 *  - ถ้าไม่ได้ฟอลโลว์แต่มี pending request → ยกเลิกคำขอ
 */
export async function unfollowUser(req, res, next) {
    try {
        const myId = req.user.id;
        const targetId = Number(req.params.id);
        if (!targetId || targetId === myId) {
            return res.status(400).json({ error: 'Invalid target user' });
        }

        const [delFollow] = await pool.query(
            'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
            [myId, targetId]);


        const [result] = await pool.query(
            'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
            [myId, targetId]
        );

        let canceledRequest = false;
        if (!delFollow.affectedRows) {
            const [delReq] = await pool.query(
                'DELETE FROM follow_requests WHERE follower_id = ? AND following_id = ?',
                [myId, targetId]);

            canceledRequest = delReq.affectedRows > 0;
        }


        return res.status(result.affectedRows ? 200 : 200).json({
            status: 'ok',
            following: false,
            removed: result.affectedRows > 0,
            pedding: false,
            canceled_request: canceledRequest
        });
    } catch (err) {
        return next(err);
    }
}

/** GET /users/:id/followers?limit=20&offset=0 */
export async function listFollowers(req, res, next) {
    try {
        const targetId = Number(req.params.id);
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        const myId = req.user?.id || null;

        // คนที่ "ติดตามเขา"
        const [rows] = await pool.query(
            `SELECT u.id, u.username, u.name, u.avatar_url, u.bio, u.website, u.is_private, f.created_at
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
            [targetId, limit, offset]
        );

        // ถ้าล็อกอิน เพิ่ม is_following(ฉัน→เขาคนนั้น)
        let mapFollowing = {};
        if (myId && rows.length) {
            const ids = rows.map(r => r.id);
            const [fx] = await pool.query(
                `SELECT following_id FROM follows WHERE follower_id = ? AND following_id IN (${ids.map(() => '?').join(',')})`,
                [myId, ...ids]
            );
            for (const r of fx) mapFollowing[r.following_id] = true;
        }

        return res.json({
            users: rows.map(r => ({
                id: r.id,
                username: r.username,
                name: r.name ?? null,
                avatar_url: r.avatar_url ?? null,
                bio: r.bio ?? null,
                website: r.website ?? null,
                is_private: r.is_private ?? 0,
                followed_at: r.created_at,     // เวลาเริ่มติดตาม
                is_following: !!mapFollowing[r.id] // ฉันกำลังติดตามเขาไหม
            })),
            paging: { limit, offset }
        });
    } catch (err) {
        return next(err);
    }
}

/** GET /users/:id/following?limit=20&offset=0 */
export async function listFollowing(req, res, next) {
    try {
        const targetId = Number(req.params.id);
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        const myId = req.user?.id || null;

        // คนที่ "เขาไปติดตาม"
        const [rows] = await pool.query(
            `SELECT u.id, u.username, u.name, u.avatar_url, u.bio, u.website, u.is_private, f.created_at
       FROM follows f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
            [targetId, limit, offset]
        );

        // ถ้าล็อกอิน เพิ่ม is_following(ฉัน→เขาคนนั้น)
        let mapFollowing = {};
        if (myId && rows.length) {
            const ids = rows.map(r => r.id);
            const [fx] = await pool.query(
                `SELECT following_id FROM follows WHERE follower_id = ? AND following_id IN (${ids.map(() => '?').join(',')})`,
                [myId, ...ids]
            );
            for (const r of fx) mapFollowing[r.following_id] = true;
        }

        return res.json({
            users: rows.map(r => ({
                id: r.id,
                username: r.username,
                name: r.name ?? null,
                avatar_url: r.avatar_url ?? null,
                bio: r.bio ?? null,
                website: r.website ?? null,
                is_private: r.is_private ?? 0,
                followed_at: r.created_at,         // เวลาเริ่ม follow เขา
                is_following: !!mapFollowing[r.id] // ฉันกำลังติดตามเขาไหม
            })),
            paging: { limit, offset }
        });
    } catch (err) {
        return next(err);
    }
}

// ดู/อนุมัติ/ปฏิเสธคำขอติดตาม
/** GET /me/follow-requests */
export async function listFollowRequestsIncoming(req, res, next) {
    try {
        const myId = req.user.id;
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);

        const [rows] = await pool.query(
            `SELECT fr.follower_id AS id, u.username, u.name, u.avatar_url, fr.created_at
       FROM follow_requests fr
       JOIN users u ON u.id = fr.follower_id
       WHERE fr.following_id = ?
       ORDER BY fr.created_at DESC
       LIMIT ? OFFSET ?`,
            [myId, limit, offset]
        );

        return res.json({
            requests: rows.map(r => ({
                follower: { id: r.id, username: r.username, name: r.name ?? null, avatar_url: r.avatar_url ?? null },
                requested_at: r.created_at
            })),
            paging: { limit, offset }
        });
    } catch (e) { return next(e); }
}




/** POST /follow-requests/:followerId/accept */
export async function acceptFollowRequest(req, res, next) {
    try {
        const myId = req.user.id; // ผู้รับคำขอ (ฉัน)
        const followerId = Number(req.params.followerId);

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // ต้องมีคำขอจริง
            const [reqRows] = await conn.query(
                'SELECT 1 FROM follow_requests WHERE follower_id = ? AND following_id = ? LIMIT 1',
                [followerId, myId]
            );
            if (!reqRows.length) {
                await conn.rollback(); conn.release();
                return res.status(404).json({ error: 'Request not found' });
            }

            // สร้าง follow + ลบคำขอ
            await conn.query(
                'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
                [followerId, myId]
            );
            await conn.query(
                'DELETE FROM follow_requests WHERE follower_id = ? AND following_id = ?',
                [followerId, myId]
            );

            // แจ้งเตือนผู้ที่ร้องขอว่า "คำขอถูกยอมรับ"
            await conn.query(
                'INSERT INTO notifications (user_id, actor_id, type, ref_id, message) VALUES (?, ?, "follow", ?, ?)',
                [followerId, myId, myId, 'accepted your follow request']
            );

            await conn.commit(); conn.release();
            return res.status(204).send();
        } catch (txErr) {
            try { await conn.rollback(); } catch { }
            try { conn.release(); } catch { }
            return next(txErr);
        }
    } catch (e) { return next(e); }
}

/** POST /follow-requests/:followerId/decline */
export async function declineFollowRequest(req, res, next) {
    try {
        const myId = req.user.id;
        const followerId = Number(req.params.followerId);

        const [r] = await pool.query(
            'DELETE FROM follow_requests WHERE follower_id = ? AND following_id = ?',
            [followerId, myId]
        );
        if (!r.affectedRows) return res.status(404).json({ error: 'Request not found' });
        return res.status(204).send();
    } catch (e) { return next(e); }
}
