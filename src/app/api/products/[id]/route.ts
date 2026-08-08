import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

    const allowedKeys = [
      'name', 'subtitle', 'price', 'category', 'tag',
      'image', 'images', 'description', 'collection',
      'material', 'shipping'
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (key in body) {
        if (key === 'price') {
          updates.price = typeof body.price === 'number' ? body.price : (parseFloat(body.price) || 0);
        } else if (key === 'images' && Array.isArray(body.images)) {
          updates.images = body.images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
        } else {
          updates[key] = body[key];
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
