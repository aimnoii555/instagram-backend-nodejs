import { Router } from 'express';
import { register, login, logout, refresh } from './auth.controller.js';
import { authLimiter } from '../../middlewares/rateLimit.js';


const authRouter = Router();

// /api/v1/auth/register
authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login)
authRouter.post('/refresh', authLimiter, refresh);
authRouter.post('/logout', authLimiter, logout)



export default authRouter;
