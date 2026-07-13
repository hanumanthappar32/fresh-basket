const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /api/products
 * List all products. Supports optional query/headers:
 *   ?storeId=store-123 — filter by store/merchant
 *   ?category=Fruits    — filter by category
 *   ?search=banana      — search by name/description
 *   X-Merchant-Id header — filters by logged-in merchant
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, storeId } = req.query;
    const merchantId = storeId || req.headers['x-merchant-id'];
    let data;

    if (search) {
      data = await Product.search(search, merchantId);
    } else if (category) {
      data = await Product.getByCategory(category, merchantId);
    } else {
      data = await Product.getAll(merchantId);
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
 * Requires X-Merchant-Id header.
 */
router.post('/', async (req, res) => {
  try {
    const merchantId = req.headers['x-merchant-id'];
    if (!merchantId) {
      return res.status(400).json({ success: false, error: 'Merchant ID header is required' });
    }

    const { name, category, price } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, error: 'name, category, and price are required' });
    }
    const product = await Product.create(req.body, merchantId);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/products/:id
 * Requires X-Merchant-Id header.
 */
router.put('/:id', async (req, res) => {
  try {
    const merchantId = req.headers['x-merchant-id'];
    if (!merchantId) {
      return res.status(400).json({ success: false, error: 'Merchant ID header is required' });
    }

    const product = await Product.update(req.params.id, req.body, merchantId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found or not owned by you' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/products/:id
 * Requires X-Merchant-Id header.
 */
router.delete('/:id', async (req, res) => {
  try {
    const merchantId = req.headers['x-merchant-id'];
    if (!merchantId) {
      return res.status(400).json({ success: false, error: 'Merchant ID header is required' });
    }

    const deleted = await Product.delete(req.params.id, merchantId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found or not owned by you' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
