/**
 * Fresh Basket — SPA Router & App Entry
 */
(function () {
  'use strict';

  /* ── Route Definitions ─────────────────────────── */
  const routes = {
    '/': HomePage,
    '/cart': CartPage,
    '/checkout': CheckoutPage,
    '/admin': AdminPage,
    '/admin/orders': AdminOrdersPage,
  };

  /* ── Navigate Helper ───────────────────────────── */
  window.navigateTo = function (hash) {
    window.location.hash = hash;
  };

  /* ── Router ────────────────────────────────────── */
  function router() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '') || '/';

    const content = document.getElementById('app-content');
    if (!content) return;

    // Clear content
    content.innerHTML = '';
    content.classList.remove('fade-in');

    // Find matching page
    const page = routes[path];

    if (page && typeof page.render === 'function') {
      // Force reflow before adding class for animation
      void content.offsetWidth;
      content.classList.add('fade-in');
      page.render();
    } else {
      // 404 — redirect home
      content.classList.add('fade-in');
      content.innerHTML = `
        <div style="text-align:center;padding:160px 20px 80px;">
          <div style="font-size:4rem;margin-bottom:16px;">🤷</div>
          <h2 style="margin-bottom:8px;">Page not found</h2>
          <p style="color:var(--text-secondary);margin-bottom:24px;">The page you're looking for doesn't exist.</p>
          <button class="btn btn-primary" onclick="window.navigateTo('#/')">Go Home</button>
        </div>
      `;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Initialization ────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // Render header
    Header.render();

    // Set default hash if none
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/';
    }

    // Start router
    router();
  });

  // Listen for hash changes
  window.addEventListener('hashchange', router);
})();
