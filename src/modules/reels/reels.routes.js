import { Router } from 'express';
import { requireAuth, tryAuth } from '../../middlewares/auth.js';
import { upload } from '../../config/upload.js';
import { createReel, listReels, likeReel, unlikeReel, deleteReel, restoreReel } from './reels.controller.js';
import { strictWriteLimiter } from '../../middlewares/rateLimit.js';

export const reelRouter = Router();

reelRouter.post('/reels', requireAuth, upload.single('file'), createReel);
reelRouter.get('/reels', tryAuth, listReels);
reelRouter.post('/reels/:id/like', requireAuth, likeReel);
reelRouter.delete('/reels/:id/like', requireAuth, unlikeReel);

reelRouter.delete('/reels/:id', requireAuth, strictWriteLimiter, deleteReel)
reelRouter.put('/reels/:id/restore', requireAuth, restoreReel);

export default reelRouter;
