import rateLimit from 'express-rate-limit';

// เข้มสุด: ใช้กับ login/register/refresh
export const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 นาที
    max: 30,                  // 30 ครั้ง/10 นาที/ IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

// ปานกลาง: action ที่เขียนบ่อย (like, comment, follow)
export const writeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 นาที
    max: 60,                 // 60 ครั้ง/นาที/ IP
    standardHeaders: true,
    legacyHeaders: false,
});

export const strictWriteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20, // โพสต์/รีล/สตอรี่
    standardHeaders: true,
    legacyHeaders: false,
});
