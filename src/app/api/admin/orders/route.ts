import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return NextResponse.json({ error: 'Failed to retrieve orders data' }, { status: 500 });
    }

    // Normalize field names so admin panel UI doesn't need changes
    const normalized = (data || []).map((o: any) => ({
      id: o.id,
      timestamp: o.created_at,
      items: o.items,
      subtotal: o.subtotal,
      tax: o.tax,
      total: o.total,
      customer: o.customer,
      shippingAddress: o.shipping_address,
      orderStatus: o.order_status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      shippingMethod: o.shipping_method,
      trackingNumber: o.tracking_number,
      internalNotes: o.internal_notes,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching admin orders list:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders data' }, { status: 500 });
  }
}
