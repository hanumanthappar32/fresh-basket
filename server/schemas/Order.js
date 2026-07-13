const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId:  { type: String, required: true },
  name:       String,
  price:      Number,
  quantity:   Number,
  image:      String,
  unit:       String,
  subtotal:   Number,
});

const orderSchema = new mongoose.Schema({
  orderId:     { type: String, required: true, unique: true },
  items:       [orderItemSchema],
  subtotal:    { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  total:       { type: Number, required: true },
  customer: {
    name:    String,
    email:   String,
    phone:   String,
    address: String,
  },
  status: { type: String, default: 'confirmed' },
  paymentMethod: { type: String, default: 'cod' },
  paymentId: String,
  razorpayOrderId: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
