import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/** ต้องมี Authorization: Bearer <access_token> */
export function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const [scheme, token] = header.split(' ');
        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const payload = jwt.verify(token, env.jwt.accessSecret);
        req.user = { id: payload.sub, username: payload.username };
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

/** ลองถอด token ถ้ามีก็ดี ไม่มีก็ปล่อยผ่าน (ใช้กับ public profile) */
export function tryAuth(req, _res, next) {
    try {
        const header = req.headers.authorization || '';
        const [scheme, token] = header.split(' ');
        if (scheme === 'Bearer' && token) {
            const payload = jwt.verify(token, env.jwt.accessSecret);
            req.user = { id: payload.sub, username: payload.username };
        }
    } catch { }
    return next();
}
