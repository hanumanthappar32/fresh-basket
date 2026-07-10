const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /api/products
 * List all products. Supports optional query params:
 *   ?category=Fruits  — filter by category
 *   ?search=banana    — search by name/description
 */
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let data;

    if (search) {
      data = await Product.search(search);
    } else if (category) {
      data = await Product.getByCategory(category);
    } else {
      data = await Product.getAll();
    }

    res.json({ success: true, data, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/products
 */
router.post('/', async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, error: 'name, category, and price are required' });
    }
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/products/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/products/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
