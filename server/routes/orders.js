const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

/**
 * GET /api/orders
 */
router.get('/', async (req, res) => {
  try {
    const orders = await Order.getOrders();
    res.json({ success: true, data: orders, count: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/orders/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders
 * Body: { customerName, email, phone, address }
 */
router.post('/', async (req, res) => {
  try {
    const { customerName, email, phone, address } = req.body;

    if (!customerName || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        error: 'All customer fields are required: customerName, email, phone, address',
      });
    }

    const cartResponse = await Cart.getCartResponse();
    if (cartResponse.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot place an order with an empty cart' });
    }

    const totals = { subtotal: cartResponse.subtotal, deliveryFee: cartResponse.deliveryFee, total: cartResponse.total };

    const order = await Order.createOrder(cartResponse.items, totals, {
      customerName, email, phone, address,
    }, { paymentMethod: 'cod' });

    // Clear the cart after order is placed
    await Cart.clearCart();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Body: { status }
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const order = await Order.updateStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    const code = err.message.includes('Invalid status') ? 400 : 500;
    res.status(code).json({ success: false, error: err.message });
  }
});

module.exports = router;
