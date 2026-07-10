const Product = require('./Product');

let CartSchema;
try { CartSchema = require('../schemas/Cart'); } catch (e) { CartSchema = null; }

const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 500;

function useDB() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1 && CartSchema;
}

// In-memory fallback
let memCart = [];

/**
 * Get or create the cart document in MongoDB.
 */
async function getCartDoc() {
  let cart = await CartSchema.findOne({ cartId: 'default' });
  if (!cart) {
    cart = await CartSchema.create({ cartId: 'default', items: [] });
  }
  return cart;
}

/**
 * Build enriched cart response with product details.
 */
async function buildResponse(items) {
  const enriched = [];
  for (const item of items) {
    const product = await Product.getById(item.productId);
    if (product) {
      enriched.push({
        productId: item.productId,
        quantity: item.quantity,
        product,
        subtotal: parseFloat((product.price * item.quantity).toFixed(2)),
      });
    }
  }
  const subtotal = parseFloat(enriched.reduce((s, i) => s + i.subtotal, 0).toFixed(2));
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = parseFloat((subtotal + deliveryFee).toFixed(2));
  return { items: enriched, subtotal, deliveryFee, total };
}

const Cart = {
  async getCart() {
    if (useDB()) {
      const cart = await getCartDoc();
      return cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    }
    return memCart;
  },

  async getCartResponse() {
    const items = await this.getCart();
    return await buildResponse(items);
  },

  async addItem(productId, quantity = 1) {
    if (useDB()) {
      const cart = await getCartDoc();
      const existing = cart.items.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
      return await buildResponse(cart.items);
    }
    const existing = memCart.find((i) => i.productId === productId);
    if (existing) { existing.quantity += quantity; }
    else { memCart.push({ productId, quantity }); }
    return await buildResponse(memCart);
  },

  async updateItem(productId, quantity) {
    if (useDB()) {
      const cart = await getCartDoc();
      const item = cart.items.find((i) => i.productId === productId);
      if (!item) return null;
      item.quantity = quantity;
      await cart.save();
      return await buildResponse(cart.items);
    }
    const item = memCart.find((i) => i.productId === productId);
    if (!item) return null;
    item.quantity = quantity;
    return await buildResponse(memCart);
  },

  async removeItem(productId) {
    if (useDB()) {
      const cart = await getCartDoc();
      cart.items = cart.items.filter((i) => i.productId !== productId);
      await cart.save();
      return await buildResponse(cart.items);
    }
    memCart = memCart.filter((i) => i.productId !== productId);
    return await buildResponse(memCart);
  },

  async clearCart() {
    if (useDB()) {
      const cart = await getCartDoc();
      cart.items = [];
      await cart.save();
      return { items: [], subtotal: 0, deliveryFee: 0, total: 0 };
    }
    memCart = [];
    return { items: [], subtotal: 0, deliveryFee: 0, total: 0 };
  },

  async getTotal() {
    const response = await this.getCartResponse();
    return { subtotal: response.subtotal, deliveryFee: response.deliveryFee, total: response.total };
  },
};

module.exports = Cart;
