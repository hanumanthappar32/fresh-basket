const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  category:  { type: String, required: true },
  price:     { type: Number, required: true },
  unit:      { type: String, default: 'No.' },
  image:     { type: String, default: '📦' },
  description: { type: String, default: '' },
  inStock:   { type: Boolean, default: true },
  rating:    { type: Number, default: 4.0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
