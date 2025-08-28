import { pool } from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';


function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}
function normalizeUsername(username) {
    return String(username || '').trim();
}

// >>> เพิ่มฟังก์ชันนี้ <<<
function shapeUser(row) {
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        name: row.name ?? null,
        avatar_url: row.avatar_url ?? null,
        bio: row.bio ?? null,
        is_private: Number(row.is_private ?? 0),
    };
}


export async function register(req, res, next) {
    const { username, email, password } = req.body || {};

    try {
        // validate เบื้องต้น
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email, password are required' });
        }
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ error: 'username length must be 3-30 chars' });
        }
        const emailNorm = normalizeEmail(email);
        const usernameNorm = normalizeUsername(username);

        // เช็คซ้ำ
        const [dupRows] = await pool.query(
            'SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1',
            [usernameNorm, emailNorm]
        );
        if (dupRows.length) {
            const exists = dupRows[0];
            if (exists.username === usernameNorm) {
                return res.status(409).json({ error: 'Username already taken' });
            }
            if (exists.email === emailNorm) {
                return res.status(409).json({ error: 'Email already registered' });
            }
        }

        // แฮชรหัสผ่าน
        const passwordHash = await hashPassword(password);

        // ใช้ transaction เผื่อขยายต่อ
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.query(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                [usernameNorm, emailNorm, passwordHash]
            );

            const userId = result.insertId;

            // สร้าง tokens
            const access_token = signAccessToken({ sub: userId, username: usernameNorm });
            const refresh_token = signRefreshToken({ sub: userId });

            // เก็บ refresh token (สำหรับ logout/invalidate ภายหลัง)
            await conn.query(
                'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
                [userId, refresh_token]
            );

            await conn.commit();
            conn.release();

            const user = {
                id: userId,
                username: usernameNorm,
                email: emailNorm,
                name: null,
                avatar_url: null,
                bio: null,
                is_private: 0
            };

            return res.status(201).json({
                user,
                tokens: {
                    token_type: 'Bearer',
                    access_token,
                    refresh_token,
                    // ให้ client รู้คร่าวๆว่า access หมดอายุประมาณเท่าไร (เลือกใส่/ไม่ใส่ก็ได้)
                    expires_in: 15 * 60 // วินาที (15 นาที ตาม .env)
                }
            });
        } catch (txErr) {
            try { await conn.rollback(); } catch { }
            try { conn.release(); } catch { }
            return next(txErr);
        }
    } catch (err) {
        return next(err);
    }
}


export async function login(req, res, next) {
    const { username, email, password } = req.body || {};
    try {
        // ต้องส่ง "username หรือ email" อย่างน้อยหนึ่ง + password
        if ((!username && !email) || !password) {
            return res.status(400).json({ error: 'Provide username or email, and password' });
        }

        const identifier = username ? normalizeUsername(username) : normalizeEmail(email);

        // เลือกคิวรีตามชนิด identifier
        const sql = username
            ? 'SELECT id, username, email, password_hash, name, avatar_url, bio, is_private FROM users WHERE username = ? LIMIT 1'
            : 'SELECT id, username, email, password_hash, name, avatar_url, bio, is_private FROM users WHERE email = ? LIMIT 1';

        const [rows] = await pool.query(sql, [identifier]);
        if (!rows.length) {
            // ไม่บอกว่า user หรือ password ผิด เพื่อความปลอดภัย
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const userRow = rows[0];

        const ok = await comparePassword(password, userRow.password_hash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const access_token = signAccessToken({ sub: userRow.id, username: userRow.username });
        const refresh_token = signRefreshToken({ sub: userRow.id });

        // เก็บ refresh token ใหม่ (รองรับ many devices)
        await pool.query('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [userRow.id, refresh_token]);

        return res.json({
            user: shapeUser(userRow),
            tokens: {
                token_type: 'Bearer',
                access_token,
                refresh_token,
                expires_in: 900 // 15 นาที ตาม .env
            }
        });
    } catch (err) {
        return next(err);
    }
}


/** ========== REFRESH (Rotate + revoke ตัวเก่า) ========== */
export async function refresh(req, res, next) {
    const { refresh_token } = req.body || {};
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

    try {
        // 1) ตรวจลายเซ็นและอายุ
        const payload = verifyRefreshToken(refresh_token); // จะ throw หากหมดอายุ/ปลอม
        const userId = payload?.sub;
        if (!userId) return res.status(401).json({ error: 'Invalid refresh token' });

        // 2) ต้องพบ token ในฐานข้อมูลและยังไม่ถูก revoke
        const [rows] = await pool.query(
            'SELECT id, user_id, token, revoked FROM refresh_tokens WHERE token = ? LIMIT 1',
            [refresh_token]
        );
        if (!rows.length) return res.status(401).json({ error: 'Invalid refresh token' });
        const rt = rows[0];
        if (rt.revoked) return res.status(401).json({ error: 'Refresh token already used/revoked' });

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // 3) เพิกถอนของเดิม
            await conn.query('UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW() WHERE id = ?', [rt.id]);

            // 4) สร้าง refresh token ใหม่ + บันทึก
            const newRefresh = signRefreshToken({ sub: userId });
            await conn.query('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [userId, newRefresh]);

            // 5) ออก access token ใหม่ (เติม username ลง payload เพื่อสะดวกฝั่ง client)
            const [[u]] = await conn.query('SELECT username FROM users WHERE id = ? LIMIT 1', [userId]);
            const access = signAccessToken({ sub: userId, username: u?.username });

            await conn.commit();
            conn.release();

            return res.json({
                token_type: 'Bearer',
                access_token: access,
                refresh_token: newRefresh,
                expires_in: 900
            });
        } catch (txErr) {
            try { await conn.rollback(); } catch { }
            try { conn.release(); } catch { }
            return next(txErr);
        }
    } catch (err) {
        // jwt verify fail, expired, malformed
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
}

/** ========== LOGOUT ==========
 * เพิกถอน refresh token หนึ่งตัว (หรือทั้งหมดของผู้ใช้ ถ้าส่ง all=true)
 */
export async function logout(req, res, next) {

    const { refresh_token, all } = req.body || {};
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });



    // เราจะพยายาม decode เพื่อรู้ user_id (ถ้าทำได้)
    let userId = null;
    try {
        const payload = verifyRefreshToken(refresh_token);
        userId = payload?.sub ?? null;
    } catch {
        // ถ้า token หมดอายุ/ปลอม ก็ยังเพิกถอนใน DB ตามสตริงที่ส่งมาได้
    }

    try {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            if (all === true && userId) {
                // logout ทุก device ของผู้ใช้คนนี้
                await conn.query(
                    'UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW() WHERE user_id = ? AND revoked = 0',
                    [userId]
                );
            } else {
                // เพิกถอนเฉพาะตัวที่ส่งมา
                await conn.query(
                    'UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW() WHERE token = ? AND revoked = 0',
                    [refresh_token]
                );
            }

            await conn.commit();
            conn.release();
            return res.status(204).send(); // ไม่มีเนื้อหา
        } catch (txErr) {
            try { await conn.rollback(); } catch { }
            try { conn.release(); } catch { }
            return next(txErr);
        }
    } catch (err) {
        return next(err);
    }
}
