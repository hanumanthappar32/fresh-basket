const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();
const Merchant = require('../models/Merchant');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

/**
 * GET /api/payments/config
 * Public — tells the frontend which payment options are available for a given store.
 */
router.get('/config', async (req, res) => {
  try {
    const storeId = req.query.storeId || 'default-merchant';
    const settings = await Merchant.getRawSettings(storeId);
    const razorpayEnabled = !!(settings.razorpayKeyId && settings.razorpayKeySecret);
    res.json({
      success: true,
      data: {
        razorpayEnabled,
        codEnabled: settings.codEnabled !== false,
        keyId: razorpayEnabled ? settings.razorpayKeyId : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for the current cart.
 */
router.post('/create-order', async (req, res) => {
  try {
    const storeId = req.query.storeId || 'default-merchant';
    const settings = await Merchant.getRawSettings(storeId);
    if (!settings.razorpayKeyId || !settings.razorpayKeySecret) {
      return res.status(400).json({ success: false, error: 'Razorpay is not configured for this store.' });
    }

    const cartResponse = await Cart.getCartResponse();
    if (cartResponse.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const amountPaise = Math.round(cartResponse.total * 100);

    const razorpay = new Razorpay({
      key_id: settings.razorpayKeyId,
      key_secret: settings.razorpayKeySecret,
    });

    const rzOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: 'order_' + Date.now(),
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: rzOrder.id,
        amount: rzOrder.amount,
        currency: rzOrder.currency,
        keyId: settings.razorpayKeyId,
      },
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create payment order' });
  }
});

/**
 * POST /api/payments/verify
 * Verifies the Razorpay payment signature and creates the order.
 */
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName, email, phone, address,
      storeId,
    } = req.body;

    const actualStoreId = storeId || 'default-merchant';

    // Validate Razorpay fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields' });
    }

    // Validate customer fields
    if (!customerName || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        error: 'All customer fields are required: customerName, email, phone, address',
      });
    }

    // Get secret for verification
    const settings = await Merchant.getRawSettings(actualStoreId);
    if (!settings.razorpayKeySecret) {
      return res.status(400).json({ success: false, error: 'Razorpay is not configured for this store' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', settings.razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed. Invalid signature.' });
    }

    // Payment verified — create order
    const cartResponse = await Cart.getCartResponse();
    if (cartResponse.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const totals = {
      subtotal: cartResponse.subtotal,
      deliveryFee: cartResponse.deliveryFee,
      total: cartResponse.total,
    };

    const order = await Order.createOrder(cartResponse.items, totals, {
      customerName, email, phone, address,
    }, {
      paymentMethod: 'razorpay',
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      merchantId: actualStoreId,
    });

    // Clear the cart
    await Cart.clearCart();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
