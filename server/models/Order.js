const { v4: uuidv4 } = require('uuid');

let OrderSchema;
try { OrderSchema = require('../schemas/Order'); } catch (e) { OrderSchema = null; }

function useDB() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1 && OrderSchema;
}

// In-memory fallback
const memOrders = [];

const Order = {
  async createOrder(cartItems, totals, customerInfo) {
    const orderId = uuidv4();
    const orderData = {
      orderId,
      items: cartItems.map((i) => ({
        productId: i.productId,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
        unit: i.product.unit,
        subtotal: i.subtotal,
      })),
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      customer: {
        name: customerInfo.customerName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
      },
      status: 'confirmed',
    };

    if (useDB()) {
      const doc = await OrderSchema.create(orderData);
      const obj = doc.toObject();
      obj.id = obj.orderId;
      delete obj._id;
      delete obj.__v;
      return obj;
    }

    orderData.id = orderId;
    orderData.createdAt = new Date().toISOString();
    memOrders.push(orderData);
    return orderData;
  },

  async getOrders() {
    if (useDB()) {
      const docs = await OrderSchema.find().sort({ createdAt: -1 }).lean();
      return docs.map((d) => ({ ...d, id: d.orderId, _id: undefined, __v: undefined }));
    }
    return [...memOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    if (useDB()) {
      const doc = await OrderSchema.findOne({ orderId: id });
      if (!doc) return undefined;
      const obj = doc.toObject();
      obj.id = obj.orderId;
      delete obj._id;
      delete obj.__v;
      return obj;
    }
    return memOrders.find((o) => o.id === id);
  },
};

module.exports = Order;
