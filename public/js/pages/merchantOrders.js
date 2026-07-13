/**
 * Fresh Basket — Merchant Orders Page
 * View and manage customer orders with status updates.
 */
window.MerchantOrdersPage = {
  _orders: [],

  /**
   * Render the orders management page.
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
      <div class="admin-page" id="merchant-orders-wrapper">
        <div class="container">
          <div class="admin-tabs">
            <button class="admin-tab" data-tab="products" onclick="window.navigateTo('#/merchant/dashboard')">🔧 Products</button>
            <button class="admin-tab active" data-tab="orders">📦 Orders</button>
            <button class="admin-tab" data-tab="settings" onclick="window.navigateTo('#/merchant/settings')">⚙️ Settings</button>
          </div>
          <div class="admin-header">
            <div>
              <h1 class="admin-title">📦 Order Management</h1>
              <p class="admin-subtitle">View and manage customer orders</p>
            </div>
            <button class="btn btn-secondary" id="refresh-orders-btn">
              <span class="btn-icon">↻</span> Refresh
            </button>
          </div>
          <div class="orders-stats" id="orders-stats"></div>
          <div class="orders-filter-bar">
            <button class="orders-filter-btn active" data-filter="all">All</button>
            <button class="orders-filter-btn" data-filter="confirmed">Confirmed</button>
            <button class="orders-filter-btn" data-filter="processing">Processing</button>
            <button class="orders-filter-btn" data-filter="shipped">Shipped</button>
            <button class="orders-filter-btn" data-filter="delivered">Delivered</button>
            <button class="orders-filter-btn" data-filter="cancelled">Cancelled</button>
          </div>
          <div id="orders-list">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    `;

    await this._loadOrders();
    this._bindEvents();
  },

  /**
   * Load orders from the API and render.
   */
  async _loadOrders(filterStatus) {
    const container = document.getElementById('orders-list');
    const statsContainer = document.getElementById('orders-stats');
    if (!container) return;

    try {
      const orders = await API.getOrders();
      this._orders = orders || [];

      // Render stats
      this._renderStats(statsContainer);

      // Filter
      const filtered = filterStatus && filterStatus !== 'all'
        ? this._orders.filter((o) => o.status === filterStatus)
        : this._orders;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="empty-cart" style="padding:60px 20px;">
            <div class="empty-cart-icon">📋</div>
            <h2>${filterStatus && filterStatus !== 'all' ? 'No ' + filterStatus + ' orders' : 'No orders yet'}</h2>
            <p>Orders placed by customers on your store will appear here.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map((order) => this._renderOrderCard(order)).join('');
    } catch (e) {
      console.error('Failed to load orders:', e);
      container.innerHTML = '<p style="color:var(--danger);text-align:center;padding:40px;">Failed to load orders.</p>';
    }
  },

  /**
   * Render stats summary cards.
   */
  _renderStats(container) {
    if (!container) return;
    const total = this._orders.length;
    const confirmed = this._orders.filter((o) => o.status === 'confirmed').length;
    const processing = this._orders.filter((o) => o.status === 'processing').length;
    const shipped = this._orders.filter((o) => o.status === 'shipped').length;
    const delivered = this._orders.filter((o) => o.status === 'delivered').length;
    const cancelled = this._orders.filter((o) => o.status === 'cancelled').length;
    const revenue = this._orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total Orders</div>
      </div>
      <div class="stat-card stat-confirmed">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${confirmed}</div>
        <div class="stat-label">Confirmed</div>
      </div>
      <div class="stat-card stat-processing">
        <div class="stat-icon">⚙️</div>
        <div class="stat-value">${processing}</div>
        <div class="stat-label">Processing</div>
      </div>
      <div class="stat-card stat-shipped">
        <div class="stat-icon">🚚</div>
        <div class="stat-value">${shipped}</div>
        <div class="stat-label">Shipped</div>
      </div>
      <div class="stat-card stat-delivered">
        <div class="stat-icon">🎉</div>
        <div class="stat-value">${delivered}</div>
        <div class="stat-label">Delivered</div>
      </div>
      <div class="stat-card stat-revenue">
        <div class="stat-icon">💰</div>
        <div class="stat-value">₹${revenue.toFixed(0)}</div>
        <div class="stat-label">Revenue</div>
      </div>
    `;
  },

  /**
   * Render a single order card.
   */
  _renderOrderCard(order) {
    const statusConfig = {
      confirmed: { icon: '✅', color: 'var(--info)', label: 'Confirmed' },
      processing: { icon: '⚙️', color: 'var(--accent)', label: 'Processing' },
      shipped: { icon: '🚚', color: 'hsl(280, 70%, 55%)', label: 'Shipped' },
      delivered: { icon: '🎉', color: 'var(--success)', label: 'Delivered' },
      cancelled: { icon: '❌', color: 'var(--danger)', label: 'Cancelled' },
    };

    const s = statusConfig[order.status] || statusConfig.confirmed;
    const date = order.createdAt ? new Date(order.createdAt) : new Date();
    const dateStr = date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });
    const orderId = (order.orderId || order.id || '').substring(0, 8).toUpperCase();

    const statusOptions = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
      .map((st) => `<option value="${st}" ${order.status === st ? 'selected' : ''}>${statusConfig[st].icon} ${statusConfig[st].label}</option>`)
      .join('');

    const isRazorpay = order.paymentMethod === 'razorpay';
    const payBadge = isRazorpay
      ? `<span class="order-payment-badge razorpay" style="background:hsla(210, 80%, 55%, 0.15);color:hsl(210, 80%, 65%);border:1px solid hsla(210, 80%, 55%, 0.3);padding:6px 14px;border-radius:var(--radius-full);font-size:0.8rem;font-weight:600;margin-right:8px;">💳 Razorpay</span>`
      : `<span class="order-payment-badge cod" style="background:hsla(35, 95%, 55%, 0.15);color:hsl(35, 95%, 65%);border:1px solid hsla(35, 95%, 55%, 0.3);padding:6px 14px;border-radius:var(--radius-full);font-size:0.8rem;font-weight:600;margin-right:8px;">🏠 COD</span>`;

    return `
      <div class="order-card" data-order-id="${order.orderId || order.id}">
        <div class="order-card-header">
          <div class="order-id-section">
            <span class="order-id-label">ORDER</span>
            <span class="order-id-value">#${orderId}</span>
            <span class="order-date">${dateStr} • ${timeStr}</span>
          </div>
          <div class="order-status-section" style="display:flex;align-items:center;">
            ${payBadge}
            <span class="order-status-badge" style="background:${s.color}20;color:${s.color};border:1px solid ${s.color}40;">
              ${s.icon} ${s.label}
            </span>
          </div>
        </div>

        <div class="order-card-body">
          <div class="order-customer-info">
            <h4>👤 Customer Details</h4>
            <div class="customer-details-grid">
              <div class="customer-detail">
                <span class="detail-label">Name</span>
                <span class="detail-value">${order.customer?.name || 'N/A'}</span>
              </div>
              <div class="customer-detail">
                <span class="detail-label">Email</span>
                <span class="detail-value">${order.customer?.email || 'N/A'}</span>
              </div>
              <div class="customer-detail">
                <span class="detail-label">Phone</span>
                <span class="detail-value">${order.customer?.phone || 'N/A'}</span>
              </div>
              <div class="customer-detail">
                <span class="detail-label">Address</span>
                <span class="detail-value">${order.customer?.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="order-items-section">
            <h4>🛒 Items (${(order.items || []).length})</h4>
            <div class="order-items-list">
              ${(order.items || []).map((item) => `
                <div class="order-item-row">
                  <span class="order-item-emoji">${item.image || '📦'}</span>
                  <span class="order-item-name">${item.name}</span>
                  <span class="order-item-qty">×${item.quantity}</span>
                  <span class="order-item-price">₹${(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="order-card-footer">
          <div class="order-totals">
            <div class="order-total-row">
              <span>Subtotal</span>
              <span>₹${(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="order-total-row">
              <span>Delivery</span>
              <span>${order.deliveryFee === 0 ? 'FREE' : '₹' + (order.deliveryFee || 0).toFixed(2)}</span>
            </div>
            <div class="order-total-row order-grand-total">
              <span>Total</span>
              <span>₹${(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
          <div class="order-actions">
            <label class="order-status-label">Update Status:</label>
            <select class="order-status-select" data-order-id="${order.orderId || order.id}">
              ${statusOptions}
            </select>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Bind events.
   */
  _bindEvents() {
    const wrapper = document.getElementById('merchant-orders-wrapper');
    if (!wrapper) return;

    let activeFilter = 'all';

    wrapper.addEventListener('click', async (e) => {
      // Refresh button
      if (e.target.id === 'refresh-orders-btn' || e.target.closest('#refresh-orders-btn')) {
        const btn = document.getElementById('refresh-orders-btn');
        btn.classList.add('btn-loading');
        await this._loadOrders(activeFilter);
        btn.classList.remove('btn-loading');
        Toast.show('Orders refreshed!', 'success');
        return;
      }

      // Filter buttons
      const filterBtn = e.target.closest('.orders-filter-btn');
      if (filterBtn) {
        activeFilter = filterBtn.dataset.filter;
        document.querySelectorAll('.orders-filter-btn').forEach((b) => b.classList.remove('active'));
        filterBtn.classList.add('active');
        await this._loadOrders(activeFilter);
        return;
      }
    });

    // Status change
    wrapper.addEventListener('change', async (e) => {
      if (e.target.classList.contains('order-status-select')) {
        const orderId = e.target.dataset.orderId;
        const newStatus = e.target.value;
        const select = e.target;
        select.disabled = true;

        try {
          await API.updateOrderStatus(orderId, newStatus);
          Toast.show(`Order updated to "${newStatus}"`, 'success');
          await this._loadOrders(activeFilter);
        } catch (err) {
          Toast.show('Failed to update order status', 'error');
          select.disabled = false;
        }
      }
    });
  },
};
