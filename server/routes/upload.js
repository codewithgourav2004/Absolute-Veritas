const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const upload  = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/', protect, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Cloudinary: req.file.path is the full https URL
    // Disk storage: req.file.filename → served from /uploads/
    const url = req.file.path && req.file.path.startsWith('http')
      ? req.file.path
      : `/uploads/${req.file.filename}`;

    res.json({ url });
  });
});

module.exports = router;
