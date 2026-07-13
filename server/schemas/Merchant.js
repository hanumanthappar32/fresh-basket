const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  merchantId:        { type: String, required: true, unique: true },
  email:             { type: String, required: true, unique: true },
  password:          { type: String, required: true },
  storeName:         { type: String, required: true },
  razorpayKeyId:     { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  codEnabled:        { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Merchant', merchantSchema);
