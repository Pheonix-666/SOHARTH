import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';

export const metadata: Metadata = {
  title: 'Terms of Service | SOHARTH Atelier',
  description:
    'Terms and legal conditions governing purchases, payments, shipping, and browsing on soharth.in.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | SOHARTH',
    description: 'Terms and customer rights governing all orders placed on soharth.in.',
    url: `${siteUrl}/terms`,
    siteName: 'SOHARTH',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function TermsPage() {
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
        name: 'Terms of Service',
        item: `${siteUrl}/terms`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main style={{ paddingTop: '8rem', paddingBottom: '6rem', backgroundColor: '#080808', color: '#fff', minHeight: '90vh' }}>
        <div className="container" style={{ maxWidth: '840px', padding: '0 1.25rem' }}>
          
          <div style={{ marginBottom: '3rem' }}>
            <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', fontSize: '11px', display: 'block', marginBottom: '0.75rem' }}>
              ✦ LEGAL TRANSPARENCY
            </span>
            <h1 className="font-headline-lg" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, margin: 0, lineHeight: 1.15 }}>
              Terms of Service
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '0.75rem', lineHeight: 1.6 }}>
              Effective Date: October 2026 · Governing all transactions on soharth.in
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.8, fontSize: '15px', color: 'rgba(255,255,255,0.85)' }}>
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>1. General Overview</h2>
              <p>
                This website is operated by SOHARTH. Throughout the site, the terms &quot;we&quot;, &quot;us&quot; and &quot;our&quot; refer to SOHARTH. By visiting our site or purchasing garments from us, you engage in our &quot;Service&quot; and agree to be bound by the following terms and conditions.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>2. Pricing & Psychological Discounts</h2>
              <p>
                All prices listed on our website are inclusive of applicable GST unless explicitly stated otherwise. We reserve the right to modify prices, discontinue limited drops, or adjust promotional discount codes without prior notice.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>3. Order Acceptance & Fulfillment</h2>
              <p>
                We reserve the right to refuse any order you place with us. In the event that we make a change to or cancel an order, we will attempt to notify you by contacting the email and/or phone number provided at the time the order was made.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>4. Intellectual Property</h2>
              <p>
                All celestial artwork, original graphics, ethnic fusion motifs, typography, product photographs, and brand identity are the intellectual property of SOHARTH. Reproduction or unauthorized resale is strictly prohibited.
              </p>
            </section>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
