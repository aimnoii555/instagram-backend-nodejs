import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
    return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });
}

export function signRefreshToken(payload) {
    return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
}


export function verifyRefreshToken(token) {
    // โยน error ออกไปถ้าไม่ผ่าน/หมดอายุ
    return jwt.verify(token, env.jwt.refreshSecret);
}
