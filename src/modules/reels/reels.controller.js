import { pool } from '../../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';


function publicUrl(p) { return '/' + p.replace(/\\/g, '/').replace(/^\/?/, ''); }


// แปลง URL สาธารณะ /uploads/... -> พาธไฟล์จริงในเครื่อง
function filePathFromUrl(publicPath) {
    if (!publicPath) return null;
    const rel = publicPath.replace(/^\//, ''); // ตัด / นำหน้า
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '..', '..', '..'); // ไป root โปรเจกต์
    return path.resolve(projectRoot, rel);
}


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
       WHERE r.deleted_at IS NULL
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

        const [[r0]] = await pool.query('SELECT deleted_at FROM reels WHERE id = ? LIMIT 1', [reelId]);
        if (!r0 || r0.deleted_at) return res.status(404).json({ error: 'Reel not found' });

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


/** DELETE /reels/:id (auth) — ลบรีลของตัวเอง + ลบไฟล์จริง
 *  - จะลบ reel_likes แบบอัตโนมัติ (FK ON DELETE CASCADE)
 */

/** DELETE /reels/:id — Soft delete */
export async function deleteReel(req, res, next) {
    const myId = req.user.id;
    const reelId = Number(req.params.id);
    const reason = (req.body?.reason || '').toString().slice(0, 255) || null;

    try {
        const [[r]] = await pool.query('SELECT user_id, deleted_at FROM reels WHERE id = ? LIMIT 1', [reelId]);
        if (!r) return res.status(404).json({ error: 'Reel not found' });
        if (r.user_id !== myId) return res.status(403).json({ error: 'Forbidden' });
        if (r.deleted_at) return res.status(200).json({ status: 'ok', deleted: true });

        await pool.query(
            'UPDATE reels SET deleted_at = NOW(), deleted_by = ?, deleted_reason = ?, updated_at = NOW() WHERE id = ?',
            [myId, reason, reelId]
        );
        return res.status(204).send();
    } catch (e) { return next(e); }
}


/** PUT /reels/:id/restore — ยกเลิกการลบภายใน retention window */
export async function restoreReel(req, res, next) {
    const myId = req.user.id;
    const reelId = Number(req.params.id);

    try {
        const [[r]] = await pool.query('SELECT user_id, deleted_at FROM reels WHERE id = ? LIMIT 1', [reelId]);
        if (!r) return res.status(404).json({ error: 'Reel not found' });
        if (r.user_id !== myId) return res.status(403).json({ error: 'Forbidden' });
        if (!r.deleted_at) return res.status(200).json({ status: 'ok', restored: true });

        const [[age]] = await pool.query('SELECT TIMESTAMPDIFF(DAY, ?, NOW()) AS days', [r.deleted_at]);
        if (age.days > env.softDelete.retentionDays) {
            return res.status(410).json({ error: 'Restore window expired' });
        }

        await pool.query(
            'UPDATE reels SET deleted_at = NULL, deleted_by = NULL, deleted_reason = NULL, updated_at = NOW() WHERE id = ?',
            [reelId]
        );
        return res.status(204).send();
    } catch (e) { return next(e); }
}
