/**
 * Revert pdfLink from Cloudinary URLs back to /uploads/ paths
 * (Cloudinary returns 401 for raw files — serve from local disk instead)
 *
 * Usage:  cd server && node revertPDFLinks.js
 */
require('dotenv').config();
const mongoose  = require('mongoose');
const Newsletter = require('./models/Newsletter');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const newsletters = await Newsletter.find({
    pdfLink: { $regex: 'cloudinary\\.com.*newsletters/' },
  });

  if (!newsletters.length) {
    console.log('No Cloudinary newsletter pdfLinks found.');
    process.exit(0);
  }

  for (const nl of newsletters) {
    // Extract filename from Cloudinary URL
    // e.g. .../newsletters/1782188670873-absolute-veritas.pdf → /uploads/1782188670873-absolute-veritas.pdf
    const filename = nl.pdfLink.split('/').pop().split('?')[0];
    const localPath = `/uploads/${filename}`;
    console.log(`  "${nl.title}"`);
    console.log(`    ${nl.pdfLink}`);
    console.log(`    → ${localPath}`);
    nl.pdfLink = localPath;
    await nl.save();
  }

  console.log(`\nReverted ${newsletters.length} newsletter(s).`);
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
