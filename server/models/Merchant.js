const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

let MerchantSchema;
try { MerchantSchema = require('../schemas/Merchant'); } catch (e) { MerchantSchema = null; }

function useDB() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1 && MerchantSchema;
}

// In-memory fallback
const memMerchants = [];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function maskSecret(secret) {
  if (!secret || secret.length < 5) return secret ? '••••' : '';
  return '•'.repeat(secret.length - 4) + secret.slice(-4);
}

const Merchant = {
  /**
   * Register a new merchant.
   */
  async register({ email, password, storeName }) {
    // Check if email already exists
    const existing = await this.getByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const merchantId = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const hashedPassword = hashPassword(password);
    const merchantData = {
      merchantId,
      email,
      password: hashedPassword,
      storeName,
      razorpayKeyId: '',
      razorpayKeySecret: '',
      codEnabled: true,
    };

    if (useDB()) {
      const doc = await MerchantSchema.create(merchantData);
      const obj = doc.toObject();
      delete obj._id;
      delete obj.__v;
      delete obj.password;
      return obj;
    }

    merchantData.createdAt = new Date().toISOString();
    memMerchants.push(merchantData);
    const result = { ...merchantData };
    delete result.password;
    return result;
  },

  /**
   * Log in a merchant.
   */
  async login(email, password) {
    const raw = await this.getRawByEmail(email);
    if (!raw || raw.password !== hashPassword(password)) {
      throw new Error('Invalid email or password');
    }
    const result = { ...raw };
    delete result.password;
    return result;
  },

  /**
   * Get public profile by email.
   */
  async getByEmail(email) {
    const raw = await this.getRawByEmail(email);
    if (!raw) return null;
    const clean = { ...raw };
    delete clean.password;
    return clean;
  },

  /**
   * Get merchant by ID (public data).
   */
  async getById(merchantId) {
    let raw;
    if (useDB()) {
      raw = await MerchantSchema.findOne({ merchantId }).lean();
    } else {
      raw = memMerchants.find((m) => m.merchantId === merchantId);
    }
    if (!raw) return null;
    const clean = { ...raw };
    delete clean.password;
    delete clean.razorpayKeySecret;
    return clean;
  },

  /**
   * Get raw details (including password/secret) for internal check.
   */
  async getRawByEmail(email) {
    if (useDB()) {
      return await MerchantSchema.findOne({ email }).lean();
    }
    return memMerchants.find((m) => m.email === email);
  },

  /**
   * Get merchant settings for admin dashboard.
   */
  async getSettings(merchantId) {
    let raw;
    if (useDB()) {
      raw = await MerchantSchema.findOne({ merchantId }).lean();
    } else {
      raw = memMerchants.find((m) => m.merchantId === merchantId);
    }
    if (!raw) throw new Error('Merchant not found');

    return {
      storeName: raw.storeName,
      razorpayKeyId: raw.razorpayKeyId || '',
      maskedSecret: maskSecret(raw.razorpayKeySecret),
      razorpayConfigured: !!(raw.razorpayKeyId && raw.razorpayKeySecret),
      codEnabled: raw.codEnabled !== false,
    };
  },

  /**
   * Get raw settings (Key ID and Secret) for backend payment actions.
   */
  async getRawSettings(merchantId) {
    let raw;
    if (useDB()) {
      raw = await MerchantSchema.findOne({ merchantId }).lean();
    } else {
      raw = memMerchants.find((m) => m.merchantId === merchantId);
    }
    if (!raw) return { razorpayKeyId: '', razorpayKeySecret: '', codEnabled: true };
    return {
      razorpayKeyId: raw.razorpayKeyId || '',
      razorpayKeySecret: raw.razorpayKeySecret || '',
      codEnabled: raw.codEnabled !== false,
    };
  },

  /**
   * Update settings (and optionally storeName).
   */
  async updateSettings(merchantId, { razorpayKeyId, razorpayKeySecret, codEnabled, storeName }) {
    const update = {};
    if (razorpayKeyId !== undefined) update.razorpayKeyId = razorpayKeyId;
    if (codEnabled !== undefined) update.codEnabled = codEnabled;
    if (storeName !== undefined) update.storeName = storeName;

    if (useDB()) {
      if (razorpayKeySecret) {
        update.razorpayKeySecret = razorpayKeySecret;
      }
      await MerchantSchema.findOneAndUpdate({ merchantId }, { $set: update }, { new: true });
    } else {
      const idx = memMerchants.findIndex((m) => m.merchantId === merchantId);
      if (idx === -1) throw new Error('Merchant not found');
      if (razorpayKeyId !== undefined) memMerchants[idx].razorpayKeyId = razorpayKeyId;
      if (razorpayKeySecret) memMerchants[idx].razorpayKeySecret = razorpayKeySecret;
      if (codEnabled !== undefined) memMerchants[idx].codEnabled = codEnabled;
      if (storeName !== undefined) memMerchants[idx].storeName = storeName;
    }

    return this.getSettings(merchantId);
  },

  /**
   * List all stores for the store directory.
   */
  async listMerchants() {
    if (useDB()) {
      const docs = await MerchantSchema.find({}, 'merchantId storeName').lean();
      return docs.map((d) => ({ merchantId: d.merchantId, storeName: d.storeName }));
    }
    return memMerchants.map((m) => ({ merchantId: m.merchantId, storeName: m.storeName }));
  },
};

module.exports = Merchant;
