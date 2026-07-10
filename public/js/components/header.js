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
          <a href="#/admin" class="nav-link" data-route="/admin">
            <span class="nav-icon">⚙️</span>
            <span>Admin</span>
          </a>
        </nav>
      </div>
    `;

    this._highlightActive();
    this.updateCartCount();

    // Update active link on hash change
    window.addEventListener('hashchange', () => this._highlightActive());
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
