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
      'name', 'subtitle', 'price', 'original_price', 'originalPrice', 'category', 'tag',
      'image', 'images', 'description', 'collection',
      'material', 'shipping', 'colors'
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (key in body) {
        if (key === 'price') {
          updates.price = typeof body.price === 'number' ? body.price : (parseFloat(body.price) || 0);
        } else if (key === 'original_price' || key === 'originalPrice') {
          const val = body[key];
          updates.original_price = (val !== '' && val !== null && val !== undefined)
            ? (typeof val === 'number' ? val : (parseFloat(val) || null))
            : null;
        } else if (key === 'images' && Array.isArray(body.images)) {
          updates.images = body.images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
        } else if (key === 'colors' && Array.isArray(body.colors)) {
          updates.colors = body.colors;
        } else {
          updates[key] = body[key];
        }
      }
    }

    let { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    let warning: string | undefined;

    // Fallback if schema lacks optional columns (original_price, colors)
    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
      const fallbackUpdates = { ...updates };
      delete fallbackUpdates.original_price;
      delete fallbackUpdates.colors;
      const retryResult = await supabaseAdmin
        .from('products')
        .update(fallbackUpdates)
        .eq('id', id)
        .select()
        .single();
      data = retryResult.data;
      error = retryResult.error;
      if (!error && (updates.original_price !== undefined || updates.colors !== undefined)) {
        warning = 'Saved product details, but original_price or colors column is missing in Supabase. Run the SQL migration in Supabase SQL editor to persist MRP.';
      }
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, product: data, warning });
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
