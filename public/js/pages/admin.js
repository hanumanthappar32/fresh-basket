/**
 * Fresh Basket — Admin Page
 * Manage products: add, edit, delete.
 */
window.AdminPage = {
  _products: [],
  _editingId: null,
  _authenticated: false,

  /**
   * Render the admin page.
   */
  async render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    // Check if already authenticated this session
    if (!this._authenticated) {
      this._showLogin(content);
      return;
    }

    content.innerHTML = `
      <div class="admin-page">
        <div class="container">
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
    this._bindEvents(content);
  },

  /**
   * Load products and render table.
   */
  async _loadProducts(searchQuery) {
    const container = document.getElementById('admin-products-table');
    if (!container) return;

    try {
      const products = await API.getProducts(undefined, searchQuery);
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

    const categories = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Pantry', 'Frozen'];
    const emojis = ['🍎','🍌','🍊','🍇','🥑','🍓','🫐','🥬','🍅','🥕','🫑','🥦','🌽','🥛','🥣','🧀','🥚','🧈','🍞','🥐','🥯','🧁','🫓','🧃','💧','☕','🍵','🥜','🍫','🌮','🥭','🫒','🍚','🍝','🥫','🍯','🫘','🍕','🍦','🫐','🍗','🧇','📦'];

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
                ${categories.map((c) => `<option value="${c}" ${isEdit && product.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
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

    // Scroll to form
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /**
   * Hide the form.
   */
  _hideForm() {
    const container = document.getElementById('product-form-container');
    if (container) container.innerHTML = '';
    this._editingId = null;
  },

  /**
   * Bind events.
   */
  _bindEvents(content) {
    let searchTimer = null;

    content.addEventListener('click', async (e) => {
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

    // Form submit
    content.addEventListener('submit', async (e) => {
      if (e.target.id === 'product-form') {
        e.preventDefault();
        const data = {
          name: document.getElementById('pf-name').value.trim(),
          category: document.getElementById('pf-category').value,
          price: parseFloat(document.getElementById('pf-price').value),
          unit: document.getElementById('pf-unit').value || 'No.',
          image: document.getElementById('pf-emoji').value.trim() || '📦',
          rating: parseFloat(document.getElementById('pf-rating').value) || 4.0,
          description: document.getElementById('pf-description').value.trim(),
          inStock: document.getElementById('pf-instock').checked,
        };

        if (!data.name || !data.category || isNaN(data.price)) {
          Toast.show('Please fill in name, category, and price', 'error');
          return;
        }

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
    content.addEventListener('input', (e) => {
      if (e.target.id === 'admin-search') {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          this._loadProducts(e.target.value.trim() || undefined);
        }, 300);
      }
    });
  },

  /**
   * Show admin login screen.
   */
  _showLogin(content) {
    content.innerHTML = `
      <div class="admin-page" style="display:flex;align-items:center;justify-content:center;">
        <div class="admin-login-card">
          <div class="admin-login-icon">🔒</div>
          <h2>Admin Access</h2>
          <p>Enter the admin password to manage products</p>
          <form id="admin-login-form">
            <div class="form-group">
              <input type="password" id="admin-password" placeholder="Enter password" autocomplete="off">
              <span class="error-message" id="login-error">Incorrect password</span>
            </div>
            <button type="submit" class="btn btn-primary" id="login-submit-btn" style="width:100%;">Unlock Admin</button>
          </form>
          <p id="forgot-link" style="margin-top:16px;font-size:0.82rem;color:var(--text-muted);cursor:pointer;transition:color 0.2s;">Forgot password?</p>
          <div id="forgot-hint" style="display:none;margin-top:12px;padding:14px;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);text-align:left;font-size:0.82rem;">
            <p style="color:var(--text-secondary);margin-bottom:8px;" id="hint-text">Loading hint...</p>
            <p style="color:var(--text-muted);font-size:0.75rem;">Set the <code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;">ADMIN_PASSWORD</code> environment variable on your server to change it.</p>
          </div>
          <button class="btn btn-secondary" style="width:100%;margin-top:14px;" onclick="window.navigateTo('#/')">← Back to Store</button>
        </div>
      </div>
    `;

    const form = document.getElementById('admin-login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwd = document.getElementById('admin-password').value;
      const btn = document.getElementById('login-submit-btn');
      btn.disabled = true;
      btn.textContent = 'Verifying...';

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd }),
        });
        const data = await res.json();

        if (data.success) {
          this._authenticated = true;
          this.render();
        } else {
          const fg = document.getElementById('admin-password').parentElement;
          fg.classList.add('has-error');
          document.getElementById('admin-password').value = '';
          document.getElementById('admin-password').focus();
          btn.disabled = false;
          btn.textContent = 'Unlock Admin';
        }
      } catch (err) {
        Toast.show('Connection error. Try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Unlock Admin';
      }
    });

    // Auto-focus the password input
    setTimeout(() => document.getElementById('admin-password')?.focus(), 100);

    // Forgot password toggle
    document.getElementById('forgot-link').addEventListener('click', async () => {
      const hintDiv = document.getElementById('forgot-hint');
      if (hintDiv.style.display === 'none') {
        hintDiv.style.display = 'block';
        try {
          const res = await fetch('/api/admin/hint');
          const data = await res.json();
          document.getElementById('hint-text').innerHTML =
            '🔑 <strong>Password hint:</strong> <code style="background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:4px;letter-spacing:2px;">' + data.data.hint + '</code>';
        } catch (err) {
          document.getElementById('hint-text').textContent = 'Could not load hint.';
        }
      } else {
        hintDiv.style.display = 'none';
      }
    });
  },
};
