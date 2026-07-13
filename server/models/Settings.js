let SettingsSchema;
try { SettingsSchema = require('../schemas/Settings'); } catch (e) { SettingsSchema = null; }

function useDB() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1 && SettingsSchema;
}

// In-memory fallback
let memSettings = { razorpayKeyId: '', razorpayKeySecret: '', codEnabled: true };

function maskSecret(secret) {
  if (!secret || secret.length < 5) return secret ? '••••' : '';
  return '•'.repeat(secret.length - 4) + secret.slice(-4);
}

const Settings = {
  /**
   * Get settings for display (secret masked).
   */
  async getSettings() {
    let raw;
    if (useDB()) {
      raw = await SettingsSchema.findOne().lean();
      if (!raw) raw = { razorpayKeyId: '', razorpayKeySecret: '', codEnabled: true };
    } else {
      raw = { ...memSettings };
    }

    return {
      razorpayKeyId: raw.razorpayKeyId || '',
      maskedSecret: maskSecret(raw.razorpayKeySecret),
      razorpayConfigured: !!(raw.razorpayKeyId && raw.razorpayKeySecret),
      codEnabled: raw.codEnabled !== false,
    };
  },

  /**
   * Get raw settings with actual secret (server-side only).
   */
  async getRawSettings() {
    if (useDB()) {
      const doc = await SettingsSchema.findOne().lean();
      if (!doc) return { razorpayKeyId: '', razorpayKeySecret: '', codEnabled: true };
      return {
        razorpayKeyId: doc.razorpayKeyId || '',
        razorpayKeySecret: doc.razorpayKeySecret || '',
        codEnabled: doc.codEnabled !== false,
      };
    }
    return { ...memSettings };
  },

  /**
   * Update settings. If razorpayKeySecret is empty/undefined, keep existing.
   */
  async updateSettings({ razorpayKeyId, razorpayKeySecret, codEnabled }) {
    const update = {};
    if (razorpayKeyId !== undefined) update.razorpayKeyId = razorpayKeyId;
    if (codEnabled !== undefined) update.codEnabled = codEnabled;

    if (useDB()) {
      // Get existing to preserve secret if not provided
      if (razorpayKeySecret) {
        update.razorpayKeySecret = razorpayKeySecret;
      }
      await SettingsSchema.findOneAndUpdate({}, { $set: update }, { upsert: true, new: true });
    } else {
      if (razorpayKeyId !== undefined) memSettings.razorpayKeyId = razorpayKeyId;
      if (razorpayKeySecret) memSettings.razorpayKeySecret = razorpayKeySecret;
      if (codEnabled !== undefined) memSettings.codEnabled = codEnabled;
    }

    return this.getSettings();
  },
};

module.exports = Settings;
