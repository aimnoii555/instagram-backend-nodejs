import { pool } from '../../config/db.js';
import path from 'path';

function publicUrl(p) { return '/' + p.replace(/\\/g, '/').replace(/^\/?/, ''); }

export async function createReel(req, res, next) {
    try {
        const userId = req.user.id;
        const file = req.file;
        if (!file || !file.mimetype.startsWith('video/')) {
            return res.status(400).json({ error: 'video file is required' });
        }
        const video_url = publicUrl(path.join(file.destination, file.filename));
        const caption = (req.body?.caption || '').toString();

        const [r] = await pool.query(
            'INSERT INTO reels (user_id, video_url, caption) VALUES (?, ?, ?)',
            [userId, video_url, caption]
        );
        return res.status(201).json({ reel: { id: r.insertId, video_url, caption } });
    } catch (e) { return next(e); }
}

export async function listReels(req, res, next) {
    const myId = req.user?.id || 0;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    try {
        const [rows] = await pool.query(
            `SELECT r.id, r.video_url, r.thumb_url, r.caption, r.duration_ms, r.created_at,
              u.id AS user_id, u.username, u.avatar_url,
              (SELECT COUNT(*) FROM reel_likes rl WHERE rl.reel_id = r.id) AS likes,
              EXISTS(SELECT 1 FROM reel_likes rl WHERE rl.reel_id = r.id AND rl.user_id = ?) AS liked
       FROM reels r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT ? OFFSET ?`,
            [myId, limit, offset]
        );
        return res.json({
            reels: rows.map(r => ({
                id: r.id, video_url: r.video_url, thumb_url: r.thumb_url,
                caption: r.caption ?? null, duration_ms: r.duration_ms ?? null,
                created_at: r.created_at,
                user: { id: r.user_id, username: r.username, avatar_url: r.avatar_url },
                likes: Number(r.likes || 0), liked: !!r.liked
            })), paging: { limit, offset }
        });
    } catch (e) { return next(e); }
}

export async function likeReel(req, res, next) {
    try {
        const myId = req.user.id;
        const reelId = Number(req.params.id);
        const [r] = await pool.query('INSERT IGNORE INTO reel_likes (user_id, reel_id) VALUES (?, ?)', [myId, reelId]);

        // แจ้งเตือนเจ้าของรีล (ถ้าเพิ่งไลก์ใหม่)
        if (r.affectedRows === 1) {
            const [[owner]] = await pool.query('SELECT user_id FROM reels WHERE id = ? LIMIT 1', [reelId]);
            if (owner && owner.user_id !== myId) {
                await pool.query(
                    'INSERT INTO notifications (user_id, actor_id, type, ref_id, message) VALUES (?, ?, "like", ?, ?)',
                    [owner.user_id, myId, reelId, 'liked your reel']
                );
            }
        }
        return res.status(r.affectedRows ? 201 : 200).json({ status: 'ok', liked: true });
    } catch (e) { return next(e); }
}

export async function unlikeReel(req, res, next) {
    try {
        const myId = req.user.id;
        const reelId = Number(req.params.id);
        await pool.query('DELETE FROM reel_likes WHERE user_id = ? AND reel_id = ?', [myId, reelId]);
        return res.json({ status: 'ok', liked: false });
    } catch (e) { return next(e); }
}
