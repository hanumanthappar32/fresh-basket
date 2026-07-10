/**
 * Seed MongoDB with products from products.json.
 * Usage: MONGODB_URI=your_uri node server/seed.js
 */
const mongoose = require('mongoose');
const path = require('path');
const ProductSchema = require('./schemas/Product');
const products = require('./data/products.json');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Set MONGODB_URI environment variable first.');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await ProductSchema.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert seed data
    const docs = products.map((p) => ({
      productId: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      unit: p.unit,
      image: p.image,
      description: p.description,
      inStock: p.inStock,
      rating: p.rating,
    }));

    await ProductSchema.insertMany(docs);
    console.log(`🌱 Seeded ${docs.length} products`);

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
