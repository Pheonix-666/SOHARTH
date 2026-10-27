import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/cart',
          '/login',
        ],
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot'],
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/cart',
          '/login',
        ],
      },
      // Allow leading AI bots to crawl public pages for Generative Engine Optimization (GEO)
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot'],
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/cart',
          '/login',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
