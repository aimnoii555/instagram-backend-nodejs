import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { listNotifications, markRead, markAllRead } from './notification.controller.js';

const notificationRouter = Router();

notificationRouter.get('/notifications', requireAuth, listNotifications);
notificationRouter.post('/notifications/:id/read', requireAuth, markRead);
notificationRouter.post('/notifications/read-all', requireAuth, markAllRead);

export default notificationRouter;
