/**
 * Fresh Basket — Admin Settings Page
 * Manage payment credentials and configurations.
 */
window.AdminSettingsPage = {
  _settings: null,

  /**
   * Render the settings page.
   */
  async render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    // Reuse admin authentication from AdminPage
    if (!AdminPage._authenticated) {
      AdminPage._showLogin(content);
      return;
    }

    content.innerHTML = `
      <div class="admin-page">
        <div class="container">
          <div class="admin-tabs">
            <button class="admin-tab" data-tab="products" onclick="window.navigateTo('#/admin')">🔧 Products</button>
            <button class="admin-tab" data-tab="orders" onclick="window.navigateTo('#/admin/orders')">📦 Orders</button>
            <button class="admin-tab active" data-tab="settings">⚙️ Settings</button>
          </div>
          <div class="admin-header">
            <div>
              <h1 class="admin-title">⚙️ Admin Settings</h1>
              <p class="admin-subtitle">Configure payment gateways and order options</p>
            </div>
          </div>

          <div id="settings-container">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    `;

    await this._loadSettings();
  },

  /**
   * Load and render the current settings.
   */
  async _loadSettings() {
    const container = document.getElementById('settings-container');
    if (!container) return;

    try {
      const settings = await API.getAdminSettings();
      this._settings = settings;

      const hasSecret = !!settings.maskedSecret;
      const secretPlaceholder = hasSecret 
        ? "•••••••• (Saved. Enter new secret to overwrite)" 
        : "Enter your Razorpay Key Secret";

      container.innerHTML = `
        <div class="admin-form-card" style="max-width: 600px; margin: 0 auto;">
          <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
            <span>💳</span> Razorpay Payment Gateway Configuration
          </h3>
          <form id="settings-form">
            <div class="form-group" style="margin-bottom: 20px;">
              <label for="settings-key-id">Razorpay Key ID</label>
              <input type="text" id="settings-key-id" placeholder="rzp_test_..." value="${settings.razorpayKeyId || ''}" autocomplete="off">
              <small style="color: var(--text-muted); display: block; margin-top: 4px;">
                Your public key ID from the Razorpay Dashboard (Test or Live mode).
              </small>
            </div>

            <div class="form-group" style="margin-bottom: 20px;">
              <label for="settings-key-secret">Razorpay Key Secret</label>
              <input type="password" id="settings-key-secret" placeholder="${secretPlaceholder}" autocomplete="off">
              <small style="color: var(--text-muted); display: block; margin-top: 4px;">
                Your private key secret. Keep this safe and secure.
              </small>
            </div>

            <div style="border-top: 1px solid var(--border); margin: 24px 0; padding-top: 24px;">
              <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <span>🏠</span> Pay on Delivery Options
              </h3>
              <div class="form-group" style="display: flex; align-items: center; gap: 12px;">
                <input type="checkbox" id="settings-cod-enabled" ${settings.codEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary); cursor: pointer;">
                <label for="settings-cod-enabled" style="margin: 0; cursor: pointer; font-weight: 500;">
                  Enable Cash on Delivery (Pay on Delivery)
                </label>
              </div>
              <small style="color: var(--text-muted); display: block; margin-top: 6px; margin-left: 32px;">
                Allow customers to place orders directly without paying online.
              </small>
            </div>

            <div class="admin-form-actions" style="margin-top: 32px;">
              <button type="submit" class="btn btn-primary" id="save-settings-btn">Save Configurations</button>
            </div>
          </form>
        </div>
      `;

      this._bindEvents();
    } catch (e) {
      console.error('Failed to load settings:', e);
      container.innerHTML = '<p style="color:var(--danger);text-align:center;padding:40px;">Failed to load settings.</p>';
    }
  },

  /**
   * Bind event listeners to the form.
   */
  _bindEvents() {
    const form = document.getElementById('settings-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('save-settings-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';

      const keyId = document.getElementById('settings-key-id').value.trim();
      const keySecret = document.getElementById('settings-key-secret').value.trim();
      const codEnabled = document.getElementById('settings-cod-enabled').checked;

      // Prepare data
      const data = {
        razorpayKeyId: keyId,
        codEnabled: codEnabled
      };

      // Only send secret if it was changed
      if (keySecret !== "") {
        data.razorpayKeySecret = keySecret;
      }

      try {
        await API.updateAdminSettings(data);
        Toast.show('Configuration saved successfully!', 'success');
        this.render();
      } catch (err) {
        console.error(err);
        Toast.show('Failed to save configurations', 'error');
        btn.disabled = false;
        btn.textContent = 'Save Configurations';
      }
    });
  }
};
