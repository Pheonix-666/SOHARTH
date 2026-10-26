import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 60;

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const images = Array.isArray(body.images)
      ? body.images.filter((img: any) => typeof img === 'string' && img.trim() !== '')
      : [];
    const image = body.image || images[0] || '';

    const originalPriceRaw = body.original_price ?? body.originalPrice;
    const original_price = originalPriceRaw !== undefined && originalPriceRaw !== null && originalPriceRaw !== ''
      ? (typeof originalPriceRaw === 'number' ? originalPriceRaw : (parseFloat(originalPriceRaw) || null))
      : null;

    const colors = Array.isArray(body.colors) ? body.colors : [];

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

    if (original_price !== null && !isNaN(original_price)) {
      productPayload.original_price = original_price;
    }

    if (colors.length > 0) {
      productPayload.colors = colors;
    }

    if (body.id) {
      productPayload.id = body.id;
    }

    let { data, error } = await supabaseAdmin
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    let warning: string | undefined;

    // If Supabase schema lacks optional columns (like original_price or colors), fallback gracefully
    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
      const fallbackPayload = { ...productPayload };
      delete fallbackPayload.original_price;
      delete fallbackPayload.colors;

      const retryResult = await supabaseAdmin
        .from('products')
        .insert(fallbackPayload)
        .select()
        .single();

      data = retryResult.data;
      error = retryResult.error;

      if (!error && (productPayload.original_price !== undefined || productPayload.colors !== undefined)) {
        warning = 'Registered product, but original_price / colors columns are missing in Supabase. Run the SQL migration in Supabase SQL editor to persist MRP and color variants.';
      }
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, product: data, warning });
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
      'name', 'subtitle', 'price', 'original_price', 'originalPrice', 'category', 'tag',
      'image', 'images', 'description', 'collection',
      'material', 'shipping', 'colors'
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (key in rawUpdates) {
        if (key === 'price') {
          updates.price = typeof rawUpdates.price === 'number' ? rawUpdates.price : (parseFloat(rawUpdates.price) || 0);
        } else if (key === 'original_price' || key === 'originalPrice') {
          const val = rawUpdates[key];
          updates.original_price = (val !== '' && val !== null && val !== undefined)
            ? (typeof val === 'number' ? val : (parseFloat(val) || null))
            : null;
        } else if (key === 'images' && Array.isArray(rawUpdates.images)) {
          updates.images = rawUpdates.images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
        } else if (key === 'colors' && Array.isArray(rawUpdates.colors)) {
          updates.colors = rawUpdates.colors;
        } else {
          updates[key] = rawUpdates[key];
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