import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const products = await getProducts();
    let filteredProducts = products;
    
    if (category) {
      filteredProducts = products.filter((p: any) => p.category === category);
    }

    return NextResponse.json(filteredProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, subtitle, price, category, tag, image, images, description, collection, material, shipping } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields: name, price, category are mandatory' }, { status: 400 });
    }

    const products = await getProducts();
    
    // Create new product object with safe fallbacks matching our high-fashion aesthetic
    const newProduct = {
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
      name: name.toUpperCase(),
      subtitle: subtitle || 'Premium Collection Piece',
      price: Number(price),
      category: category.toLowerCase(),
      tag: tag || '',
      image: image || '/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg',
      images: images && images.length > 0 ? images : [image || '/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg'],
      description: description || 'Meticulously crafted designer garment. Engineered with architectural precision.',
      collection: collection || 'COLLECTION 01: NEBULA',
      material: material || '100% Organic Virgin Fiber Blend. Dry clean only.',
      shipping: shipping || 'Complimentary express shipping on orders over $500. 30-day return window.',
    };

    products.push(newProduct);
    await saveProducts(products);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
