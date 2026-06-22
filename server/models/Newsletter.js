const mongoose = require('mongoose');
const newsletterSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, unique: true, sparse: true },
  edition:     { type: String, required: true },
  month:       { type: String, required: true },
  year:        { type: Number, required: true },
  excerpt:     { type: String, default: '' },
  content:     { type: String, default: '' },
  coverImage:  { type: String, default: '' },
  pdfLink:     { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  emailedAt:   { type: Date, default: null },
}, { timestamps: true });
module.exports = mongoose.model('Newsletter', newsletterSchema);
