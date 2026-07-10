/**
 * Fresh Basket — Toast Notification Component
 */
window.Toast = {
  /**
   * Show a toast notification.
   * @param {string} message - The message to display.
   * @param {'success'|'error'|'info'} type - Toast type.
   */
  show(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    // Close on button click
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  },
};
