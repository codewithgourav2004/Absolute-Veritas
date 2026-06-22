const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  excerpt:     { type: String, required: true },
  content:     { type: String, required: true },
  coverImage:  { type: String, default: '' },
  category:    { type: String, default: 'General' },
  tags:        [{ type: String }],
  author:      { type: String, default: 'Absolute Veritas' },
  isTrending:  { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose.model('News', newsSchema);
