const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '../data/products.json');
const seedData = require(DATA_FILE);

let ProductSchema;
try { ProductSchema = require('../schemas/Product'); } catch (e) { ProductSchema = null; }

/**
 * Check if MongoDB is connected.
 */
function useDB() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1 && ProductSchema;
}

// In-memory fallback
let memProducts = [...seedData];

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(memProducts, null, 2), 'utf-8');
}

function nextId() {
  const nums = memProducts.map((p) => {
    const match = (p.productId || p.id).match(/prod_(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });
  return `prod_${String(Math.max(...nums, 0) + 1).padStart(3, '0')}`;
}

async function nextIdDB() {
  const last = await ProductSchema.findOne().sort({ productId: -1 });
  if (!last) return 'prod_001';
  const match = last.productId.match(/prod_(\d+)/);
  const num = match ? parseInt(match[1], 10) + 1 : 1;
  return `prod_${String(num).padStart(3, '0')}`;
}

/**
 * Normalize a DB document to plain object with `id` field.
 */
function normalize(doc) {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj.productId || obj.id;
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
}

const Product = {
  async getAll() {
    if (useDB()) {
      const docs = await ProductSchema.find().lean();
      return docs.map((d) => ({ ...d, id: d.productId, _id: undefined, __v: undefined }));
    }
    return memProducts;
  },

  async getById(id) {
    if (useDB()) {
      const doc = await ProductSchema.findOne({ productId: id });
      return doc ? normalize(doc) : undefined;
    }
    return memProducts.find((p) => p.id === id);
  },

  async getByCategory(category) {
    const lower = category.toLowerCase();
    if (useDB()) {
      const docs = await ProductSchema.find({ category: new RegExp(`^${lower}$`, 'i') }).lean();
      return docs.map((d) => ({ ...d, id: d.productId, _id: undefined, __v: undefined }));
    }
    return memProducts.filter((p) => p.category.toLowerCase() === lower);
  },

  async search(query) {
    const lower = query.toLowerCase();
    if (useDB()) {
      const regex = new RegExp(query, 'i');
      const docs = await ProductSchema.find({
        $or: [{ name: regex }, { description: regex }],
      }).lean();
      return docs.map((d) => ({ ...d, id: d.productId, _id: undefined, __v: undefined }));
    }
    return memProducts.filter(
      (p) => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower)
    );
  },

  async getCategories() {
    if (useDB()) {
      return await ProductSchema.distinct('category');
    }
    return [...new Set(memProducts.map((p) => p.category))];
  },

  async create(data) {
    if (useDB()) {
      const productId = await nextIdDB();
      const doc = await ProductSchema.create({
        productId,
        name: data.name,
        category: data.category || 'Pantry',
        price: parseFloat(data.price) || 0,
        unit: data.unit || 'No.',
        image: data.image || '📦',
        description: data.description || '',
        inStock: data.inStock !== undefined ? data.inStock : true,
        rating: parseFloat(data.rating) || 4.0,
      });
      return normalize(doc);
    }
    const product = {
      id: nextId(),
      name: data.name,
      category: data.category || 'Pantry',
      price: parseFloat(data.price) || 0,
      unit: data.unit || 'No.',
      image: data.image || '📦',
      description: data.description || '',
      inStock: data.inStock !== undefined ? data.inStock : true,
      rating: parseFloat(data.rating) || 4.0,
    };
    memProducts.push(product);
    save();
    return product;
  },

  async update(id, data) {
    if (useDB()) {
      const allowed = ['name', 'category', 'price', 'unit', 'image', 'description', 'inStock', 'rating'];
      const update = {};
      allowed.forEach((key) => {
        if (data[key] !== undefined) {
          if (key === 'price' || key === 'rating') update[key] = parseFloat(data[key]);
          else if (key === 'inStock') update[key] = Boolean(data[key]);
          else update[key] = data[key];
        }
      });
      const doc = await ProductSchema.findOneAndUpdate({ productId: id }, update, { new: true });
      return doc ? normalize(doc) : null;
    }
    const index = memProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const allowed = ['name', 'category', 'price', 'unit', 'image', 'description', 'inStock', 'rating'];
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        if (key === 'price' || key === 'rating') memProducts[index][key] = parseFloat(data[key]);
        else if (key === 'inStock') memProducts[index][key] = Boolean(data[key]);
        else memProducts[index][key] = data[key];
      }
    });
    save();
    return memProducts[index];
  },

  async delete(id) {
    if (useDB()) {
      const result = await ProductSchema.deleteOne({ productId: id });
      return result.deletedCount > 0;
    }
    const index = memProducts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    memProducts.splice(index, 1);
    save();
    return true;
  },
};

module.exports = Product;
