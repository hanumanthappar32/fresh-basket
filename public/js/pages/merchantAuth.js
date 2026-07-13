/**
 * Fresh Basket — Merchant Auth Page
 */
window.MerchantAuthPage = {
  _activeTab: 'login', // 'login' or 'register'

  /**
   * Render the login / register forms.
   */
  render() {
    const content = document.getElementById('app-content');
    if (!content) return;

    // If already logged in, redirect to dashboard
    if (localStorage.getItem('merchantId')) {
      window.navigateTo('#/merchant/dashboard');
      return;
    }

    this._renderLayout(content);
    this._bindEvents(content);
  },

  _renderLayout(content) {
    const isLogin = this._activeTab === 'login';

    content.innerHTML = `
      <div class="admin-page" style="display:flex; align-items:center; justify-content:center; padding: 60px 0;">
        <div class="admin-login-card" style="max-width: 450px; width: 100%;">
          <div class="admin-login-icon">🏪</div>
          <h2>Merchant Portal</h2>
          <p>Register your store or login to manage your business</p>

          <div class="admin-tabs" style="width: 100%; display: flex; margin-bottom: 24px; background: var(--bg-glass); border-radius: var(--radius-md); padding: 4px;">
            <button class="admin-tab ${isLogin ? 'active' : ''}" id="tab-btn-login" style="flex: 1; padding: 10px; border-radius: 6px; font-weight: 500;">Login</button>
            <button class="admin-tab ${!isLogin ? 'active' : ''}" id="tab-btn-register" style="flex: 1; padding: 10px; border-radius: 6px; font-weight: 500;">Register Store</button>
          </div>

          ${isLogin ? this._getLoginHtml() : this._getRegisterHtml()}
        </div>
      </div>
    `;
  },

  _getLoginHtml() {
    return `
      <form id="merchant-login-form">
        <div class="form-group" style="margin-bottom: 16px; text-align: left;">
          <label for="login-email">Email Address</label>
          <input type="email" id="login-email" placeholder="name@store.com" required style="width:100%; padding:14px; background:var(--bg-glass); border:1px solid var(--border); border-radius:var(--radius-md); color:var(--text-primary); outline:none;">
        </div>
        <div class="form-group" style="margin-bottom: 24px; text-align: left;">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" placeholder="••••••••" required style="width:100%; padding:14px; background:var(--bg-glass); border:1px solid var(--border); border-radius:var(--radius-md); color:var(--text-primary); outline:none;">
        </div>
        <button type="submit" class="btn btn-primary" id="login-submit-btn" style="width: 100%;">Log In</button>
      </form>
    `;
  },

  _getRegisterHtml() {
    return `
      <form id="merchant-register-form">
        <div class="form-group" style="margin-bottom: 16px; text-align: left;">
          <label for="reg-store-name">Store Name</label>
          <input type="text" id="reg-store-name" placeholder="e.g. Organic Greens" required style="width:100%; padding:14px; background:var(--bg-glass); border:1px solid var(--border); border-radius:var(--radius-md); color:var(--text-primary); outline:none;">
        </div>
        <div class="form-group" style="margin-bottom: 16px; text-align: left;">
          <label for="reg-email">Email Address</label>
          <input type="email" id="reg-email" placeholder="name@store.com" required style="width:100%; padding:14px; background:var(--bg-glass); border:1px solid var(--border); border-radius:var(--radius-md); color:var(--text-primary); outline:none;">
        </div>
        <div class="form-group" style="margin-bottom: 24px; text-align: left;">
          <label for="reg-password">Password</label>
          <input type="password" id="reg-password" placeholder="••••••••" required style="width:100%; padding:14px; background:var(--bg-glass); border:1px solid var(--border); border-radius:var(--radius-md); color:var(--text-primary); outline:none;">
        </div>
        <button type="submit" class="btn btn-primary" id="register-submit-btn" style="width: 100%;">Create Store Account</button>
      </form>
    `;
  },

  _bindEvents(content) {
    // Switch tabs
    const tabLogin = document.getElementById('tab-btn-login');
    const tabReg = document.getElementById('tab-btn-register');

    if (tabLogin) {
      tabLogin.addEventListener('click', () => {
        this._activeTab = 'login';
        this.render();
      });
    }

    if (tabReg) {
      tabReg.addEventListener('click', () => {
        this._activeTab = 'register';
        this.render();
      });
    }

    // Submit forms
    const loginForm = document.getElementById('merchant-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
          const res = await API.loginMerchant({ email, password });
          localStorage.setItem('merchantId', res.merchantId);
          localStorage.setItem('storeName', res.storeName);
          Toast.show('Welcome back, ' + res.storeName + '!', 'success');
          
          Header.render(); // Update Header immediately
          window.navigateTo('#/merchant/dashboard');
        } catch (err) {
          Toast.show(err.message || 'Login failed', 'error');
          btn.disabled = false;
          btn.textContent = 'Log In';
        }
      });
    }

    const regForm = document.getElementById('merchant-register-form');
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('register-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Creating Account...';

        const storeName = document.getElementById('reg-store-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        try {
          const res = await API.registerMerchant({ storeName, email, password });
          
          // Log in immediately on successful registration
          const loginRes = await API.loginMerchant({ email, password });
          localStorage.setItem('merchantId', loginRes.merchantId);
          localStorage.setItem('storeName', loginRes.storeName);
          
          Toast.show('Store created successfully!', 'success');
          Header.render(); // Update Header
          window.navigateTo('#/merchant/dashboard');
        } catch (err) {
          Toast.show(err.message || 'Registration failed', 'error');
          btn.disabled = false;
          btn.textContent = 'Create Store Account';
        }
      });
    }
  }
};
