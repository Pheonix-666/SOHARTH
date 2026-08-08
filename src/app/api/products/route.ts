import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const images = Array.isArray(body.images)
      ? body.images.filter((img: any) => typeof img === 'string' && img.trim() !== '')
      : [];
    const image = body.image || images[0] || '';

    const productPayload: Record<string, any> = {
      name: body.name || '',
      subtitle: body.subtitle || '',
      price: typeof body.price === 'number' ? body.price : (parseFloat(body.price) || 0),
      category: body.category || '',
      tag: body.tag || '',
      image,
      images: images.length > 0 ? images : (image ? [image] : []),
      description: body.description || '',
      collection: body.collection || '',
      material: body.material || '',
      shipping: body.shipping || '',
    };

    if (body.id) {
      productPayload.id = body.id;
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rawUpdates } = body;

    if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

    const allowedKeys = [
      'name', 'subtitle', 'price', 'category', 'tag',
      'image', 'images', 'description', 'collection',
      'material', 'shipping'
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (key in rawUpdates) {
        if (key === 'price') {
          updates.price = typeof rawUpdates.price === 'number' ? rawUpdates.price : (parseFloat(rawUpdates.price) || 0);
        } else if (key === 'images' && Array.isArray(rawUpdates.images)) {
          updates.images = rawUpdates.images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
        } else {
          updates[key] = rawUpdates[key];
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