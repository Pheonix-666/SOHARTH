/**
 * notification-service.js
 * Formats order data into a WhatsApp message and sends it to the owner.
 * Retries up to MAX_RETRIES times on failure.
 */
const { getClient, isReady } = require('./whatsapp-client');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

/**
 * Formats an order object into a structured WhatsApp message string.
 * @param {Object} order
 */
function formatOrderMessage(order) {
  const {
    orderId,
    customer,
    items,
    subtotal,
    tax,
    shipping,
    total,
    shippingAddress,
    paymentMethod,
    timestamp,
  } = order;

  // Format date
  const date = timestamp
    ? new Date(timestamp).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      })
    : new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });

  // Format items list
  const itemLines = Array.isArray(items)
    ? items
        .map((item) => {
          const name = item.name || item.title || 'Item';
          const size = item.size ? ` (${item.size})` : '';
          const qty = item.qty || item.quantity || 1;
          const price = (item.price * qty).toFixed(2);
          return `  • ${name}${size} × ${qty} — ₹${price}`;
        })
        .join('\n')
    : '  • (No items listed)';

  // Format address
  const addr = shippingAddress || {};
  const addressLine = [addr.street, addr.city, addr.state, addr.zip, addr.country]
    .filter(Boolean)
    .join(', ');

  const subtotalStr = (subtotal || 0).toFixed(2);
  const taxStr = (tax || 0).toFixed(2);
  const shippingStr = (shipping || 0).toFixed(2);
  const totalStr = (total || 0).toFixed(2);
  const payment = paymentMethod || 'Cash on Delivery';

  const message = `🛍️ *NEW ORDER RECEIVED*
━━━━━━━━━━━━━━━━━━━━
📦 Order ID: #${orderId}
📅 Date: ${date}

👤 *Customer*
Name: ${customer?.name || 'N/A'}
Email: ${customer?.email || 'N/A'}
Phone: ${customer?.phone || addr.phone || 'N/A'}

🛒 *Items Ordered*
${itemLines}

💰 *Order Summary*
Subtotal: ₹${subtotalStr}
Tax (5%): ₹${taxStr}
Shipping: ₹${shippingStr}
*Total: ₹${totalStr}*

🚚 *Shipping Address*
${addressLine || 'N/A'}

💳 Payment: ${payment}
━━━━━━━━━━━━━━━━━━━━
_Sent automatically by SOLARTH Order System_`;

  return message;
}

/**
 * Sleeps for `ms` milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends an order notification to ALL configured owner WhatsApp numbers.
 * Numbers are read from OWNER_WHATSAPP_NUMBER as a comma-separated list.
 * Each number is sent to in parallel; one failure doesn't block others.
 *
 * @param {Object} order - The order data object
 */
async function sendOrderNotification(order) {
  const numbersEnv = process.env.OWNER_WHATSAPP_NUMBER;

  if (!numbersEnv) {
    console.error('❌ OWNER_WHATSAPP_NUMBER is not set in environment. Skipping notification.');
    return;
  }

  // Parse comma-separated list, trim whitespace, remove empty entries
  const numbers = numbersEnv
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  if (numbers.length === 0) {
    console.error('❌ No valid numbers found in OWNER_WHATSAPP_NUMBER.');
    return;
  }

  console.log(`📨 Sending order #${order.orderId} notification to ${numbers.length} number(s)...`);

  // Send to all numbers in parallel
  const results = await Promise.allSettled(
    numbers.map((number) => sendToNumber(order, number))
  );

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`❌ Failed to notify ${numbers[i]}:`, result.reason);
    }
  });
}

/**
 * Sends the formatted order message to a single WhatsApp number.
 * Retries up to MAX_RETRIES times if the client is not ready or send fails.
 *
 * @param {Object} order
 * @param {string} number - WhatsApp number in format 91XXXXXXXXXX@c.us
 * @param {number} attempt - Current attempt (starts at 1)
 */
async function sendToNumber(order, number, attempt = 1) {
  if (!isReady()) {
    if (attempt <= MAX_RETRIES) {
      console.warn(
        `⚠️  WhatsApp not ready for ${number}. Retry ${attempt}/${MAX_RETRIES} in ${RETRY_DELAY_MS / 1000}s...`
      );
      await sleep(RETRY_DELAY_MS);
      return sendToNumber(order, number, attempt + 1);
    } else {
      throw new Error(`WhatsApp client not ready after ${MAX_RETRIES} retries`);
    }
  }

  try {
    const message = formatOrderMessage(order);
    const client = getClient();
    await client.sendMessage(number, message);
    console.log(`✅ Notification sent → ${number} (Order #${order.orderId})`);
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      console.warn(`⚠️  Send failed for ${number} (attempt ${attempt}). Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
      return sendToNumber(order, number, attempt + 1);
    } else {
      throw new Error(`All ${MAX_RETRIES} retries exhausted for ${number}: ${err.message}`);
    }
  }
}


module.exports = { sendOrderNotification };
