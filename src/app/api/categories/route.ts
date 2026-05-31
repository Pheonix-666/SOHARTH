import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('label');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { label } = await req.json();

  if (!label || label.trim() === '') {
    return NextResponse.json({ error: 'Missing required field: label' }, { status: 400 });
  }

  const trimmedLabel = label.trim().toUpperCase();
  const value = trimmedLabel.toLowerCase().replace(/\s+/g, '-');

  // Check if already exists
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('value')
    .eq('value', value)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Category already exists in the dynamic register' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ label: trimmedLabel, value })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, category: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const value = searchParams.get('value');

  if (!value || value.trim() === '') {
    return NextResponse.json(
      { error: 'Missing required query param: value' },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('value')
    .eq('value', value)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: 'Category not found in registry' },
      { status: 404 }
    );
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('value', value);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}