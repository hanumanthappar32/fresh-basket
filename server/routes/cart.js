const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

/**
 * GET /api/cart
 */
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.getCartResponse();
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/cart
 * Body: { productId, quantity }
 */
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }
    const cart = await Cart.addItem(productId, quantity || 1);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/cart/:productId
 * Body: { quantity }
 */
router.put('/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Valid quantity is required' });
    }
    const cart = await Cart.updateItem(req.params.productId, quantity);
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/cart/clear
 */
router.delete('/clear', async (req, res) => {
  try {
    const cart = await Cart.clearCart();
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/cart/:productId
 */
router.delete('/:productId', async (req, res) => {
  try {
    const cart = await Cart.removeItem(req.params.productId);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
