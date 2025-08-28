import { Router } from 'express';
import { requireAuth, tryAuth } from '../../middlewares/auth.js';
import {
    createPost, getPost, listUserPosts, getFeed, likePost, unlikePost, addComment,
    listComments, deletePost, deleteComment, restorePost
} from './posts.controller.js';
import { strictWriteLimiter, writeLimiter } from '../../middlewares/rateLimit.js';

import { upload } from '../../config/upload.js';

const postRouter = Router();

// Add Post (multipart: files[])
postRouter.post('/posts', requireAuth, strictWriteLimiter, upload.array('files', 10), createPost);

// Post detail
postRouter.get('/posts/:id', tryAuth, getPost);

// User's posts (Profile grid)
postRouter.get('/users/:id/posts', tryAuth, listUserPosts);

// Home Feed (ฉัน + คนที่ฉัน follow)
postRouter.get('/feed', requireAuth, getFeed);

// Like / Unlike
postRouter.post('/posts/:id/like', requireAuth, writeLimiter, likePost);
postRouter.delete('/posts/:id/like', requireAuth, writeLimiter, unlikePost);

// Comments
postRouter.post('/posts/:id/comments', requireAuth, writeLimiter, addComment);
postRouter.get('/posts/:id/comments', tryAuth, listComments);

// delete post
postRouter.delete('/posts/:id', requireAuth, deletePost);
postRouter.put('/posts/:id/restore', requireAuth, restorePost)

// delete my comment
postRouter.delete('/comments/:id', requireAuth, deleteComment);



export default postRouter;
