import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dir = process.env.UPLOAD_DIR || 'uploads';
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  }
});

const allowed = new Set(['image/jpeg', 'image/png', 'application/pdf']);
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => allowed.has(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG and PDF files up to 5MB are allowed'))
});
