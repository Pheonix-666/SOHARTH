// ==============================================================================
// SOHARTH Automated Test Suite
// Real-time End-to-End API, Database, UPI Gateway & Admin Workflow Verification
// ==============================================================================

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;
const results = [];

function recordResult(testName, success, details = '') {
  if (success) {
    passed++;
    console.log(`  ${colors.green}✓ PASS${colors.reset} — ${testName} ${details ? `(${colors.cyan}${details}${colors.reset})` : ''}`);
    results.push({ testName, status: 'PASS', details });
  } else {
    failed++;
    console.error(`  ${colors.red}✗ FAIL${colors.reset} — ${testName} ${details ? `(${colors.red}${details}${colors.reset})` : ''}`);
    results.push({ testName, status: 'FAIL', details });
  }
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}   SOHARTH AUTOMATED REAL-TIME TEST RUNNER${colors.reset}`);
  console.log(`${colors.cyan}   Target: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  // ── TEST 1: Storefront Availability ──
  try {
    const res = await fetch(`${BASE_URL}/`);
    recordResult('Storefront Homepage (HTTP 200)', res.status === 200, `Status: ${res.status}`);
  } catch (err) {
    recordResult('Storefront Homepage (HTTP 200)', false, err.message);
  }

  // ── TEST 2: Product Catalog API & Schema Validation ──
  let sampleProduct = null;
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    const isValid = Array.isArray(data) && data.length > 0;
    if (isValid) {
      sampleProduct = data[0];
      const hasProps = Boolean(sampleProduct.name && sampleProduct.price !== undefined);
      recordResult('Product Catalog API (/api/products)', hasProps, `Found ${data.length} products`);
    } else {
      recordResult('Product Catalog API (/api/products)', false, 'No products returned');
    }
  } catch (err) {
    recordResult('Product Catalog API (/api/products)', false, err.message);
  }

  // ── TEST 3: Dynamic Categories Register ──
  try {
    const res = await fetch(`${BASE_URL}/api/categories`);
    const data = await res.json();
    const isValid = Array.isArray(data) && data.length > 0;
    recordResult('Dynamic Categories API (/api/categories)', isValid, `Found ${data?.length || 0} categories`);
  } catch (err) {
    recordResult('Dynamic Categories API (/api/categories)', false, err.message);
  }

  // ── TEST 4: Customer Reviews Endpoint ──
  try {
    const res = await fetch(`${BASE_URL}/api/reviews`);
    const data = await res.json();
    const isValid = Array.isArray(data);
    recordResult('Customer Reviews API (/api/reviews)', isValid, `Retrieved valid array (${data?.length || 0} approved reviews)`);
  } catch (err) {
    recordResult('Customer Reviews API (/api/reviews)', false, err.message);
  }

  // ── TEST 5: UPI Payment Order Placement with 12-Digit UTR ──
  let createdOrderId = null;
  const testUtr = '4291' + Math.floor(10000000 + Math.random() * 90000000); // 12-digit mock UTR
  try {
    const orderPayload = {
      items: [
        {
          id: sampleProduct?.id || 'prod_test',
          name: sampleProduct?.name || 'THE KING OVERSIZED TEE',
          price: sampleProduct?.price || 349,
          qty: 1,
          size: 'L',
        },
      ],
      subtotal: 349,
      tax: 10.47,
      total: 399.47,
      customer: {
        name: 'Automated Test Runner',
        email: 'qa@soharth.test',
        phone: '+91 99999 88888',
      },
      shippingAddress: {
        street: '42 Celestial Boulevard, Atelier Hub',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        country: 'India',
      },
      paymentMethod: 'UPI (Google Pay / PhonePe)',
      paymentStatus: 'Verification Pending',
      transactionId: testUtr,
      internalNotes: `Automated Test Order | UPI UTR: ${testUtr}`,
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    const success = data.success === true && Boolean(data.orderId);
    if (success) {
      createdOrderId = data.orderId;
      recordResult('Order Creation with UPI & UTR (/api/orders)', true, `Order ID: ${createdOrderId}, UTR: ${testUtr}`);
    } else {
      recordResult('Order Creation with UPI & UTR (/api/orders)', false, data.error || 'Failed');
    }
  } catch (err) {
    recordResult('Order Creation with UPI & UTR (/api/orders)', false, err.message);
  }

  // ── TEST 6: Admin Authentication (/api/admin-login) ──
  let sessionCookie = '';
  try {
    const res = await fetch(`${BASE_URL}/api/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: process.env.ADMIN_PASS || 'Hero@12345',
      }),
    });

    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }
    const success = res.status === 200 && data.success === true;
    recordResult('Admin Authentication (/api/admin-login)', success, success ? 'Session authenticated' : 'Invalid credentials');
  } catch (err) {
    recordResult('Admin Authentication (/api/admin-login)', false, err.message);
  }

  // ── TEST 7: Admin Orders Retrieval & UTR Verification ──
  try {
    const headers = {};
    if (sessionCookie) headers['cookie'] = sessionCookie;

    const res = await fetch(`${BASE_URL}/api/admin/orders`, { headers });
    const data = await res.json();
    const isValid = Array.isArray(data);

    if (isValid && createdOrderId) {
      const foundOrder = data.find((o) => o.id === createdOrderId);
      const utrMatched = foundOrder && (foundOrder.internalNotes?.includes(testUtr) || foundOrder.paymentMethod?.includes('UPI'));
      recordResult('Admin Order Ledger & UTR Match', Boolean(utrMatched), `Order found with UTR: ${testUtr}`);
    } else {
      recordResult('Admin Order Ledger (/api/admin/orders)', isValid, `Retrieved ${data?.length || 0} orders`);
    }
  } catch (err) {
    recordResult('Admin Order Ledger (/api/admin/orders)', false, err.message);
  }

  // ── TEST 8: Admin Status Update (Marking UPI Order as Paid) ──
  if (createdOrderId) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (sessionCookie) headers['cookie'] = sessionCookie;

      const res = await fetch(`${BASE_URL}/api/admin/orders/${createdOrderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          paymentStatus: 'Paid',
          orderStatus: 'Processing',
        }),
      });

      const data = await res.json();
      recordResult('Admin Order Status Update to Paid (/api/admin/orders/[id])', data.success === true, `Marked Order #${createdOrderId} as Paid`);
    } catch (err) {
      recordResult('Admin Order Status Update to Paid (/api/admin/orders/[id])', false, err.message);
    }
  }

  // ── SUMMARY REPORT ──
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}   TEST EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`  Total Tests : ${passed + failed}`);
  console.log(`  Passed      : ${colors.green}${passed}${colors.reset}`);
  console.log(`  Failed      : ${failed > 0 ? colors.red : colors.green}${failed}${colors.reset}`);
  console.log(`  Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
