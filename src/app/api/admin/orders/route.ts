import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders list:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders data' }, { status: 500 });
  }
}
