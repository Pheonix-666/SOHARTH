/**
 * index.js — WhatsApp Notification Microservice
 *
 * Starts an Express server on PORT (default 3001).
 * Endpoints:
 *   POST /notify  — Receives order data, sends WhatsApp notification to owner
 *   GET  /health  — Returns service health & WA client readiness status
 *
 * Usage:
 *   cd whatsapp-service
 *   npm install
 *   node index.js
 *
 * On first run, scan the QR code printed in the terminal with
 * the store owner's WhatsApp (Settings → Linked Devices → Link Device).
 * The session is persisted to .wwebjs_auth/ for subsequent restarts.
 */
require('dotenv').config({ path: '../.env.local' });

const express = require('express');
const { getClient, isReady } = require('./whatsapp-client');
const { sendOrderNotification } = require('./notification-service');

const app = express();
const PORT = process.env.WHATSAPP_SERVICE_PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// Basic request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * Health check — useful for monitoring and Next.js fire-and-forget to verify service is up
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'whatsapp-notification-service',
    whatsappReady: isReady(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /notify
 * Body (JSON):
 * {
 *   orderId: string,
 *   customer: { name, email, phone },
 *   items: [{ name, size, qty, price }],
 *   subtotal: number,
 *   tax: number,
 *   shipping: number,
 *   total: number,
 *   shippingAddress: { street, city, state, zip, country },
 *   paymentMethod: string,
 *   timestamp: string (ISO)
 * }
 */
app.post('/notify', async (req, res) => {
  const order = req.body;

  if (!order || !order.orderId) {
    return res.status(400).json({ success: false, error: 'Missing orderId in request body' });
  }

  // Respond immediately so the caller (Next.js) is not blocked
  res.json({ success: true, message: 'Notification queued', orderId: order.orderId });

  // Send notification asynchronously (does not block the HTTP response)
  sendOrderNotification(order).catch((err) => {
    console.error(`❌ Unhandled error in sendOrderNotification for #${order.orderId}:`, err);
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🛍️  SOLARTH WhatsApp Notification Service  ║');
  console.log(`║   Listening on http://localhost:${PORT}          ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log('📱 Initializing WhatsApp Web client...');
  console.log('   If this is your first run, a QR code will appear below.');
  console.log('   Scan it with WhatsApp: Settings → Linked Devices → Link a Device');
  console.log('');
});

// Initialize WA client on startup (starts Puppeteer + Chromium in background)
getClient();
