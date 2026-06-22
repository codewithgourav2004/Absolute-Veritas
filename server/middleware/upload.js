const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const ext  = allowed.test(file.originalname.split('.').pop().toLowerCase());
  const mime = /image\/(jpeg|jpg|png|gif|webp)|application\/pdf/.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images and PDFs are allowed'));
};

let storage;

const isReal = (v) => v && !v.startsWith('your_') && v.length > 4;
const hasCloudinary = isReal(process.env.CLOUDINARY_CLOUD_NAME) &&
                      isReal(process.env.CLOUDINARY_API_KEY) &&
                      isReal(process.env.CLOUDINARY_API_SECRET);

if (hasCloudinary) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: 'absolute-veritas',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
    }),
  });
  console.log('Upload: using Cloudinary storage');
} else {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename:    (req, file, cb) => {
      const ext  = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 60);
      cb(null, `${Date.now()}-${base}${ext}`);
    },
  });
  console.log('Upload: using local disk storage (server/uploads/)');
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = upload;
