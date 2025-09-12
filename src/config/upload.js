import multer from 'multer';
import fs from 'fs';
import path from 'path';

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(_req, file, cb) {
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        const dir = isImage ? 'uploads/images' : isVideo ? 'uploads/videos' : 'uploads/others';
        ensureDir(dir);
        cb(null, dir);
    },
    filename(_req, file, cb) {
        const ext = path.extname(file.originalname || '');
        const name = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;
        cb(null, name);
    }
});

function fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        return cb(null, true);
    }
    cb(new Error('Only images/videos allowed'));
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024, files: 10 } // 25MB/ไฟล์
});
