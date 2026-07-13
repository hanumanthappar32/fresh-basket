/**
 * Fresh Basket — Home Page (Store Directory)
 */
window.HomePage = {
  _stores: [],

  /**
   * Render the store directory.
   */
  async render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    content.innerHTML = `
      <section class="hero">
        <div class="container">
          <h1 class="hero-title">Fresh groceries,<br><span class="highlight">delivered from your local stores</span></h1>
          <p class="hero-subtitle">Explore a collection of premium online grocery stores near you. Choose a store to start shopping.</p>
        </div>
      </section>
      
      <section class="container" style="padding-top: 40px; padding-bottom: 60px;">
        <h2 style="margin-bottom: 24px; text-align: center;">🏪 Available Grocery Stores</h2>
        <div id="stores-grid" class="product-grid">
          <div class="loading-spinner"></div>
        </div>
      </section>

      <section style="background: var(--bg-secondary); border-top: 1px solid var(--border); padding: 60px 20px; text-align: center;">
        <div class="container" style="max-width: 600px; margin: 0 auto;">
          <div style="font-size: 2.5rem; margin-bottom: 16px;">💼</div>
          <h2 style="margin-bottom: 8px;">Are you a store owner?</h2>
          <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 0.95rem;">
            List your store, manage inventory, configure custom payments, and fulfill customer orders seamlessly.
          </p>
          <button class="btn btn-primary" onclick="window.navigateTo('#/merchant/login')">Access Merchant Portal</button>
        </div>
      </section>
    `;

    await this._loadStores();
  },

  /**
   * Fetch registered stores from API.
   */
  async _loadStores() {
    const grid = document.getElementById('stores-grid');
    if (!grid) return;

    try {
      const stores = await API.listStores();
      this._stores = stores || [];

      if (this._stores.length === 0) {
        grid.innerHTML = `
          <div class="no-results" style="grid-column: 1/-1; padding: 60px 20px;">
            <div class="no-results-icon">🏪</div>
            <h3>No stores registered yet</h3>
            <p>Go to the Merchant Portal to create the first grocery store.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = this._stores.map((store) => this._renderStoreCard(store)).join('');
    } catch (e) {
      console.error('Failed to load stores:', e);
      grid.innerHTML = `
        <div class="no-results" style="grid-column: 1/-1;">
          <div class="no-results-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>Please try again later.</p>
        </div>
      `;
    }
  },

  /**
   * Render a store directory card.
   */
  _renderStoreCard(store) {
    const emojis = ['🥦', '🍎', '🥕', '🍊', '🍇', '🍞', '🥛', '🥬', '🍓', '🥑'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    return `
      <div class="product-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 24px; text-align: center; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-secondary); cursor: pointer;" onclick="window.navigateTo('#/store?id=${store.merchantId}')">
        <div style="font-size: 3rem; margin-bottom: 16px;">${randomEmoji}</div>
        <div>
          <h3 style="margin-bottom: 8px; font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${store.storeName}</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px;">Premium local grocery delivery</p>
        </div>
        <button class="btn btn-primary" style="width: 100%;">Visit Store</button>
      </div>
    `;
  }
};
