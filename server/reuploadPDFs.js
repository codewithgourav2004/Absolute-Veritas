/**
 * Re-upload all newsletter PDFs to Cloudinary with overwrite:true,
 * then update the pdfLink in the database.
 *
 * Usage:  cd server && node reuploadPDFs.js
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
  console.log('Connected to MongoDB\n');

  const newsletters = await Newsletter.find({ pdfLink: { $exists: true, $ne: '' } });

  let done = 0, skipped = 0, failed = 0;

  for (const nl of newsletters) {
    if (!nl.pdfLink) { skipped++; continue; }

    // Derive local filename whether pdfLink is a Cloudinary URL or /uploads/ path
    let filename;
    if (nl.pdfLink.startsWith('/uploads/')) {
      filename = nl.pdfLink.split('/').pop();
    } else if (nl.pdfLink.includes('cloudinary.com')) {
      // e.g. .../newsletters/1782188670873-absolute-veritas.pdf
      filename = nl.pdfLink.split('/').pop().split('?')[0];
    } else {
      console.log(`  [SKIP] "${nl.title}" — unrecognised pdfLink: ${nl.pdfLink}`);
      skipped++;
      continue;
    }

    const localPath = path.join(__dirname, 'uploads', filename);
    if (!fs.existsSync(localPath)) {
      console.warn(`  [SKIP] "${nl.title}" — file not on disk: ${localPath}`);
      skipped++;
      continue;
    }

    console.log(`  Uploading "${nl.title}" …`);
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder:          'absolute-veritas/newsletters',
        resource_type:   'raw',
        use_filename:    true,
        unique_filename: false,
        overwrite:       true,   // force replace any stale version
      });

      nl.pdfLink = result.secure_url;
      await nl.save();
      console.log(`  ✓ ${result.secure_url}\n`);
      done++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`Done: ${done} uploaded, ${skipped} skipped, ${failed} failed.`);
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
