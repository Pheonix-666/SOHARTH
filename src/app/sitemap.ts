import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { products as initialProducts } from '@/lib/data';

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';
  const now = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/shipping-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/returns-exchange`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic product routes
  const productEntries: MetadataRoute.Sitemap = [];
  const seenIds = new Set<string>();

  try {
    const { data: dbProducts } = await supabaseAdmin
      .from('products')
      .select('id, created_at')
      .limit(500);

    if (Array.isArray(dbProducts)) {
      for (const p of dbProducts) {
        const idStr = String(p.id);
        seenIds.add(idStr);
        productEntries.push({
          url: `${siteUrl}/products/${idStr}`,
          lastModified: p.created_at ? new Date(p.created_at) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch (err) {
    console.error('Sitemap dynamic product fetch error (falling back to initialProducts):', err);
  }

  // Include seed initialProducts if not already added
  for (const p of initialProducts) {
    const idStr = String(p.id);
    if (!seenIds.has(idStr)) {
      seenIds.add(idStr);
      productEntries.push({
        url: `${siteUrl}/products/${idStr}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return [...staticRoutes, ...productEntries];
}
