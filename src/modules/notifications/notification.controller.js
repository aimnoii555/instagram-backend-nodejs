import { pool } from '../../config/db.js';

export async function listNotifications(req, res, next) {
    try {
        const myId = req.user.id;
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);

        const [rows] = await pool.query(
            `SELECT n.id, n.type, n.ref_id, n.message, n.is_read, n.created_at,
              a.id AS actor_id, a.username AS actor_username, a.avatar_url AS actor_avatar
       FROM notifications n
       JOIN users a ON a.id = n.actor_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC, n.id DESC
       LIMIT ? OFFSET ?`,
            [myId, limit, offset]
        );

        return res.json({
            notifications: rows.map(r => ({
                id: r.id,
                type: r.type,
                ref_id: r.ref_id,
                message: r.message,
                is_read: !!r.is_read,
                created_at: r.created_at,
                actor: { id: r.actor_id, username: r.actor_username, avatar_url: r.actor_avatar }
            })),
            paging: { limit, offset }
        });
    } catch (e) { return next(e); }
}

export async function markRead(req, res, next) {
    try {
        const myId = req.user.id;
        const id = Number(req.params.id);
        await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, myId]);
        return res.status(204).send();
    } catch (e) { return next(e); }
}

export async function markAllRead(req, res, next) {
    try {
        const myId = req.user.id;
        await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [myId]);
        return res.status(204).send();
    } catch (e) { return next(e); }
}
