'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');
const AVATAR_DIR = path.join(UPLOAD_ROOT, 'avatars');
const DOC_DIR = path.join(UPLOAD_ROOT, 'documents');
const COVER_DIR = path.join(UPLOAD_ROOT, 'covers');

for (const dir of [UPLOAD_ROOT, AVATAR_DIR, DOC_DIR, COVER_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const DOC_MIMES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const DOC_EXTS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

const makeFilter = (mimes, exts) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!mimes.has(file.mimetype) || !exts.has(ext)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Desteklenmeyen dosya tipi'));
  }
  cb(null, true);
};

// Bellek storage — sharp ile işleyip diske kendimiz yazacağız (resim)
const memoryStorage = multer.memoryStorage();

// Disk storage (belge) — sharp yok, direkt disk
const docStorage = multer.diskStorage({
  destination: DOC_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: makeFilter(IMAGE_MIMES, IMAGE_EXTS),
});

const coverUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: makeFilter(IMAGE_MIMES, IMAGE_EXTS),
});

const documentUpload = multer({
  storage: docStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: makeFilter(DOC_MIMES, DOC_EXTS),
});

/**
 * Buffer'daki resmi sharp ile yeniden boyutlandırıp webp olarak diske yaz.
 * Dönüş: { filename, fileUrl, sizeBytes }
 */
const processImage = async (buffer, targetDir, { width, height, fit = 'cover' }) => {
  const filename = `${crypto.randomUUID()}.webp`;
  const fullPath = path.join(targetDir, filename);
  const output = await sharp(buffer)
    .resize(width, height, { fit })
    .webp({ quality: 82 })
    .toBuffer();
  await fs.promises.writeFile(fullPath, output);
  const relUrl = `/uploads/${path.basename(targetDir)}/${filename}`;
  return { filename, fileUrl: relUrl, sizeBytes: output.length };
};

const processAvatar = (buffer) =>
  processImage(buffer, AVATAR_DIR, { width: 512, height: 512 });

const processCover = (buffer) =>
  processImage(buffer, COVER_DIR, { width: 1600, height: 900 });

/** Fiziksel dosya sil (best-effort). */
const unlinkFile = async (relUrl) => {
  if (!relUrl) return;
  try {
    const safe = relUrl.replace(/^\/+/, '');
    if (!safe.startsWith('uploads/')) return;
    const full = path.join(__dirname, '..', '..', safe);
    await fs.promises.unlink(full);
  } catch (err) {
    // Diskten silme başarısızsa DB işlemini bozma
    console.warn('[upload] unlink failed:', err.message);
  }
};

module.exports = {
  UPLOAD_ROOT,
  avatarUpload,
  coverUpload,
  documentUpload,
  processAvatar,
  processCover,
  unlinkFile,
};
