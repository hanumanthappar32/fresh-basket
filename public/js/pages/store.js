/**
 * Fresh Basket — Storefront Page (scoped to a specific merchant/store)
 */
window.StorePage = {
  _debounceTimer: null,
  _currentCategory: 'All',
  _searchQuery: '',
  _storeInfo: null,

  /**
   * Render the storefront.
   */
  async render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    const storeId = window.currentStoreId;
    if (!storeId) {
      window.navigateTo('#/');
      return;
    }

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      this._storeInfo = await API.getStore(storeId);

      content.innerHTML = `
        <div id="store-page-wrapper">
          <section class="hero" style="background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.05) 100%); border-bottom: 1px solid var(--border);">
            <div class="container" style="text-align: center; padding: 60px 20px;">
              <div style="font-size: 3rem; margin-bottom: 16px;">🏪</div>
              <h1 class="hero-title" style="font-size: 2.5rem; margin-bottom: 8px;">${this._storeInfo.storeName}</h1>
              <p class="hero-subtitle" style="max-width: 600px; margin: 0 auto 24px;">Welcome to our store! Shop fresh fruits, vegetables, bakery and more.</p>
              <div class="search-bar" style="margin: 0 auto; max-width: 500px;">
                <span class="search-icon">🔍</span>
                <input type="text" id="search-input" placeholder="Search in this store..." autocomplete="off">
                <button type="button" id="search-btn">Search</button>
              </div>
              <button class="btn btn-secondary" onclick="window.navigateTo('#/')" style="margin-top: 24px; padding: 8px 16px; font-size: 0.85rem;">← Back to Stores</button>
            </div>
          </section>
          <section class="container" style="padding-top: 40px;">
            <div class="category-tabs" id="category-tabs">
              <button class="category-tab active" data-category="All">🛒 All</button>
            </div>
            <div class="product-grid" id="product-grid">
              <div class="loading-spinner"></div>
            </div>
          </section>
        </div>
      `;

      await this._loadCategories();
      await this._loadProducts();
      this._bindEvents();
    } catch (err) {
      console.error(err);
      content.innerHTML = `
        <div style="text-align:center; padding:120px 20px;">
          <div style="font-size:3rem; margin-bottom:16px;">🤷</div>
          <h2>Store not found</h2>
          <p style="color:var(--text-secondary); margin-bottom:24px;">The store you are looking for does not exist.</p>
          <button class="btn btn-primary" onclick="window.navigateTo('#/')">Back to Home</button>
        </div>
      `;
    }
  },

  /**
   * Load categories.
   */
  async _loadCategories() {
    try {
      const categories = await API.getCategories(window.currentStoreId);
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
   * Load and render products scoped to this store.
   */
  async _loadProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const category = this._currentCategory !== 'All' ? this._currentCategory : undefined;
      const search = this._searchQuery || undefined;
      const products = await API.getProducts(category, search, window.currentStoreId);

      if (!products || products.length === 0) {
        grid.innerHTML = `
          <div class="no-results" style="padding: 60px 20px;">
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
   * Bind event handlers.
   */
  _bindEvents() {
    const wrapper = document.getElementById('store-page-wrapper');
    if (!wrapper) return;

    wrapper.addEventListener('click', async (e) => {
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
        
        await this._addToCart(productId, quantity, productName);
        return;
      }
    });

    // Search input with debounce
    wrapper.addEventListener('input', (e) => {
      if (e.target.id === 'search-input') {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          this._searchQuery = e.target.value.trim();
          this._loadProducts();
        }, 300);
      }
    });

    // Search button click
    wrapper.addEventListener('click', (e) => {
      if (e.target.id === 'search-btn' || e.target.closest('#search-btn')) {
        const input = document.getElementById('search-input');
        if (input) {
          this._searchQuery = input.value.trim();
          this._loadProducts();
        }
      }
    });

    // Enter key in search
    wrapper.addEventListener('keydown', (e) => {
      if (e.target.id === 'search-input' && e.key === 'Enter') {
        clearTimeout(this._debounceTimer);
        this._searchQuery = e.target.value.trim();
        this._loadProducts();
      }
    });
  },

  /**
   * Scoped cart check: Prompt and clear cart if items are from another store.
   */
  async _addToCart(productId, quantity, productName) {
    try {
      const cart = await API.getCart();
      const firstItem = cart.items && cart.items[0];

      if (firstItem && firstItem.product && firstItem.product.merchantId !== window.currentStoreId) {
        const clearConfirm = confirm(
          `Your cart contains items from another store. Would you like to clear your cart to shop from "${this._storeInfo.storeName}"?`
        );
        if (clearConfirm) {
          await API.clearCart();
        } else {
          return;
        }
      }

      await API.addToCart(productId, quantity);
      Toast.show(`${productName || 'Item'} added to cart!`, 'success');
      Header.updateCartCount();
    } catch (e) {
      console.error(e);
      Toast.show('Failed to add item to cart', 'error');
    }
  },
};
