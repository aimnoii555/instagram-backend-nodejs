import { Router } from 'express';
import { register, login, logout,refresh } from './auth.controller.js';

const authRouter = Router();

// /api/v1/auth/register
authRouter.post('/register', register);
authRouter.post('/login', login)
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout)



export default authRouter;
