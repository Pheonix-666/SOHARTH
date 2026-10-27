import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { products as initialProducts } from '@/lib/data';
import ProductDetailsClient from './ProductDetailsClient';

type Props = {
  params: Promise<{ id: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';

async function getProduct(id: string) {
  try {
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (data) return data;
  } catch (err) {
    // fallback if Supabase table is empty or error
  }

  const initialMatch = initialProducts.find(p => String(p.id) === String(id));
  return initialMatch || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | SOHARTH',
      description: 'The requested luxury streetwear item could not be found.',
    };
  }

  const title = `${product.name} | 240+ GSM Heavyweight Oversized Tee`;
  const rawDesc = product.description || `Engineered 240+ GSM bio-washed combed cotton oversized t-shirt with relaxed drop-shoulder drape. Free Shipping & COD across India.`;
  const description = rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}...` : rawDesc;

  const rawImg = product.image || (product.images && product.images[0]) || '/soharth-logo.jpg';
  const imageUrl = rawImg.startsWith('http') ? rawImg : `${siteUrl}${rawImg}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/products/${id}`,
    },
    openGraph: {
      title: `${title} | SOHARTH`,
      description,
      url: `${siteUrl}/products/${id}`,
      siteName: 'SOHARTH',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: `${product.name} — SOHARTH Heavyweight Oversized Tee`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SOHARTH`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  const productJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: (product.images && product.images.length > 0 ? product.images : [product.image]).map(
          (img: string) => (img.startsWith('http') ? img : `${siteUrl}${img}`)
        ),
        description:
          product.description ||
          `${product.name} 240+ GSM bio-washed combed cotton oversized streetwear tee with drop-shoulder fit.`,
        sku: `SOHARTH-${id}`,
        brand: {
          '@type': 'Brand',
          name: 'SOHARTH',
        },
        offers: {
          '@type': 'Offer',
          url: `${siteUrl}/products/${id}`,
          priceCurrency: 'INR',
          price: product.price,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'SOHARTH',
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'IN',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 7,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn',
          },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0',
              currency: 'INR',
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'IN',
            },
          },
        },
      }
    : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${siteUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product ? product.name : 'Product Details',
        item: `${siteUrl}/products/${id}`,
      },
    ],
  };

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailsClient params={params} />
    </>
  );
}
