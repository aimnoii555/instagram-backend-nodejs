// import { pool } from '../config/db.js';
// import { hashPassword, verifyPassword } from '../utils/password.js';
// import { signAccessToken, signRefreshToken, verifyRefreshToken, sha256 } from '../utils/tokens.js';
// import { add } from 'date-fns';

// function userPublic(u) {
//   return {
//     id: u.id,
//     username: u.username,
//     email: u.email,
//     name: u.name,
//     avatar_url: u.avatar_url,
//     is_private: Boolean(u.is_private),
//     created_at: u.created_at,
//   };
// }

// export async function register({ username, email, password }) {
//   if (!username || !email || !password) {
//     const e = new Error('username, email, password are required');
//     e.status = 400; throw e;
//   }

//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     // ตรวจซ้ำ
//     const [dup] = await conn.query(
//       'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
//       [username, email]
//     );
//     if (dup.length) {
//       const e = new Error('username or email already exists');
//       e.status = 409; throw e;
//     }

//     const password_hash = await hashPassword(password);
//     const [result] = await conn.query(
//       'INSERT INTO users (username, email, password_hash) VALUES (?,?,?)',
//       [username, email, password_hash]
//     );

//     const userId = result.insertId;
//     const accessToken = signAccessToken({ sub: userId });
//     const refreshToken = signRefreshToken({ sub: userId });

//     // เก็บ refresh token แบบแฮช
//     const tokenHash = sha256(refreshToken);
//     const expiresAt = add(new Date(), { days: 30 }); // match .env (30d)
//     await conn.query(
//       'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)',
//       [userId, tokenHash, expiresAt]
//     );

//     await conn.commit();

//     // อ่าน user กลับมา
//     const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

//     return {
//       user: userPublic(user),
//       tokens: { access_token: accessToken, refresh_token: refreshToken },
//     };
//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// }

// export async function login({ identity, password }) {
//   if (!identity || !password) {
//     const e = new Error('username/email and password are required');
//     e.status = 400; throw e;
//   }

//   const [[user]] = await pool.query(
//     'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
//     [identity, identity]
//   );
//   if (!user) {
//     const e = new Error('Invalid credentials'); e.status = 401; throw e;
//   }

//   const ok = await verifyPassword(password, user.password_hash);
//   if (!ok) {
//     const e = new Error('Invalid credentials'); e.status = 401; throw e;
//   }

//   const accessToken = signAccessToken({ sub: user.id });
//   const refreshToken = signRefreshToken({ sub: user.id });
//   const tokenHash = sha256(refreshToken);
//   const expiresAt = add(new Date(), { days: 30 });

//   await pool.query(
//     'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)',
//     [user.id, tokenHash, expiresAt]
//   );

//   return {
//     user: userPublic(user),
//     tokens: { access_token: accessToken, refresh_token: refreshToken },
//   };
// }

// export async function refresh({ refresh_token }) {
//   if (!refresh_token) {
//     const e = new Error('refresh_token is required'); e.status = 400; throw e;
//   }

//   // ตรวจลายเซ็น + หมดอายุด้วย JWT ก่อน
//   let payload;
//   try {
//     payload = verifyRefreshToken(refresh_token);
//   } catch {
//     const e = new Error('Invalid refresh token'); e.status = 401; throw e;
//   }

//   const tokenHash = sha256(refresh_token);
//   const [[row]] = await pool.query(
//     'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 LIMIT 1',
//     [tokenHash]
//   );
//   if (!row) {
//     const e = new Error('Refresh token not found or revoked'); e.status = 401; throw e;
//   }
//   if (new Date(row.expires_at) < new Date()) {
//     const e = new Error('Refresh token expired'); e.status = 401; throw e;
//   }

//   const accessToken = signAccessToken({ sub: payload.sub });
//   return { access_token: accessToken };
// }

// export async function logout({ refresh_token, user_id }) {
//   // เลือกแบบไหนก็ได้:
//   // 1) ส่ง refresh_token มา → revoke เฉพาะอันนั้น
//   // 2) ส่ง user_id (จาก access token ภายนอก) → revoke ทั้งหมดของผู้ใช้
//   if (refresh_token) {
//     const tokenHash = sha256(refresh_token);
//     await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?', [tokenHash]);
//     return { success: true };
//   }
//   if (user_id) {
//     await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [user_id]);
//     return { success: true };
//   }
//   const e = new Error('Either refresh_token or user_id is required'); e.status = 400; throw e;
// }
