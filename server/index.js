const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import route handlers
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// Serve static frontend files from the /public directory
app.use(express.static(path.join(__dirname, '../public')));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

// ---------------------------------------------------------------------------
// Admin Auth (password from environment variable)
// ---------------------------------------------------------------------------
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Authenticated' });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect password' });
  }
});

app.get('/api/admin/hint', (req, res) => {
  const pwd = ADMIN_PASSWORD;
  const hint = pwd.charAt(0) + '•'.repeat(Math.max(pwd.length - 2, 0)) + pwd.charAt(pwd.length - 1);
  res.json({ success: true, data: { hint } });
});

// ---------------------------------------------------------------------------
// SPA Fallback — serve index.html for any non-API route
// ---------------------------------------------------------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ---------------------------------------------------------------------------
// Start Server (connect to DB first if MONGODB_URI is set)
// ---------------------------------------------------------------------------
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🛒 Fresh Basket server running at http://localhost:${PORT}`);
  });
}

start();
