import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Fetch the cart for a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('carts')
    .select('items')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found, return empty cart
      return NextResponse.json({ items: [] });
    }
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data.items || [] });
}

// Upsert the cart for a user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items } = body;

    if (!userId || !items) {
      return NextResponse.json({ error: 'Missing userId or items' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('carts')
      .upsert(
        { user_id: userId, items: items, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error upserting cart:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
