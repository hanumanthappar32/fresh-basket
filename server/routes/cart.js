const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * GET /api/cart
 * Returns the current cart with enriched product details and totals.
 */
router.get('/', (req, res) => {
  try {
    const items = Cart.getCart();
    const totals = Cart.getTotal();
    res.json({ success: true, data: { items, ...totals } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/cart
 * Add an item to the cart.
 * Body: { productId: string, quantity?: number }
 */
router.post('/', (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, error: 'productId is required' });
    }

    const product = Product.getById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });
    }

    const qty = quantity && quantity > 0 ? quantity : 1;
    const item = Cart.addItem(productId, qty);
    const totals = Cart.getTotal();

    res.status(201).json({ success: true, data: { item, ...totals } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/cart/clear
 * Clear the entire cart.
 * (Placed before /:productId so it doesn't get caught by the param route.)
 */
router.delete('/clear', (req, res) => {
  try {
    Cart.clearCart();
    res.json({ success: true, data: { items: [], subtotal: 0, deliveryFee: 0, total: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/cart/:productId
 * Update the quantity of an item in the cart.
 * Body: { quantity: number }
 */
router.put('/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res
        .status(400)
        .json({ success: false, error: 'quantity is required' });
    }

    const item = Cart.updateItem(productId, quantity);
    const totals = Cart.getTotal();

    res.json({
      success: true,
      data: { item, ...totals },
      message: item ? 'Item updated' : 'Item removed from cart',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/cart/:productId
 * Remove a specific item from the cart.
 */
router.delete('/:productId', (req, res) => {
  try {
    Cart.removeItem(req.params.productId);
    const totals = Cart.getTotal();
    res.json({ success: true, data: totals, message: 'Item removed' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
