const Product = require('./Product');

const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 500;

/**
 * In-memory cart storage.
 * Each item: { productId: string, quantity: number }
 */
let cartItems = [];

/**
 * Cart Model
 * Manages an in-memory shopping cart with full product detail enrichment.
 */
const Cart = {
  /**
   * Get the current cart with full product details and line subtotals.
   * @returns {Array} Cart items enriched with product data and subtotals
   */
  getCart() {
    return cartItems
      .map((item) => {
        const product = Product.getById(item.productId);
        if (!product) return null;
        return {
          productId: item.productId,
          quantity: item.quantity,
          product,
          subtotal: parseFloat((product.price * item.quantity).toFixed(2)),
        };
      })
      .filter(Boolean);
  },

  /**
   * Add an item to the cart. If the product already exists, increment quantity.
   * @param {string} productId - The product ID to add
   * @param {number} quantity - Quantity to add (default 1)
   * @returns {Object} The updated cart item
   */
  addItem(productId, quantity = 1) {
    const product = Product.getById(productId);
    if (!product) {
      throw new Error(`Product with id '${productId}' not found`);
    }

    const existing = cartItems.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      return {
        productId: existing.productId,
        quantity: existing.quantity,
        product,
        subtotal: parseFloat((product.price * existing.quantity).toFixed(2)),
      };
    }

    const newItem = { productId, quantity };
    cartItems.push(newItem);
    return {
      productId,
      quantity,
      product,
      subtotal: parseFloat((product.price * quantity).toFixed(2)),
    };
  },

  /**
   * Update the quantity of an item in the cart.
   * If quantity is 0, the item is removed.
   * @param {string} productId - The product ID to update
   * @param {number} quantity - The new quantity
   * @returns {Object|null} The updated cart item, or null if removed
   */
  updateItem(productId, quantity) {
    const index = cartItems.findIndex((item) => item.productId === productId);
    if (index === -1) {
      throw new Error(`Item '${productId}' is not in the cart`);
    }

    if (quantity <= 0) {
      cartItems.splice(index, 1);
      return null;
    }

    cartItems[index].quantity = quantity;
    const product = Product.getById(productId);
    return {
      productId,
      quantity,
      product,
      subtotal: parseFloat((product.price * quantity).toFixed(2)),
    };
  },

  /**
   * Remove an item from the cart entirely.
   * @param {string} productId - The product ID to remove
   * @returns {boolean} True if the item was removed
   */
  removeItem(productId) {
    const index = cartItems.findIndex((item) => item.productId === productId);
    if (index === -1) {
      throw new Error(`Item '${productId}' is not in the cart`);
    }
    cartItems.splice(index, 1);
    return true;
  },

  /**
   * Clear all items from the cart.
   */
  clearCart() {
    cartItems = [];
  },

  /**
   * Calculate cart totals including conditional delivery fee.
   * Delivery is free for orders $35 and above.
   * @returns {Object} { subtotal, deliveryFee, total }
   */
  getTotal() {
    const enrichedItems = this.getCart();
    const subtotal = parseFloat(
      enrichedItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
    );
    const deliveryFee =
      subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
    const total = parseFloat((subtotal + deliveryFee).toFixed(2));

    return { subtotal, deliveryFee, total };
  },

  /**
   * Get raw cart items (used internally for order creation).
   * @returns {Array} Raw cart items array
   */
  getRawItems() {
    return [...cartItems];
  },
};

module.exports = Cart;
