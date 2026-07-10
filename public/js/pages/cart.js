/**
 * Fresh Basket — Cart Page
 */
window.CartPage = {
  /**
   * Render the cart page.
   */
  async render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    content.innerHTML = `
      <div class="cart-page">
        <div class="container">
          <h1 class="cart-page-title">Your Cart</h1>
          <p class="cart-page-count" id="cart-count"></p>
          <div id="cart-body">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    `;

    await this._loadCart();
    this._bindEvents(content);
  },

  /**
   * Load and render the cart.
   */
  async _loadCart() {
    const body = document.getElementById('cart-body');
    const countEl = document.getElementById('cart-count');
    if (!body) return;

    try {
      const cart = await API.getCart();
      const items = cart.items || [];

      if (items.length === 0) {
        if (countEl) countEl.textContent = '';
        body.innerHTML = `
          <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet. Start shopping to fill your basket!</p>
            <button class="btn btn-primary" onclick="window.navigateTo('#/')">Start Shopping</button>
          </div>
        `;
        return;
      }

      const totalItems = items.reduce((s, i) => s + i.quantity, 0);
      if (countEl) countEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`;

      const subtotal = items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
      const delivery = subtotal >= 500 ? 0 : 49;
      const total = subtotal + delivery;

      body.innerHTML = `
        <div class="cart-layout">
          <div class="cart-items-section">
            ${items.map((item) => CartItem.render(item)).join('')}
          </div>
          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span class="label">Subtotal</span>
              <span class="value">₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row ${delivery === 0 ? 'free' : ''}">
              <span class="label">Delivery</span>
              <span class="value">${delivery === 0 ? 'FREE' : '₹' + delivery.toFixed(2)}</span>
            </div>
            ${delivery > 0 ? `<p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Free delivery on orders over ₹500</p>` : ''}
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span class="label">Total</span>
              <span class="value">₹${total.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary" id="checkout-btn">Proceed to Checkout</button>
            <div class="cart-actions">
              <button class="btn btn-secondary" id="continue-shopping-btn">Continue Shopping</button>
              <button class="btn btn-danger" id="clear-cart-btn">Clear Cart</button>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      console.error('Failed to load cart:', e);
      body.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">⚠️</div>
          <h2>Could not load cart</h2>
          <p>Please try again later.</p>
        </div>
      `;
    }
  },

  /**
   * Bind event delegation.
   */
  _bindEvents(content) {
    content.addEventListener('click', async (e) => {
      // Quantity minus
      const minus = e.target.closest('.cart-qty-minus');
      if (minus) {
        const id = minus.dataset.productId;
        const qtyEl = minus.parentElement.querySelector('.qty-value');
        let qty = parseInt(qtyEl.textContent, 10);
        if (qty > 1) {
          qty--;
          try {
            await API.updateCartItem(id, qty);
            await this._loadCart();
            Header.updateCartCount();
          } catch (err) {
            Toast.show('Failed to update quantity', 'error');
          }
        }
        return;
      }

      // Quantity plus
      const plus = e.target.closest('.cart-qty-plus');
      if (plus) {
        const id = plus.dataset.productId;
        const qtyEl = plus.parentElement.querySelector('.qty-value');
        let qty = parseInt(qtyEl.textContent, 10);
        qty++;
        try {
          await API.updateCartItem(id, qty);
          await this._loadCart();
          Header.updateCartCount();
        } catch (err) {
          Toast.show('Failed to update quantity', 'error');
        }
        return;
      }

      // Remove item
      const remove = e.target.closest('.cart-item-remove');
      if (remove) {
        const id = remove.dataset.productId;
        try {
          await API.removeFromCart(id);
          Toast.show('Item removed from cart', 'info');
          await this._loadCart();
          Header.updateCartCount();
        } catch (err) {
          Toast.show('Failed to remove item', 'error');
        }
        return;
      }

      // Clear cart
      if (e.target.id === 'clear-cart-btn' || e.target.closest('#clear-cart-btn')) {
        try {
          await API.clearCart();
          Toast.show('Cart cleared', 'info');
          await this._loadCart();
          Header.updateCartCount();
        } catch (err) {
          Toast.show('Failed to clear cart', 'error');
        }
        return;
      }

      // Checkout
      if (e.target.id === 'checkout-btn' || e.target.closest('#checkout-btn')) {
        window.navigateTo('#/checkout');
        return;
      }

      // Continue Shopping
      if (e.target.id === 'continue-shopping-btn' || e.target.closest('#continue-shopping-btn')) {
        window.navigateTo('#/');
        return;
      }
    });
  },
};
