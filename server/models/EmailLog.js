const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  subject:   { type: String, required: true },
  recipient: { type: String, required: true },
  status:    { type: String, enum: ['delivered', 'failed'], required: true },
  error:     { type: String, default: '' },
  source:    { type: String, enum: ['custom', 'newsletter'], default: 'custom' },
  sentAt:    { type: Date, default: Date.now },
});

emailLogSchema.index({ sentAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
