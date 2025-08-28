import { Router } from 'express';
import { requireAuth, tryAuth } from '../../middlewares/auth.js';
import {
    createPost,
    getPost,
    listUserPosts,
    getFeed,
    likePost,
    unlikePost,
    addComment,
    listComments
} from './posts.controller.js';
import { upload } from '../../config/upload.js';

 const postRouter = Router();

// Add Post (multipart: files[])
postRouter.post('/posts', requireAuth, upload.array('files', 10), createPost);

// Post detail
postRouter.get('/posts/:id', tryAuth, getPost);

// User's posts (Profile grid)
postRouter.get('/users/:id/posts', tryAuth, listUserPosts);

// Home Feed (ฉัน + คนที่ฉัน follow)
postRouter.get('/feed', requireAuth, getFeed);

// Like / Unlike
postRouter.post('/posts/:id/like', requireAuth, likePost);
postRouter.delete('/posts/:id/like', requireAuth, unlikePost);

// Comments
postRouter.post('/posts/:id/comments', requireAuth, addComment);
postRouter.get('/posts/:id/comments', tryAuth, listComments);


export default postRouter;
