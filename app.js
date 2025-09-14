// src/app.js
import path from 'path';
import { fileURLToPath } from 'url';



import express from 'express';
import authRouter from './src/modules/auth/auth.routes.js';
import userRouter from './src/modules/users/users.routes.js';
import postRouter from './src/modules/post/posts.routes.js'
import storiesRouter from './src/modules/stories/stories.routes.js';
import reelsRouter from './src/modules/reels/reels.routes.js';
import searchRouter from './src/modules/search/search.routes.js';
import notificationRouter from './src/modules/notifications/notification.routes.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json());
// app.use('/uploads', express.static())

// ✅ ชี้ไปที่โฟลเดอร์ uploads ที่อยู่ "นอก src" (เช่น <root>/uploads)
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', postRouter)
app.use('/api/v1', storiesRouter)
app.use('/api/v1', reelsRouter)
app.use('/api/v1', searchRouter)
app.use('/api/v1', notificationRouter)


// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});
