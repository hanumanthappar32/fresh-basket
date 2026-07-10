/**
 * Fresh Basket — Checkout Page
 */
window.CheckoutPage = {
  _cart: null,

  /**
   * Render the checkout page.
   */
  async render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    content.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const cart = await API.getCart();
      const items = cart.items || [];

      if (items.length === 0) {
        Toast.show('Your cart is empty. Add some items first!', 'info');
        window.navigateTo('#/');
        return;
      }

      this._cart = cart;
      const subtotal = items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
      const delivery = subtotal >= 500 ? 0 : 49;
      const total = subtotal + delivery;

      content.innerHTML = `
        <div class="checkout-page">
          <div class="container">
            <h1 class="checkout-page-title">Checkout</h1>
            <div class="checkout-layout">
              <div class="checkout-form">
                <h3>Delivery Information</h3>
                <form id="checkout-form" novalidate>
                  <div class="form-group" id="fg-name">
                    <label for="customer-name">Full Name</label>
                    <input type="text" id="customer-name" placeholder="John Doe" required>
                    <span class="error-message">Please enter your full name</span>
                  </div>
                  <div class="form-group" id="fg-email">
                    <label for="customer-email">Email Address</label>
                    <input type="email" id="customer-email" placeholder="john@example.com" required>
                    <span class="error-message">Please enter a valid email</span>
                  </div>
                  <div class="form-group" id="fg-phone">
                    <label for="customer-phone">Phone Number</label>
                    <input type="tel" id="customer-phone" placeholder="+1 (555) 123-4567" required>
                    <span class="error-message">Please enter your phone number</span>
                  </div>
                  <div class="form-group" id="fg-address">
                    <label for="customer-address">Delivery Address</label>
                    <textarea id="customer-address" placeholder="123 Main St, Apt 4B, New York, NY 10001" required></textarea>
                    <span class="error-message">Please enter your delivery address</span>
                  </div>
                  <button type="submit" class="btn btn-primary" id="place-order-btn">
                    Place Order — ₹${total.toFixed(2)}
                  </button>
                </form>
              </div>
              <div class="checkout-summary">
                <h3>Order Summary</h3>
                ${items.map((item) => `
                  <div class="checkout-summary-item">
                    <span class="item-name">
                      <span class="item-emoji">${item.product.image || '🛒'}</span>
                      ${item.product.name}
                      <span class="item-qty">×${item.quantity}</span>
                    </span>
                    <span class="item-total">₹${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                `).join('')}
                <div class="summary-divider"></div>
                <div class="summary-row">
                  <span class="label">Subtotal</span>
                  <span class="value">₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row ${delivery === 0 ? 'free' : ''}">
                  <span class="label">Delivery</span>
                  <span class="value">${delivery === 0 ? 'FREE' : '₹' + delivery.toFixed(2)}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total">
                  <span class="label">Total</span>
                  <span class="value">₹${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      this._bindEvents(content, total);
    } catch (e) {
      console.error('Checkout render failed:', e);
      Toast.show('Failed to load checkout', 'error');
      window.navigateTo('#/cart');
    }
  },

  /**
   * Bind form events.
   */
  _bindEvents(content, total) {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Gather values
      const name = document.getElementById('customer-name').value.trim();
      const email = document.getElementById('customer-email').value.trim();
      const phone = document.getElementById('customer-phone').value.trim();
      const address = document.getElementById('customer-address').value.trim();

      // Clear errors
      ['fg-name', 'fg-email', 'fg-phone', 'fg-address'].forEach((id) => {
        document.getElementById(id).classList.remove('has-error');
      });

      // Validate
      let valid = true;

      if (!name || name.length < 2) {
        document.getElementById('fg-name').classList.add('has-error');
        valid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        document.getElementById('fg-email').classList.add('has-error');
        valid = false;
      }

      if (!phone || phone.length < 7) {
        document.getElementById('fg-phone').classList.add('has-error');
        valid = false;
      }

      if (!address || address.length < 10) {
        document.getElementById('fg-address').classList.add('has-error');
        valid = false;
      }

      if (!valid) {
        Toast.show('Please fix the errors in the form', 'error');
        return;
      }

      // Submit
      const btn = document.getElementById('place-order-btn');
      btn.classList.add('btn-loading');
      btn.disabled = true;

      try {
        const order = await API.placeOrder({ customerName: name, email, phone, address });
        this._showConfirmation(order, total);
      } catch (err) {
        Toast.show('Failed to place order. Please try again.', 'error');
        btn.classList.remove('btn-loading');
        btn.disabled = false;
      }
    });
  },

  /**
   * Show order confirmation overlay.
   */
  _showConfirmation(order, total) {
    const orderId = order.id || order.orderId || 'ORD-' + Date.now();
    const overlay = document.createElement('div');
    overlay.className = 'order-confirmation-overlay';
    overlay.innerHTML = `
      <div class="order-confirmation-card">
        <div class="confirmation-icon">✓</div>
        <h2>Order Placed!</h2>
        <p class="order-id">Order #${orderId}</p>
        <p class="order-total">₹${total.toFixed(2)}</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:24px;">
          Thank you for your order! You'll receive a confirmation email shortly.
        </p>
        <button class="btn btn-primary" id="confirmation-continue-btn">Continue Shopping</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'confirmation-continue-btn' || e.target.closest('#confirmation-continue-btn')) {
        overlay.remove();
        window.navigateTo('#/');
        Header.updateCartCount();
      }
    });
  },
};
