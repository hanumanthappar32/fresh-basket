/**
 * Fresh Basket — API Client
 * All fetch methods for communicating with the backend.
 */
window.API = (function () {
  const BASE = '/api';

  async function request(path, options = {}) {
    const url = `${BASE}${path}`;
    const defaults = {
      headers: { 'Content-Type': 'application/json' },
    };
    const config = { ...defaults, ...options };
    if (options.headers) {
      config.headers = { ...defaults.headers, ...options.headers };
    }
    try {
      const res = await fetch(url, config);
      const json = await res.json().catch(() => ({ success: false, error: res.statusText }));
      if (!res.ok) {
        throw new Error(json.error || res.statusText);
      }
      // Unwrap the { success, data } envelope — return data directly
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      console.error(`API ${config.method || 'GET'} ${url} failed:`, err);
      throw err;
    }
  }

  /* ── Products ─────────────────────────────────── */
  function getProducts(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString();
    return request(`/products${qs ? '?' + qs : ''}`);
  }

  function getProduct(id) {
    return request(`/products/${id}`);
  }

  function getCategories() {
    return request('/categories');
  }

  /* ── Cart ──────────────────────────────────────── */
  function getCart() {
    return request('/cart');
  }

  function addToCart(productId, quantity = 1) {
    return request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  function updateCartItem(productId, quantity) {
    return request(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  function removeFromCart(productId) {
    return request(`/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  function clearCart() {
    return request('/cart/clear', {
      method: 'DELETE',
    });
  }

  /* ── Orders ────────────────────────────────────── */
  function placeOrder(customerInfo) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(customerInfo),
    });
  }

  function getOrders() {
    return request('/orders');
  }

  function updateOrderStatus(orderId, status) {
    return request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /* ── Product Admin ─────────────────────────────── */
  function createProduct(productData) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  function updateProduct(id, productData) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  function deleteProduct(id) {
    return request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  /* ── Public API ────────────────────────────────── */
  return {
    getProducts,
    getProduct,
    getCategories,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    placeOrder,
    getOrders,
    updateOrderStatus,
    createProduct,
    updateProduct,
    deleteProduct,
  };
})();
