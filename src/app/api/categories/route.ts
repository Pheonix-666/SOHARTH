import { NextResponse } from 'next/server';
import { getCategories, saveCategories } from '@/lib/db';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { label } = body;

    if (!label || label.trim() === '') {
      return NextResponse.json({ error: 'Missing required field: label' }, { status: 400 });
    }

    const trimmedLabel = label.trim();
    const value = trimmedLabel.toLowerCase().replace(/\s+/g, '-');

    if (!value) {
      return NextResponse.json({ error: 'Invalid label character input' }, { status: 400 });
    }

    const categories = await getCategories();

    const exists = categories.some((c: any) => c.value === value);
    if (exists) {
      return NextResponse.json({ error: 'Category already exists in the dynamic register' }, { status: 400 });
    }

    const newCategory = { value, label: trimmedLabel.toUpperCase() };
    categories.push(newCategory);
    await saveCategories(categories);

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const value = searchParams.get('value');

    if (!value || value.trim() === '') {
      return NextResponse.json({ error: 'Missing required query param: value' }, { status: 400 });
    }

    const categories = await getCategories();
    const index = categories.findIndex((c: any) => c.value === value);

    if (index === -1) {
      return NextResponse.json({ error: 'Category not found in registry' }, { status: 404 });
    }

    const removed = categories.splice(index, 1)[0];
    await saveCategories(categories);

    return NextResponse.json({ success: true, removed });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

