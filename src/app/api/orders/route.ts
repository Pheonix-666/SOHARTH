import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, subtotal, tax, total, customer, shippingAddress, userId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cannot checkout with an empty selection' }, { status: 400 });
    }

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

