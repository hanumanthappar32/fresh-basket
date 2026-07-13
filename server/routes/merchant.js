const express = require('express');
const router = express.Router();
const Merchant = require('../models/Merchant');

/**
 * GET /api/merchant/list
 * Public directory of all registered stores.
 */
router.get('/list', async (req, res) => {
  try {
    const list = await Merchant.listMerchants();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/merchant/store/:merchantId
 * Public store details.
 */
router.get('/store/:merchantId', async (req, res) => {
  try {
    const store = await Merchant.getById(req.params.merchantId);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    res.json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/merchant/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, storeName, razorpayKeyId, razorpayKeySecret } = req.body;
    if (!email || !password || !storeName) {
      return res.status(400).json({ success: false, error: 'Email, password, and store name are required' });
    }
    const merchant = await Merchant.register({ 
      email, 
      password, 
      storeName, 
      razorpayKeyId, 
      razorpayKeySecret 
    });
    res.status(201).json({ success: true, data: merchant });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/merchant/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const merchant = await Merchant.login(email, password);
    res.json({ success: true, data: merchant });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

module.exports = router;
