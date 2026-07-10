/**
 * Fresh Basket — Product Card Component
 */
window.ProductCard = {
  /**
   * Category color map for emoji backgrounds.
   */
  _categoryColors: {
    Fruits: '#4ade80',
    Vegetables: '#22c55e',
    Dairy: '#60a5fa',
    Bakery: '#f59e0b',
    Beverages: '#a78bfa',
    Snacks: '#f472b6',
    Pantry: '#fb923c',
    Frozen: '#22d3ee',
  },

  /**
   * Render a product card.
   * @param {object} product - Product data.
   * @returns {string} HTML string.
   */
  render(product) {
    const color = this._categoryColors[product.category] || '#4ade80';
    const colorDark = color + '33'; // ~20% opacity
    const stars = this._renderStars(product.rating || 0);
    const reviewCount = product.rating || 0;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-emoji-area" style="background: linear-gradient(135deg, ${colorDark}, transparent);">
          <span class="product-emoji">${product.image || '🛒'}</span>
        </div>
        <div class="product-info">
          <div class="product-header-row">
            <h3 class="product-name">${product.name}</h3>
            <span class="product-category-badge" style="background: ${colorDark}; color: ${color};">${product.category}</span>
          </div>
          <div class="product-rating">
            ${stars}
            <span class="rating-count">(${reviewCount})</span>
          </div>
          <p class="product-description">${product.description || ''}</p>
          <div class="product-footer">
            <div class="product-price-group">
              <span class="product-price">₹${(product.price || 0).toFixed(2)}</span>
              <span class="product-unit">/ ${product.unit || 'No.'}</span>
            </div>
            <div class="product-actions">
              <div class="quantity-selector">
                <button class="qty-btn qty-minus" data-product-id="${product.id}" aria-label="Decrease quantity">−</button>
                <span class="qty-value" id="qty-${product.id}">1</span>
                <button class="qty-btn qty-plus" data-product-id="${product.id}" aria-label="Increase quantity">+</button>
              </div>
              <button class="btn btn-add-cart" data-product-id="${product.id}" data-product-name="${product.name}">
                <span class="btn-icon">🛒</span> Add
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Render star rating.
   * @param {number} rating - Rating value (0-5).
   * @returns {string} HTML string of stars.
   */
  _renderStars(rating) {
    let html = '<span class="stars">';
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        html += '<span class="star filled">★</span>';
      } else if (rating >= i - 0.5) {
        html += '<span class="star half">★</span>';
      } else {
        html += '<span class="star empty">★</span>';
      }
    }
    html += '</span>';
    return html;
  },
};
