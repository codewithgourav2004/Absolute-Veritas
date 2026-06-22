const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['Certification', 'Testing', 'Inspection', 'IT Compliance', 'Others'],
    required: true,
  },
  // Group these sub-services belong to (e.g. "Bureau of Indian Standards (BIS)")
  subcategory:            { type: String, default: '' },
  subcategoryIcon:        { type: String, default: '' },
  subcategoryDescription: { type: String, default: '' },
  subcategoryOrder:       { type: Number, default: 0 }, // order of the group in the sidebar
  description: { type: String, required: true },
  icon:    { type: String, default: '' },
  image:   { type: String, default: '' },
  content: { type: String, default: '' },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
