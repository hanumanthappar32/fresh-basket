/**
 * Fresh Basket — Cart Item Component
 */
window.CartItem = {
  /**
   * Render a single cart item row.
   * @param {object} item - Cart item data (product + quantity).
   * @returns {string} HTML string.
   */
  render(item) {
    const product = item.product || item;
    const price = product.price || 0;
    const quantity = item.quantity || 1;
    const lineTotal = (price * quantity).toFixed(2);

    return `
      <div class="cart-item" data-product-id="${product.id}">
        <div class="cart-item-emoji">
          <span>${product.image || '🛒'}</span>
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${product.name}</h4>
          <span class="cart-item-unit-price">₹${price.toFixed(2)} / ${product.unit || 'No.'}</span>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn qty-circle cart-qty-minus" data-product-id="${product.id}" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${quantity}</span>
          <button class="qty-btn qty-circle cart-qty-plus" data-product-id="${product.id}" aria-label="Increase quantity">+</button>
        </div>
        <div class="cart-item-total">
          <span class="line-total">₹${lineTotal}</span>
        </div>
        <button class="cart-item-remove" data-product-id="${product.id}" aria-label="Remove item">
          <span>✕</span>
        </button>
      </div>
    `;
  },
};
