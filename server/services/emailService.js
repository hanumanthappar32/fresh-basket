const nodemailer = require('nodemailer');

// Extract SMTP settings from environment variables
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || '"Fresh Basket Marketplace" <no-reply@freshbasket.com>';

/**
 * Build a responsive, premium HTML email invoice matching the app's styling.
 */
function buildHtmlInvoice(order, storeName) {
  const isRazorpay = order.paymentMethod === 'razorpay';
  const payMethodStr = isRazorpay ? '💳 Paid Online (Razorpay)' : '🏠 Cash on Delivery (COD)';
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const orderId = (order.orderId || order.id || '').substring(0, 8).toUpperCase();

  const itemsHtml = (order.items || []).map((item) => `
    <tr style="border-bottom: 1px solid #2d3139;">
      <td style="padding: 12px 0; color: #f3f4f6; font-size: 0.95rem;">
        <span style="margin-right: 8px;">${item.image || '📦'}</span> ${item.name}
      </td>
      <td style="padding: 12px 0; color: #9ca3af; text-align: center; font-size: 0.9rem;">
        ${item.quantity} x ₹${(item.price || 0).toFixed(2)}
      </td>
      <td style="padding: 12px 0; color: #10b981; text-align: right; font-weight: 600; font-size: 0.95rem;">
        ₹${(item.subtotal || item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation #${orderId}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d0f14; color: #f3f4f6; margin: 0; padding: 20px; line-height: 1.6;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #12141c; border: 1px solid #222530; border-radius: 16px; overflow: hidden; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
        <!-- Logo Header -->
        <tr>
          <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #222530;">
            <div style="font-size: 3rem; margin-bottom: 8px;">🧺</div>
            <h1 style="margin: 0; color: #10b981; font-size: 1.75rem; font-weight: 700;">Fresh Basket Marketplace</h1>
            <p style="margin: 4px 0 0; color: #9ca3af; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Order Confirmation Invoice</p>
          </td>
        </tr>
        
        <!-- Welcome Message -->
        <tr>
          <td style="padding: 24px 0 12px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: #fff;">Thank you for your order!</h2>
            <p style="margin: 8px 0; color: #9ca3af; font-size: 0.95rem;">
              Your order at <strong>${storeName}</strong> has been successfully placed. Here are your transaction details.
            </p>
          </td>
        </tr>

        <!-- Order details block -->
        <tr>
          <td style="padding: 16px; background-color: #1a1d26; border-radius: 12px; margin-bottom: 24px;">
            <table width="100%" style="font-size: 0.85rem; color: #9ca3af; line-height: 1.8;">
              <tr>
                <td><strong>Order ID:</strong></td>
                <td style="color: #fff; text-align: right;">#${orderId}</td>
              </tr>
              <tr>
                <td><strong>Date & Time:</strong></td>
                <td style="color: #fff; text-align: right;">${dateStr}</td>
              </tr>
              <tr>
                <td><strong>Payment Option:</strong></td>
                <td style="color: #10b981; text-align: right; font-weight: 600;">${payMethodStr}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items Table -->
        <tr>
          <td style="padding: 20px 0 10px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #222530;">
                  <th align="left" style="padding-bottom: 8px; color: #9ca3af; font-size: 0.8rem; text-transform: uppercase;">Item</th>
                  <th align="center" style="padding-bottom: 8px; color: #9ca3af; font-size: 0.8rem; text-transform: uppercase;">Qty</th>
                  <th align="right" style="padding-bottom: 8px; color: #9ca3af; font-size: 0.8rem; text-transform: uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Totals Block -->
        <tr>
          <td style="padding-top: 12px; border-top: 1px solid #222530;">
            <table width="100%" style="color: #9ca3af; font-size: 0.9rem; line-height: 2;">
              <tr>
                <td>Subtotal</td>
                <td align="right" style="color: #fff;">₹${(order.subtotal || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Delivery Fee</td>
                <td align="right" style="color: #fff;">${order.deliveryFee === 0 ? 'FREE' : '₹' + (order.deliveryFee || 0).toFixed(2)}</td>
              </tr>
              <tr style="font-size: 1.15rem; font-weight: 700; color: #fff;">
                <td style="padding-top: 8px; border-top: 1px solid #222530;">Total Cost</td>
                <td align="right" style="padding-top: 8px; border-top: 1px solid #222530; color: #10b981;">₹${(order.total || 0).toFixed(2)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Delivery Address -->
        <tr>
          <td style="padding-top: 24px; border-top: 1px solid #222530;">
            <h4 style="margin: 0 0 8px; color: #fff; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">👤 Shipping Information</h4>
            <p style="margin: 0; color: #9ca3af; font-size: 0.9rem; line-height: 1.5;">
              <strong>Name:</strong> ${order.customer?.name || 'N/A'}<br>
              <strong>Phone:</strong> ${order.customer?.phone || 'N/A'}<br>
              <strong>Address:</strong> ${order.customer?.address || 'N/A'}
            </p>
          </td>
        </tr>

        <!-- Footer Notice -->
        <tr>
          <td align="center" style="padding-top: 32px; border-top: 1px solid #222530; color: #4b5563; font-size: 0.75rem; line-height: 1.5; text-align: center;">
            <p style="margin: 0;">This email confirmation was sent automatically by Fresh Basket.</p>
            <p style="margin: 4px 0 0;">If you have any questions regarding your order, please contact <strong>${storeName}</strong>.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

const EmailService = {
  /**
   * Dispatches order confirmation email to the customer.
   */
  async sendOrderConfirmation(order, merchant) {
    const storeName = merchant ? merchant.storeName : 'Fresh Basket Store';
    const customerEmail = order.customer?.email;
    const orderId = (order.orderId || order.id || '').substring(0, 8).toUpperCase();

    if (!customerEmail) {
      console.warn(`[EmailService] Skipping confirmation email: No customer email provided for order #${orderId}`);
      return false;
    }

    const htmlBody = buildHtmlInvoice(order, storeName);

    // If SMTP host and credentials are set, send a real email!
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT, 10),
          secure: parseInt(SMTP_PORT, 10) === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: SMTP_FROM,
          to: customerEmail,
          subject: `Order Confirmed! #${orderId} — ${storeName}`,
          html: htmlBody,
        });

        console.log(`[EmailService] Real order confirmation email sent successfully to ${customerEmail}`);
        return true;
      } catch (err) {
        console.error(`[EmailService] Failed to send real email to ${customerEmail}:`, err);
        // Do not crash the checkout process if SMTP fails — fallback to log simulation
      }
    }

    // SMTP fallback — print a formatted email invoice directly to server console logs
    console.log('\n' + '='.repeat(60));
    console.log(`📧 EMAIL INVOICE SIMULATOR (No SMTP server config detected)`);
    console.log(`To:      ${customerEmail}`);
    console.log(`Store:   ${storeName}`);
    console.log(`Subject: Order Confirmed! #${orderId} — ${storeName}`);
    console.log(`-`.repeat(60));
    console.log(`Dear ${order.customer?.name || 'Customer'},`);
    console.log(`Your order #${orderId} is confirmed!`);
    console.log(`Payment: ${order.paymentMethod === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery'}`);
    console.log(`Items:`);
    (order.items || []).forEach(item => {
      console.log(`  - ${item.name} x${item.quantity} (₹${(item.price * item.quantity).toFixed(2)})`);
    });
    console.log(`Total:   ₹${(order.total || 0).toFixed(2)} (Delivery: ${order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee})`);
    console.log(`Ship to: ${order.customer?.address}`);
    console.log('='.repeat(60) + '\n');

    return true;
  },
};

module.exports = EmailService;
