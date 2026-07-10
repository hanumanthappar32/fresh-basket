/**
 * Fresh Basket — Home Page
 */
window.HomePage = {
  _debounceTimer: null,
  _currentCategory: 'All',
  _searchQuery: '',

  /**
   * Render the home page.
   */
  async render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    // Show loading
    content.innerHTML = `
      <section class="hero">
        <div class="container">
          <h1 class="hero-title">Fresh groceries,<br><span class="highlight">delivered to you</span></h1>
          <p class="hero-subtitle">Shop premium quality fruits, vegetables, dairy and more — all from the comfort of your home.</p>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" id="search-input" placeholder="Search for products..." autocomplete="off">
            <button type="button" id="search-btn">Search</button>
          </div>
        </div>
      </section>
      <section class="container">
        <div class="category-tabs" id="category-tabs">
          <button class="category-tab active" data-category="All">🛒 All</button>
        </div>
        <div class="product-grid" id="product-grid">
          <div class="loading-spinner"></div>
        </div>
      </section>
    `;

    // Load categories
    this._loadCategories();
    // Load products
    this._loadProducts();
    // Bind events
    this._bindEvents(content);
  },

  /**
   * Load categories from API.
   */
  async _loadCategories() {
    try {
      const categories = await API.getCategories();
      const container = document.getElementById('category-tabs');
      if (!container) return;

      const categoryEmojis = {
        All: '🛒', Fruits: '🍎', Vegetables: '🥦', Dairy: '🥛',
        Bakery: '🍞', Beverages: '🥤', Snacks: '🍿', Pantry: '🫙', Frozen: '🧊',
      };

      let html = '<button class="category-tab active" data-category="All">🛒 All</button>';
      categories.forEach((cat) => {
        const name = typeof cat === 'string' ? cat : cat.name;
        const emoji = categoryEmojis[name] || '📦';
        html += `<button class="category-tab" data-category="${name}">${emoji} ${name}</button>`;
      });
      container.innerHTML = html;
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  },

  /**
   * Load and render products.
   */
  async _loadProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const category = this._currentCategory !== 'All' ? this._currentCategory : undefined;
      const search = this._searchQuery || undefined;
      const products = await API.getProducts(category, search);

      if (!products || products.length === 0) {
        grid.innerHTML = `
          <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search term or category.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = products.map((p) => ProductCard.render(p)).join('');
    } catch (e) {
      console.error('Failed to load products:', e);
      grid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>Please try again later.</p>
        </div>
      `;
    }
  },

  /**
   * Bind event delegation.
   */
  _bindEvents(content) {
    // Event delegation on #app-content
    content.addEventListener('click', (e) => {
      // Category tabs
      const tab = e.target.closest('.category-tab');
      if (tab) {
        document.querySelectorAll('.category-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this._currentCategory = tab.dataset.category;
        this._loadProducts();
        return;
      }

      // Quantity minus
      const minus = e.target.closest('.qty-minus');
      if (minus && !minus.classList.contains('cart-qty-minus')) {
        const id = minus.dataset.productId;
        const el = document.getElementById(`qty-${id}`);
        if (el) {
          let val = parseInt(el.textContent, 10);
          if (val > 1) el.textContent = --val;
        }
        return;
      }

      // Quantity plus
      const plus = e.target.closest('.qty-plus');
      if (plus && !plus.classList.contains('cart-qty-plus')) {
        const id = plus.dataset.productId;
        const el = document.getElementById(`qty-${id}`);
        if (el) {
          let val = parseInt(el.textContent, 10);
          if (val < 99) el.textContent = ++val;
        }
        return;
      }

      // Add to cart
      const addBtn = e.target.closest('.btn-add-cart');
      if (addBtn) {
        const productId = addBtn.dataset.productId;
        const productName = addBtn.dataset.productName;
        const qtyEl = document.getElementById(`qty-${productId}`);
        const quantity = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
        this._addToCart(productId, quantity, productName);
        return;
      }
    });

    // Search input with debounce
    content.addEventListener('input', (e) => {
      if (e.target.id === 'search-input') {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          this._searchQuery = e.target.value.trim();
          this._loadProducts();
        }, 300);
      }
    });

    // Search button click
    content.addEventListener('click', (e) => {
      if (e.target.id === 'search-btn' || e.target.closest('#search-btn')) {
        const input = document.getElementById('search-input');
        if (input) {
          this._searchQuery = input.value.trim();
          this._loadProducts();
        }
      }
    });

    // Enter key in search
    content.addEventListener('keydown', (e) => {
      if (e.target.id === 'search-input' && e.key === 'Enter') {
        clearTimeout(this._debounceTimer);
        this._searchQuery = e.target.value.trim();
        this._loadProducts();
      }
    });
  },

  /**
   * Add product to cart via API.
   */
  async _addToCart(productId, quantity, productName) {
    try {
      await API.addToCart(productId, quantity);
      Toast.show(`${productName || 'Item'} added to cart!`, 'success');
      Header.updateCartCount();
    } catch (e) {
      Toast.show('Failed to add item to cart', 'error');
    }
  },
};
