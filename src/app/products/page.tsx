import type { Metadata } from 'next';
import ProductCatalogClient from './ProductCatalogClient';
import { products as initialProducts } from '@/lib/data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';

export const metadata: Metadata = {
  title: 'Shop Heavyweight Oversized T-Shirts & Graphic Streetwear',
  description:
    'Browse the SOHARTH collection: 240+ GSM bio-washed combed cotton oversized tees, celestial graphics, and ethnic fusion drop-shoulder silhouettes. Free Delivery & COD across India.',
  alternates: {
    canonical: `${siteUrl}/products`,
  },
  openGraph: {
    title: 'Shop Heavyweight Oversized T-Shirts & Graphic Streetwear | SOHARTH',
    description:
      'Browse the SOHARTH collection: 240+ GSM bio-washed combed cotton oversized tees, celestial graphics, and ethnic fusion drop-shoulder silhouettes. Free Delivery & COD across India.',
    url: `${siteUrl}/products`,
    siteName: 'SOHARTH',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/soharth-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'SOHARTH Heavyweight Oversized Tees Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Heavyweight Oversized T-Shirts & Graphic Streetwear | SOHARTH',
    description:
      '240+ GSM bio-washed combed cotton oversized tees, drop-shoulder silhouettes & celestial graphics. Free Express Shipping & COD.',
    images: ['/soharth-logo.jpg'],
  },
};

type Props = {
  searchParams: Promise<{
    category?: string;
    fit?: string;
    style?: string;
    price?: string;
    q?: string;
    search?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Heavyweight Oversized T-Shirts & Cultural Streetwear',
    description:
      'Explore the complete SOHARTH collection of 240+ GSM bio-washed combed cotton oversized t-shirts and graphic streetwear.',
    url: `${siteUrl}/products`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: initialProducts.length,
      itemListElement: initialProducts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${siteUrl}/products/${p.id}`,
        name: p.name,
      })),
    },
  };

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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductCatalogClient searchParams={searchParams} />
    </>
  );
}