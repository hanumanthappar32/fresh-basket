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
          <span class="nav-icon">⚙️</span>
          <span>${storeName}</span>
        </a>
        <a href="javascript:void(0)" class="nav-link" id="merchant-logout-btn">
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
   * Bind logout click listener.
   */
  _bindLogout(header) {
    // Prevent duplicate handlers
    if (header._logoutBound) return;
    header._logoutBound = true;

    header.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('#merchant-logout-btn');
      if (logoutBtn) {
        e.preventDefault();
        localStorage.removeItem('merchantId');
        localStorage.removeItem('storeName');
        Toast.show('Logged out successfully', 'info');
        window.navigateTo('#/');
        // Force full header re-render
        header._logoutBound = false;
        this.render();
      }
    });
  },

  /**
   * Highlight the active nav link based on the current hash.
   */
  _highlightActive() {
    const hash = window.location.hash || '#/';
    const route = hash.replace('#', '') || '/';
    const links = document.querySelectorAll('.nav-link');
    links.forEach((link) => {
      const linkRoute = link.getAttribute('data-route');
      if (route === linkRoute || (route.startsWith(linkRoute) && linkRoute !== '/')) {
        link.classList.add('active');
      } else if (linkRoute === '/' && route === '/') {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  /**
   * Fetch cart and update badge count.
   */
  async updateCartCount() {
    try {
      const cart = await API.getCart();
      const badge = document.getElementById('cart-badge');
      if (!badge) return;
      const count = cart.items ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    } catch (e) {
      // Silently fail — cart may not exist yet
    }
  },
};
