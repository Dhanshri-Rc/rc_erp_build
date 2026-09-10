import multer from 'multer';
import fs from 'fs';
import crypto from 'crypto';

const extensions = new Map([['image/jpeg', '.jpg'], ['image/png', '.png'], ['application/pdf', '.pdf']]);

const dir = process.env.UPLOAD_DIR || 'uploads';
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dir),
  filename: (_, file, cb) => {
    const ext = extensions.get(file.mimetype) || '';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  }
});

const allowed = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const signatureMatches = (mime, bytes) => {
  if (mime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  if (mime === 'application/pdf') return bytes.subarray(0, 5).toString() === '%PDF-';
  return false;
};
const baseUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => allowed.has(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG and PDF files up to 5MB are allowed'))
});

const verifyContent = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const handle = await fs.promises.open(req.file.path, 'r');
    const bytes = Buffer.alloc(8);
    await handle.read(bytes, 0, 8, 0);
    await handle.close();
    if (!signatureMatches(req.file.mimetype, bytes)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(415).json({ success:false, message:'The uploaded file content is invalid', errors:[] });
    }
    return next();
  } catch (error) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    return next(error);
  }
};

export const upload = {
  single: (field) => [baseUpload.single(field), verifyContent],
};
