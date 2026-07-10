const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /api/categories
 * Returns a list of unique product categories.
 */
router.get('/', (req, res) => {
  try {
    const categories = Product.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
