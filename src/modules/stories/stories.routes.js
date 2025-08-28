import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { upload } from '../../config/upload.js';
import { createStory, listStoriesFeed, markStoryViewed, listUserStories } from './stories.controller.js';

const storiesRouter = Router();


storiesRouter.post('/stories', requireAuth, upload.single('file'), createStory);
storiesRouter.get('/stories', requireAuth, listStoriesFeed);        // ฉัน + คนที่ฉัน follow ที่ยังไม่หมดอายุ
storiesRouter.post('/stories/:id/view', requireAuth, markStoryViewed);
storiesRouter.get('/users/:id/stories', requireAuth, listUserStories);

export default storiesRouter;
