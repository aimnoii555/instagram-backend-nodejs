import { pool } from '../../config/db.js';
import path from 'path';

function publicUrl(p) { return '/' + p.replace(/\\/g, '/').replace(/^\/?/, ''); }

export async function createStory(req, res, next) {
    try {
        const userId = req.user.id;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'file is required' });

        const media_url = publicUrl(path.join(file.destination, file.filename));
        const media_type = file.mimetype.startsWith('video/') ? 'video' : 'image';

        const expiresSQL = 'NOW() + INTERVAL 1 DAY';
        const [r] = await pool.query(
            `INSERT INTO stories (user_id, media_url, media_type, expires_at) VALUES (?, ?, ?, ${expiresSQL})`,
            [userId, media_url, media_type]
        );
        const storyId = r.insertId;

        return res.status(201).json({
            story: { id: storyId, media_url, media_type, expires_in_seconds: 86400 }
        });
    } catch (e) { return next(e); }
}

export async function listStoriesFeed(req, res, next) {
    try {
        const myId = req.user.id;
        const [rows] = await pool.query(
            `SELECT s.id, s.user_id, s.media_url, s.media_type, s.expires_at, s.created_at,
              u.username, u.avatar_url,
              EXISTS(SELECT 1 FROM story_views v WHERE v.story_id = s.id AND v.viewer_id = ?) AS viewed
       FROM stories s
       JOIN users u ON u.id = s.user_id
       WHERE s.expires_at > NOW()
         AND (s.user_id = ? OR s.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?))
       ORDER BY s.user_id ASC, s.created_at DESC`,
            [myId, myId, myId]
        );

        // รวมเป็น group ต่อ user: {user, stories:[...]}
        const map = new Map();
        for (const r of rows) {
            if (!map.has(r.user_id)) {
                map.set(r.user_id, {
                    user: { id: r.user_id, username: r.username, avatar_url: r.avatar_url },
                    stories: []
                });
            }
            map.get(r.user_id).stories.push({
                id: r.id, media_url: r.media_url, media_type: r.media_type,
                created_at: r.created_at, expires_at: r.expires_at, viewed: !!r.viewed
            });
        }
        return res.json({ items: Array.from(map.values()) });
    } catch (e) { return next(e); }
}

export async function markStoryViewed(req, res, next) {
    try {
        const storyId = Number(req.params.id);
        const myId = req.user.id;
        await pool.query(
            'INSERT IGNORE INTO story_views (story_id, viewer_id) VALUES (?, ?)',
            [storyId, myId]
        );
        return res.status(204).send();
    } catch (e) { return next(e); }
}

export async function listUserStories(req, res, next) {
    try {
        const uid = Number(req.params.id);
        const myId = req.user.id;

        const allowed = await (async () => {
            if (myId === uid) return true;

            const [[u]] = await pool.query('SELECT is_private FROM users WHERE id = ? LIMIT 1', [uid]);

            if (!u) return false;

            if (u.is_private === 0) return true;

            const [fx] = await pool.query(
                'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1',
                [myId, uid]
            );
        return fx.length > 0;
        })();

        if (!allowed) return res.status(403).json({ error: 'This account is private' });


        // (ในอนาคต: เช็ค privacy/blocked/close-friends ตามต้องการ)
        const [rows] = await pool.query(
            `SELECT s.id, s.media_url, s.media_type, s.expires_at, s.created_at,
              EXISTS(SELECT 1 FROM story_views v WHERE v.story_id = s.id AND v.viewer_id = ?) AS viewed
       FROM stories s
       WHERE s.user_id = ? AND s.expires_at > NOW()
       ORDER BY s.created_at DESC`,
            [myId, uid]
        );
        return res.json({
            stories: rows.map(r => ({
                id: r.id, media_url: r.media_url, media_type: r.media_type,
                created_at: r.created_at, expires_at: r.expires_at, viewed: !!r.viewed
            }))
        });
    } catch (e) { return next(e); }
}
