import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Sends a fire-and-forget notification to the WhatsApp microservice.
 * This never throws or blocks — any failure is silently logged so the
 * customer's checkout is completely unaffected.
 */
async function notifyWhatsApp(payload: object): Promise<void> {
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
  try {
    await fetch(`${serviceUrl}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Short timeout — we don't want to hold up anything
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    // Intentionally swallowed: notification failure must never break checkout
    console.warn('[WhatsApp Notify] Failed to reach notification service:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, subtotal, tax, total, customer, shippingAddress, userId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cannot checkout with an empty selection' }, { status: 400 });
    }

    // Calculate shipping cost to include in notification
    const shipping = total - subtotal - tax;

    const { data, error } = await supabaseServer
      .from('orders')
      .insert({
        user_id: userId || null,
        items,
        subtotal,
        tax,
        total,
        customer: customer || {},
        shipping_address: shippingAddress || {},
        order_status: 'Pending',
        payment_status: 'Pending',
        payment_method: 'Cash on Delivery',
        shipping_method: 'Standard',
        tracking_number: '',
        internal_notes: '',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase order insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('Order saved to Supabase:', data.id);

    // If logged in, clear their database cart
    if (userId) {
      await supabaseServer.from('carts').delete().eq('user_id', userId);
    }

    // ── WhatsApp Notification (fire-and-forget) ─────────────────────────────
    // We do NOT await this — it runs in the background. The customer receives
    // their success response immediately regardless of notification outcome.
    notifyWhatsApp({
      orderId: data.id,
      customer,
      items,
      subtotal,
      tax,
      shipping: shipping > 0 ? shipping : 0,
      total,
      shippingAddress,
      paymentMethod: 'Cash on Delivery',
      timestamp: new Date().toISOString(),
    });
    // ───────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderId: data.id,
    });
  } catch (error) {
    console.error('Order registration error:', error);
    return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 });
  }
}
