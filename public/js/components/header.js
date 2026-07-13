/**
 * Fresh Basket — Header Component
 */
window.Header = {
  /**
   * Render the app header into #app-header.
   */
  render() {
    const header = document.getElementById('app-header');
    if (!header) return;

    const merchantId = localStorage.getItem('merchantId');
    const storeName = localStorage.getItem('storeName') || 'Merchant';

    let portalLinkHtml = '';
    if (merchantId) {
      portalLinkHtml = `
        <a href="#/merchant/dashboard" class="nav-link" data-route="/merchant/dashboard">
          <span class="nav-icon">🔧</span>
          <span>Products</span>
        </a>
        <a href="#/merchant/orders" class="nav-link" data-route="/merchant/orders">
          <span class="nav-icon">📦</span>
          <span>Orders</span>
        </a>
        <a href="#/merchant/settings" class="nav-link" data-route="/merchant/settings">
          <span class="nav-icon">⚙️</span>
          <span>Settings</span>
        </a>
        <span class="nav-divider" style="width: 1px; height: 16px; background: var(--border); margin: 0 8px;"></span>
        <span style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 4px;">
          🏪 ${storeName}
        </span>
        <a href="javascript:void(0)" class="nav-link" id="merchant-logout-btn" style="color: hsl(0, 85%, 65%);">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </a>
      `;
    } else {
      portalLinkHtml = `
        <a href="#/merchant/login" class="nav-link" data-route="/merchant/login">
          <span class="nav-icon">⚙️</span>
          <span>Merchant Portal</span>
        </a>
      `;
    }

    header.innerHTML = `
      <div class="header-inner container">
        <a href="#/" class="logo" aria-label="Fresh Basket Home">
          <span class="logo-icon">🧺</span>
          <span class="logo-text">Fresh Basket</span>
        </a>
        <nav class="header-nav" aria-label="Main navigation">
          <a href="#/" class="nav-link" data-route="/">
            <span class="nav-icon">🏠</span>
            <span>Home</span>
          </a>
          <a href="#/cart" class="nav-link" data-route="/cart">
            <span class="nav-icon">🛒</span>
            <span>Cart</span>
            <span class="cart-badge" id="cart-badge" style="display:none;">0</span>
          </a>
          ${portalLinkHtml}
        </nav>
      </div>
    `;

    this._highlightActive();
    this.updateCartCount();
    this._bindLogout(header);
  },

  /**
   * Update active class on links matching current route.
   */
  _highlightActive() {
    const hash = window.location.hash || '#/';
    let path = hash.replace('#', '') || '/';

    // Highlight parent tabs for merchant sub-paths
    if (path.startsWith('/store')) {
      path = '/';
    }

    const links = document.querySelectorAll('.header-nav .nav-link');
    links.forEach((link) => {
      const route = link.dataset.route;
      if (route === path) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  /**
   * Fetch latest cart count and update badge.
   */
  async updateCartCount() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    try {
      const cart = await API.getCart();
      const items = cart.items || [];
      const total = items.reduce((sum, item) => sum + item.quantity, 0);

      if (total > 0) {
        badge.textContent = total;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    } catch (e) {
      badge.style.display = 'none';
    }
  },

  /**
   * Bind logout event click listener.
   */
  _bindLogout(header) {
    const logoutBtn = header.querySelector('#merchant-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('merchantId');
        localStorage.removeItem('storeName');
        Toast.show('Logged out successfully', 'info');
        this.render(); // Re-render header menu
        window.navigateTo('#/'); // Redirect home
      });
    }
  },
};
