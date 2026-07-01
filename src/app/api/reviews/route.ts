import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
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
