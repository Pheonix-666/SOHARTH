import { NextResponse } from 'next/server';
import { saveOrder } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, subtotal, tax, total } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cannot checkout with an empty selection' }, { status: 400 });
    }

    // Store in filesystem database persistently
    const savedOrder = await saveOrder({
      items,
      subtotal,
      tax,
      total,
    });

    console.log('Order processed persistently:', savedOrder);

    return NextResponse.json({ 
      success: true, 
      message: 'Order placed successfully', 
      orderId: savedOrder.id 
    });
  } catch (error) {
    console.error('Order registration error:', error);
    return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 });
  }
}
