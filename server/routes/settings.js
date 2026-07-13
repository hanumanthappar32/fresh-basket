const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

/**
 * GET /api/admin/settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
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
    const { razorpayKeyId, razorpayKeySecret, codEnabled } = req.body;
    const updated = await Settings.updateSettings({ razorpayKeyId, razorpayKeySecret, codEnabled });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
