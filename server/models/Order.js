const { v4: uuidv4 } = require('uuid');

/**
 * In-memory orders storage.
 */
const orders = [];

/**
 * Order Model
 * Manages order creation and retrieval with UUID-based identifiers.
 */
const Order = {
  /**
   * Create a new order from cart items and customer info.
   * @param {Array} cartItems - Enriched cart items with product details
   * @param {Object} totals - { subtotal, deliveryFee, total }
   * @param {Object} customerInfo - { customerName, email, phone, address }
   * @returns {Object} The newly created order
   */
  createOrder(cartItems, totals, customerInfo) {
    const order = {
      id: uuidv4(),
      items: cartItems,
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
      createdAt: new Date().toISOString(),
    };

    orders.push(order);
    return order;
  },

  /**
   * Get all orders, sorted newest first.
   * @returns {Array} All orders
   */
  getOrders() {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  /**
   * Get a single order by its ID.
   * @param {string} id - The order UUID
   * @returns {Object|undefined} The order or undefined
   */
  getById(id) {
    return orders.find((o) => o.id === id);
  },
};

module.exports = Order;
