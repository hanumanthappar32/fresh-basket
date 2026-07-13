/**
 * Fresh Basket — Merchant Dashboard (Products Management)
 */
window.MerchantDashboardPage = {
  _products: [],
  _editingId: null,

  /**
   * Render the dashboard page.
   */
  async render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    const merchantId = localStorage.getItem('merchantId');
    if (!merchantId) {
      window.navigateTo('#/merchant/login');
      return;
    }

    content.innerHTML = `
      <div class="admin-page" id="merchant-dashboard-wrapper">
        <div class="container">
          <div class="admin-tabs">
            <button class="admin-tab active" data-tab="products">🔧 Products</button>
            <button class="admin-tab" data-tab="orders" onclick="window.navigateTo('#/merchant/orders')">📦 Orders</button>
            <button class="admin-tab" data-tab="settings" onclick="window.navigateTo('#/merchant/settings')">⚙️ Settings</button>
          </div>
          <div class="admin-header">
            <div>
              <h1 class="admin-title">🔧 Product Manager</h1>
              <p class="admin-subtitle">Add, edit, and delete products from your store</p>
            </div>
            <button class="btn btn-primary" id="add-product-btn">
              <span class="btn-icon">＋</span> Add Product
            </button>
          </div>
          <div id="product-form-container"></div>
          <div class="admin-search-bar">
            <span>🔍</span>
            <input type="text" id="admin-search" placeholder="Search products..." autocomplete="off">
          </div>
          <div id="admin-products-table">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    `;

    await this._loadProducts();
    this._bindEvents();
  },

  /**
   * Load products and render table.
   */
  async _loadProducts(searchQuery) {
    const container = document.getElementById('admin-products-table');
    if (!container) return;

    const merchantId = localStorage.getItem('merchantId');

    try {
      const products = await API.getProducts(undefined, searchQuery, merchantId);
      this._products = products || [];

      if (this._products.length === 0) {
        container.innerHTML = `
          <div class="empty-cart" style="padding:40px;">
            <div class="empty-cart-icon">📦</div>
            <h2>No products found</h2>
            <p>Click "Add Product" to create your first product.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Rating</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this._products.map((p) => `
                <tr data-product-id="${p.id}">
                  <td>
                    <div class="admin-product-cell">
                      <span class="admin-product-emoji">${p.image || '📦'}</span>
                      <div>
                        <div class="admin-product-name">${p.name}</div>
                        <div class="admin-product-desc">${(p.description || '').substring(0, 50)}${(p.description || '').length > 50 ? '...' : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="product-category-badge" style="background:rgba(255,255,255,0.08);color:var(--text-secondary);">${p.category}</span></td>
                  <td class="admin-price">₹${(p.price || 0).toFixed(2)}</td>
                  <td>${p.unit || 'No.'}</td>
                  <td><span class="stars"><span class="star filled">★</span></span> ${(p.rating || 0).toFixed(1)}</td>
                  <td>${p.inStock ? '<span style="color:var(--success);">● In Stock</span>' : '<span style="color:var(--danger);">● Out</span>'}</td>
                  <td>
                    <div class="admin-actions">
                      <button class="admin-action-btn admin-edit-btn" data-product-id="${p.id}" title="Edit">✏️</button>
                      <button class="admin-action-btn admin-delete-btn" data-product-id="${p.id}" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <p class="admin-count">${this._products.length} product${this._products.length !== 1 ? 's' : ''}</p>
      `;
    } catch (e) {
      console.error('Failed to load admin products:', e);
      container.innerHTML = '<p style="color:var(--danger);text-align:center;padding:40px;">Failed to load products.</p>';
    }
  },

  /**
   * Show the add/edit product form.
   */
  _showForm(product) {
    const container = document.getElementById('product-form-container');
    if (!container) return;

    this._editingId = product ? product.id : null;
    const isEdit = !!product;
    const title = isEdit ? 'Edit Product' : 'Add New Product';
    const btnText = isEdit ? 'Save Changes' : 'Create Product';

    const standardCats = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Pantry', 'Frozen'];
    const currentCats = [...new Set(this._products.map((p) => p.category))];
    const allCats = [...new Set([...standardCats, ...currentCats])];
    
    const emojis = ['🍎','🍌','🍊','🍇','🥑','🍓','🫐','🥬','🍅','🥕','🫑','🥦','🌽','🥛','🥣','🧀','🥚','🧈','🍞','🥐','🥯','🧁','🫓','🧃','💧','☕','🍵','🥜','🍫','🌮','🥭','🫒','🍚','🍝','🥫','🍯','🫘','🍕','🍦','🥩','🍗','🐟','🧇','📦'];

    container.innerHTML = `
      <div class="admin-form-card">
        <div class="admin-form-header">
          <h3>${title}</h3>
          <button class="admin-action-btn" id="close-form-btn" title="Close">✕</button>
        </div>
        <form id="product-form">
          <div class="admin-form-grid">
            <div class="form-group">
              <label for="pf-name">Product Name *</label>
              <input type="text" id="pf-name" placeholder="e.g. Organic Bananas" value="${isEdit ? product.name : ''}" required>
            </div>
            <div class="form-group">
              <label for="pf-category">Category *</label>
              <select id="pf-category" style="width:100%;padding:14px 16px;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:0.9rem;outline:none;">
                ${allCats.map((c) => `<option value="${c}" ${isEdit && product.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                <option value="__custom__">+ Add Custom Category...</option>
              </select>
              <div id="custom-category-group" style="display:none; margin-top:12px;">
                <label for="pf-custom-category" style="font-size:0.85rem; margin-bottom:4px; display:block;">Custom Category Name *</label>
                <input type="text" id="pf-custom-category" placeholder="e.g. Meat & Seafood" style="width:100%;padding:10px 12px;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:0.9rem;">
              </div>
            </div>
            <div class="form-group">
              <label for="pf-price">Price (₹) *</label>
              <input type="number" id="pf-price" step="0.01" min="0" placeholder="99.00" value="${isEdit ? product.price : ''}" required>
            </div>
            <div class="form-group">
              <label for="pf-unit">Unit *</label>
              <select id="pf-unit" style="width:100%;padding:14px 16px;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:0.9rem;outline:none;">
                ${['No.','Kg','g','L','mL','Pack','Box','Bag','Dozen','Bottle','Bundle','Can','Loaf'].map((u) => `<option value="${u}" ${isEdit && product.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="pf-emoji">Emoji Icon</label>
              <div class="admin-emoji-picker">
                <input type="text" id="pf-emoji" maxlength="4" value="${isEdit ? (product.image || '📦') : '📦'}" style="text-align:center;font-size:1.5rem;width:60px;">
                <div class="admin-emoji-options">
                  ${emojis.map((e) => `<button type="button" class="admin-emoji-opt" data-emoji="${e}">${e}</button>`).join('')}
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="pf-rating">Rating (1-5)</label>
              <input type="number" id="pf-rating" step="0.1" min="1" max="5" placeholder="4.5" value="${isEdit ? (product.rating || 4.0) : '4.0'}">
            </div>
          </div>
          <div class="form-group">
            <label for="pf-description">Description</label>
            <textarea id="pf-description" placeholder="Describe the product...">${isEdit ? (product.description || '') : ''}</textarea>
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" id="pf-instock" ${(!isEdit || product.inStock) ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--primary);">
            <label for="pf-instock" style="margin:0;">In Stock</label>
          </div>
          <div class="admin-form-actions">
            <button type="button" class="btn btn-secondary" id="cancel-form-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">${btnText}</button>
          </div>
        </form>
      </div>
    `;

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  _hideForm() {
    const container = document.getElementById('product-form-container');
    if (container) container.innerHTML = '';
    this._editingId = null;
  },

  _bindEvents() {
    const wrapper = document.getElementById('merchant-dashboard-wrapper');
    if (!wrapper) return;

    let searchTimer = null;

    wrapper.addEventListener('click', async (e) => {
      // Add Product button
      if (e.target.id === 'add-product-btn' || e.target.closest('#add-product-btn')) {
        this._showForm(null);
        return;
      }

      // Close / Cancel form
      if (e.target.id === 'close-form-btn' || e.target.id === 'cancel-form-btn' ||
          e.target.closest('#close-form-btn') || e.target.closest('#cancel-form-btn')) {
        this._hideForm();
        return;
      }

      // Emoji picker
      const emojiOpt = e.target.closest('.admin-emoji-opt');
      if (emojiOpt) {
        e.preventDefault();
        const input = document.getElementById('pf-emoji');
        if (input) input.value = emojiOpt.dataset.emoji;
        return;
      }

      // Edit button
      const editBtn = e.target.closest('.admin-edit-btn');
      if (editBtn) {
        const id = editBtn.dataset.productId;
        const product = this._products.find((p) => p.id === id);
        if (product) this._showForm(product);
        return;
      }

      // Delete button
      const deleteBtn = e.target.closest('.admin-delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.dataset.productId;
        const product = this._products.find((p) => p.id === id);
        if (product && confirm(`Delete "${product.name}"? This cannot be undone.`)) {
          try {
            await API.deleteProduct(id);
            Toast.show(`"${product.name}" deleted`, 'info');
            await this._loadProducts();
          } catch (err) {
            Toast.show('Failed to delete product', 'error');
          }
        }
        return;
      }
    });

    // Custom category toggle
    wrapper.addEventListener('change', (e) => {
      if (e.target.id === 'pf-category') {
        const customGroup = document.getElementById('custom-category-group');
        const customInput = document.getElementById('pf-custom-category');
        if (e.target.value === '__custom__') {
          if (customGroup) customGroup.style.display = 'block';
          if (customInput) customInput.required = true;
        } else {
          if (customGroup) customGroup.style.display = 'none';
          if (customInput) {
            customInput.required = false;
            customInput.value = '';
          }
        }
      }
    });

    // Form submit
    wrapper.addEventListener('submit', async (e) => {
      if (e.target.id === 'product-form') {
        e.preventDefault();

        const catSelect = document.getElementById('pf-category').value;
        const customCat = document.getElementById('pf-custom-category').value.trim();
        const category = catSelect === '__custom__' ? customCat : catSelect;

        if (!category) {
          Toast.show('Please select or specify a category', 'error');
          return;
        }

        const data = {
          name: document.getElementById('pf-name').value.trim(),
          category: category,
          price: parseFloat(document.getElementById('pf-price').value),
          unit: document.getElementById('pf-unit').value || 'No.',
          image: document.getElementById('pf-emoji').value.trim() || '📦',
          rating: parseFloat(document.getElementById('pf-rating').value) || 4.0,
          description: document.getElementById('pf-description').value.trim(),
          inStock: document.getElementById('pf-instock').checked,
        };

        try {
          if (this._editingId) {
            await API.updateProduct(this._editingId, data);
            Toast.show(`"${data.name}" updated!`, 'success');
          } else {
            await API.createProduct(data);
            Toast.show(`"${data.name}" created!`, 'success');
          }
          this._hideForm();
          await this._loadProducts();
        } catch (err) {
          Toast.show('Failed to save product', 'error');
        }
      }
    });

    // Search
    wrapper.addEventListener('input', (e) => {
      if (e.target.id === 'admin-search') {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          this._loadProducts(e.target.value.trim() || undefined);
        }, 300);
      }
    });
  }
};
