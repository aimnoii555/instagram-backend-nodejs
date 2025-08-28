import { Router } from 'express';
import {
    getPublicProfileByUsername, getMe, updateMe, followUser, unfollowUser, listFollowers,
    listFollowing, listFollowRequestsIncoming, acceptFollowRequest, declineFollowRequest,
    changePassword, getTrash
} from './users.controller.js';
import { requireAuth, tryAuth } from '../../middlewares/auth.js';

const userRouter = Router();

/** Public profile + สถิติ */
userRouter.get('/users/:username', tryAuth, getPublicProfileByUsername);

/** /me ต้อง auth */
userRouter.get('/me', requireAuth, getMe);
userRouter.put('/me', requireAuth, updateMe);
// change password
userRouter.put('/me/password', requireAuth, changePassword)
userRouter.get('/me/trash', requireAuth, getTrash);

/** follow/unfollow ต้อง auth */
userRouter.post('/users/:id/follow', requireAuth, followUser);
userRouter.delete('/users/:id/follow', requireAuth, unfollowUser);

/** รายการ followers/following (ใส่ tryAuth เพื่อระบุ is_following ได้ถ้าล็อกอิน) */
userRouter.get('/users/:id/followers', tryAuth, listFollowers);
userRouter.get('/users/:id/following', tryAuth, listFollowing);

/** Follow Requests (เฉพาะของฉัน) */
userRouter.get('/me/follow-requests', requireAuth, listFollowRequestsIncoming);
userRouter.post('/follow-requests/:followerId/accept', requireAuth, acceptFollowRequest);
userRouter.post('/follow-requests/:followerId/decline', requireAuth, declineFollowRequest);




export default userRouter;
