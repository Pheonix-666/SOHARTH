import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      subtotal,
      tax,
      total,
      customer,
      shippingAddress,
      userId,
      paymentMethod,
      paymentStatus,
      transactionId,
      internalNotes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cannot checkout with an empty selection' }, { status: 400 });
    }

    const note = internalNotes
      ? internalNotes
      : (transactionId ? `UPI UTR: ${transactionId}` : '');

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
        payment_status: paymentStatus || (paymentMethod?.includes('UPI') ? 'Verification Pending' : 'Pending'),
        payment_method: paymentMethod || 'UPI (Google Pay / PhonePe)',
        shipping_method: 'Standard',
        tracking_number: '',
        internal_notes: note,
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
