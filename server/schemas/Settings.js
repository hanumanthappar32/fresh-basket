const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  razorpayKeyId:     { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  codEnabled:        { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
