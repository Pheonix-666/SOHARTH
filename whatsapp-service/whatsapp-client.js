/**
 * whatsapp-client.js
 * Manages a single persistent whatsapp-web.js Client instance.
 * On first run: prints QR to terminal → scan with owner's WhatsApp.
 * Session is saved to .wwebjs_auth/ so future restarts skip QR.
 */
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let clientReady = false;
let clientInstance = null;

function createClient() {
  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: './.wwebjs_auth',
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    },
  });

  client.on('qr', (qr) => {
    console.log('\n========================================');
    console.log('  📱 SCAN THIS QR CODE WITH WHATSAPP');
    console.log('  Open WhatsApp → Settings → Linked Devices');
    console.log('========================================\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('✅ WhatsApp session authenticated & saved.');
  });

  client.on('ready', () => {
    clientReady = true;
    console.log('✅ WhatsApp client is ready! Notifications are live.');
  });

  client.on('auth_failure', (msg) => {
    clientReady = false;
    console.error('❌ WhatsApp authentication failed:', msg);
    console.error('   Delete the .wwebjs_auth folder and restart to re-scan QR.');
  });

  client.on('disconnected', (reason) => {
    clientReady = false;
    console.warn('⚠️  WhatsApp client disconnected:', reason);
    console.warn('   Attempting to reconnect in 15 seconds...');
    setTimeout(() => {
      console.log('🔄 Reinitializing WhatsApp client...');
      client.initialize().catch(console.error);
    }, 15000);
  });

  client.initialize().catch((err) => {
    console.error('❌ Failed to initialize WhatsApp client:', err.message);
  });

  return client;
}

/**
 * Returns the singleton client instance.
 */
function getClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

/**
 * Returns whether the client is authenticated and ready to send messages.
 */
function isReady() {
  return clientReady;
}

module.exports = { getClient, isReady };
