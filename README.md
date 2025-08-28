Auth

POST /auth/register {username,email,password} → {user, tokens}

POST /auth/login {username|email,password} → {user, tokens}

POST /auth/refresh {refresh_token} → {access_token}

POST /auth/logout (invalidate refresh)

Users / Profile

GET /users/:username → โปรไฟล์, นับโพสต์/ผู้ติดตาม/กำลังติดตาม

PUT /me (auth) → อัปเดตชื่อ, bio, website, avatar

GET /me (auth) → ข้อมูลตัวเอง

POST /users/:id/follow (auth)

DELETE /users/:id/follow (auth)

GET /users/:id/followers / following

Feed / Search

GET /feed (auth) → timeline จากคนที่ follow (รวมโพสต์ตัวเอง)

GET /search?q=... → users, hashtag (ถ้าใส่), top posts

Posts

POST /posts (auth, multipart) → สร้างโพสต์ + media หลายไฟล์

body: caption, location, files[]

GET /posts/:id

GET /users/:id/posts?cursor=... (pagination)

POST /posts/:id/like / DELETE /posts/:id/like

POST /posts/:id/comments {text, parent_id?}

GET /posts/:id/comments?cursor=...

(optional) DELETE /posts/:id ของตัวเอง

Stories

POST /stories (auth, multipart) → 1 สตอรี่/ไฟล์ ต่อ request

GET /stories (auth) → stories ของตัวเอง + คนที่ follow ที่ยังไม่หมดอายุ

POST /stories/:id/view (auth)

Reels

POST /reels (auth, video multipart)

GET /reels?cursor=... (public/list)

POST /reels/:id/like / DELETE /reels/:id/like

Notifications

GET /notifications (auth)

POST /notifications/:id/read (หรือ mark all)

Upload (แยก service ถ้าต้องการ)

POST /upload/image / POST /upload/video → คืน URL (ใช้ในฟอร์ม)
