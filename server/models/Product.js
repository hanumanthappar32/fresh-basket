const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '../data/products.json');

// Load products from the JSON data file
let products = require(DATA_FILE);

/**
 * Persist current products array to the JSON file.
 */
function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

/**
 * Generate the next product ID based on existing IDs.
 */
function nextId() {
  const nums = products.map((p) => {
    const match = p.id.match(/prod_(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `prod_${String(max + 1).padStart(3, '0')}`;
}

/**
 * Product Model
 * Provides data access methods for the product catalog.
 */
const Product = {
  /**
   * Get all products.
   * @returns {Array} All products
   */
  getAll() {
    return products;
  },

  /**
   * Get a single product by its ID.
   * @param {string} id - The product ID (e.g. 'prod_001')
   * @returns {Object|undefined} The product or undefined if not found
   */
  getById(id) {
    return products.find((p) => p.id === id);
  },

  /**
   * Get all products in a given category (case-insensitive).
   * @param {string} category - The category name
   * @returns {Array} Products matching the category
   */
  getByCategory(category) {
    const lower = category.toLowerCase();
    return products.filter((p) => p.category.toLowerCase() === lower);
  },

  /**
   * Search products by name or description (case-insensitive partial match).
   * @param {string} query - The search query
   * @returns {Array} Products matching the query
   */
  search(query) {
    const lower = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower)
    );
  },

  /**
   * Get a list of unique product categories.
   * @returns {Array<string>} Unique category names
   */
  getCategories() {
    return [...new Set(products.map((p) => p.category))];
  },

  /**
   * Add a new product.
   * @param {Object} data - Product data (name, category, price, unit, image, description, rating)
   * @returns {Object} The newly created product
   */
  create(data) {
    const product = {
      id: nextId(),
      name: data.name,
      category: data.category || 'Pantry',
      price: parseFloat(data.price) || 0,
      unit: data.unit || 'each',
      image: data.image || '📦',
      description: data.description || '',
      inStock: data.inStock !== undefined ? data.inStock : true,
      rating: parseFloat(data.rating) || 4.0,
    };
    products.push(product);
    save();
    return product;
  },

  /**
   * Update an existing product.
   * @param {string} id - The product ID
   * @param {Object} data - Fields to update
   * @returns {Object|null} The updated product or null if not found
   */
  update(id, data) {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const allowed = ['name', 'category', 'price', 'unit', 'image', 'description', 'inStock', 'rating'];
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        if (key === 'price' || key === 'rating') {
          products[index][key] = parseFloat(data[key]);
        } else if (key === 'inStock') {
          products[index][key] = Boolean(data[key]);
        } else {
          products[index][key] = data[key];
        }
      }
    });

    save();
    return products[index];
  },

  /**
   * Delete a product by ID.
   * @param {string} id - The product ID
   * @returns {boolean} True if deleted, false if not found
   */
  delete(id) {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    save();
    return true;
  },
};

module.exports = Product;
