const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas.
 * Uses MONGODB_URI from environment variables.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set — using in-memory fallback.');
    console.warn('   Set MONGODB_URI in your .env or Render environment to enable persistent data.');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
