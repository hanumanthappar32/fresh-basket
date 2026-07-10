const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

/**
 * GET /api/orders
 * Returns all orders, sorted newest first.
 */
router.get('/', (req, res) => {
  try {
    const orders = Order.getOrders();
    res.json({ success: true, data: orders, count: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/orders/:id
 * Get a single order by ID.
 */
router.get('/:id', (req, res) => {
  try {
    const order = Order.getById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders
 * Place a new order from the current cart.
 * Body: { customerName, email, phone, address }
 */
router.post('/', (req, res) => {
  try {
    const { customerName, email, phone, address } = req.body;

    // Validate required customer fields
    if (!customerName || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        error:
          'All customer fields are required: customerName, email, phone, address',
      });
    }

    // Check that the cart is not empty
    const cartItems = Cart.getCart();
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot place an order with an empty cart',
      });
    }

    const totals = Cart.getTotal();

    const order = Order.createOrder(cartItems, totals, {
      customerName,
      email,
      phone,
      address,
    });

    // Clear the cart after order is placed
    Cart.clearCart();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
