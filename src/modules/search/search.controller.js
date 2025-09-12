import { pool } from '../../config/db.js';

export async function search(req, res, next) {
    const q = (req.query.q || '').toString().trim();
    const limitUsers = Math.min(Number(req.query.u) || 8, 25);
    const limitPosts = Math.min(Number(req.query.p) || 12, 50);
    const myId = req.user?.id || 0;

    if (!q) return res.json({ users: [], posts: [] });

    try {
        // Users by username/name
        const [users] = await pool.query(
            `SELECT id, username, name, avatar_url, bio, is_private
       FROM users
       WHERE username LIKE ? OR name LIKE ?
       ORDER BY username ASC
       LIMIT ?`,
            [`%${q}%`, `%${q}%`, limitUsers]
        );

        // Posts by caption keyword (top by likes)
    //     const [posts] = await pool.query(
    //         `SELECT p.id, p.caption, p.location, p.created_at,
    //           u.id AS id, u.username, u.avatar_url,
    //           (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
    //           (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments,
    //           EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked
    //    FROM posts p
    //    JOIN users u ON u.id = p.user_id
    //    WHERE p.caption LIKE ?
    //    ORDER BY likes DESC, p.created_at DESC
    //    LIMIT ?`,
    //         [myId, `%${q}%`, limitPosts]
    //     );

        const [posts] = await pool.query(
            `SELECT p.id, p.caption, p.location, p.created_at,
                    u.id AS id, u.username, u.avatar_url, u.is_private,
                    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
                    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments,
                    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked
            FROM posts p
            JOIN users u ON u.id = p.user_id
            WHERE p.deleted_at IS NULL AND p.caption LIKE ?
                AND (
                u.is_private = 0
                OR u.id = ?
                OR u.id IN (SELECT following_id FROM follows WHERE follower_id = ?)
                )
            ORDER BY likes DESC, p.created_at DESC
            LIMIT ?`,
            [myId, `%${q}%`, myId, myId, limitPosts]
        );



        // media 1 ชิ้นแรกไว้ทำ grid
        const ids = posts.map(p => p.id);
        let cover = {};
        if (ids.length) {
            const [media] = await pool.query(
                `SELECT pm.post_id, pm.media_url, pm.media_type, pm.position
         FROM post_media pm
         WHERE pm.post_id IN (${ids.map(() => '?').join(',')})
         ORDER BY pm.post_id ASC, pm.position ASC`,
                ids
            );
            for (const m of media) if (cover[m.post_id] == null || m.position < cover[m.post_id].position)
                cover[m.post_id] = m;
        }

        return res.json({
            users: users.map(u => ({
                id: u.id, username: u.username, name: u.name ?? null,
                avatar_url: u.avatar_url ?? null, bio: u.bio ?? null, is_private: u.is_private ?? 0
            })),
            posts: posts.map(p => ({
                id: p.id, caption: p.caption ?? null, location: p.location ?? null,
                created_at: p.created_at,
                user: { id: p.id, username: p.username, avatar_url: p.avatar_url },
                likes: Number(p.likes || 0), comments: Number(p.comments || 0),
                liked: !!p.liked,
                cover: cover[p.id] ? { url: cover[p.id].media_url, type: cover[p.id].media_type } : null
            }))
        });
    } catch (e) {
        return next(e);
    }
}


