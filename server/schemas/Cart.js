const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity:  { type: Number, required: true, default: 1 },
});

const cartSchema = new mongoose.Schema({
  cartId: { type: String, required: true, unique: true, default: 'default' },
  items:  [cartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
