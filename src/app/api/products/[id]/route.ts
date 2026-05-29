import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await getProducts();
    const product = products.find((p: any) => p.id === id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const products = await getProducts();
    const index = products.findIndex((p: any) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Merge existing details with incoming updates
    const updatedProduct = {
      ...products[index],
      ...body,
      id, // Lock ID integrity
      price: body.price !== undefined ? Number(body.price) : products[index].price,
      name: body.name ? body.name.toUpperCase() : products[index].name,
    };

    products[index] = updatedProduct;
    await saveProducts(products);

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await getProducts();
    const index = products.findIndex((p: any) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const filteredProducts = products.filter((p: any) => p.id !== id);
    await saveProducts(filteredProducts);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
