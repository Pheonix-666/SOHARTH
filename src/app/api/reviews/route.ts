import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 120;

export async function GET() {
  // Try querying reviews
  let { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(30);

  // Fallback if 'approved' column is not in existing schema
  if (error && (error.code === 'PGRST204' || error.message?.includes('approved'))) {
    const fallback = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data ?? [], {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, city, rating, text, image_url } = body;

  if (!name || !rating || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('reviews')
    .insert({
      name: name.trim(),
      city: city?.trim() || '',
      rating: Number(rating),
      text: text.trim(),
      image_url: image_url || null,
      approved: false,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
