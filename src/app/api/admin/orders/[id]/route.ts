import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { orderStatus, paymentStatus, trackingNumber, internalNotes } = body;

    // Build only the fields that were provided
    const updates: Record<string, string> = {};
    if (orderStatus !== undefined) updates.order_status = orderStatus;
    if (paymentStatus !== undefined) updates.payment_status = paymentStatus;
    if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
    if (internalNotes !== undefined) updates.internal_notes = internalNotes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating order in Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Normalize back to camelCase for the admin UI
    const normalized = {
      id: data.id,
      timestamp: data.created_at,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      customer: data.customer,
      shippingAddress: data.shipping_address,
      orderStatus: data.order_status,
      paymentStatus: data.payment_status,
      paymentMethod: data.payment_method,
      shippingMethod: data.shipping_method,
      trackingNumber: data.tracking_number,
      internalNotes: data.internal_notes,
    };

    return NextResponse.json({ success: true, order: normalized });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}

