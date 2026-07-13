const express = require('express');
const router = express.Router();
const Merchant = require('../models/Merchant');

/**
 * GET /api/admin/settings
 */
router.get('/', async (req, res) => {
  try {
    const merchantId = req.headers['x-merchant-id'];
    if (!merchantId) {
      return res.status(400).json({ success: false, error: 'Merchant ID header is required' });
    }
    const settings = await Merchant.getSettings(merchantId);
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/settings
 */
router.post('/', async (req, res) => {
  try {
    const merchantId = req.headers['x-merchant-id'];
    if (!merchantId) {
      return res.status(400).json({ success: false, error: 'Merchant ID header is required' });
    }
    const { razorpayKeyId, razorpayKeySecret, codEnabled, storeName } = req.body;
    const updated = await Merchant.updateSettings(merchantId, { razorpayKeyId, razorpayKeySecret, codEnabled, storeName });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
