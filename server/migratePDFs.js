/**
 * One-time script: upload local /uploads/*.pdf files to Cloudinary
 * and update the pdfLink in every Newsletter document.
 *
 * Usage:
 *   cd server
 *   node migratePDFs.js
 */

require('dotenv').config();
const path       = require('path');
const fs         = require('fs');
const mongoose   = require('mongoose');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Newsletter = require('./models/Newsletter');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const newsletters = await Newsletter.find({
    pdfLink: { $regex: '^/uploads/' },
  });

  if (!newsletters.length) {
    console.log('No newsletters with local /uploads/ pdfLinks found. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${newsletters.length} newsletter(s) with local PDF links.\n`);

  for (const nl of newsletters) {
    const localPath = path.join(__dirname, nl.pdfLink.replace(/^\//, ''));

    if (!fs.existsSync(localPath)) {
      console.warn(`  [SKIP] ${nl.title} — file not found: ${localPath}`);
      continue;
    }

    console.log(`  Uploading "${nl.title}" (${nl.pdfLink}) …`);
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder:        'absolute-veritas/newsletters',
        resource_type: 'raw',
        use_filename:  true,
        unique_filename: false,
        overwrite:     false,
      });

      nl.pdfLink = result.secure_url;
      await nl.save();
      console.log(`  ✓ Done  → ${result.secure_url}\n`);
    } catch (err) {
      console.error(`  ✗ Failed for "${nl.title}": ${err.message}\n`);
    }
  }

  console.log('Migration complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
