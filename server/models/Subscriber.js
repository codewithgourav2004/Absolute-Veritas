const crypto   = require('crypto');
const mongoose  = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:             { type: String, default: '' },
  mobile:           { type: String, default: '' },
  isActive:         { type: Boolean, default: true },
  unsubscribeToken: { type: String, default: () => crypto.randomBytes(32).toString('hex'), select: true },
  subscribedAt:     { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
