const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  author: { type: String, default: 'Absolute Veritas' },
  publishedAt: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
