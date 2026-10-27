import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Security | SOHARTH',
  description:
    'How SOHARTH securely collects, uses, and safeguards your personal, shipping, and payment information under Indian data protection standards.',
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  openGraph: {
    title: 'Privacy Policy | SOHARTH',
    description: 'Data security and privacy commitments for SOHARTH customers.',
    url: `${siteUrl}/privacy-policy`,
    siteName: 'SOHARTH',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
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
        name: 'Privacy Policy',
        item: `${siteUrl}/privacy-policy`,
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
              ✦ DATA PROTECTION & TRUST
            </span>
            <h1 className="font-headline-lg" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, margin: 0, lineHeight: 1.15 }}>
              Privacy & Security Policy
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '0.75rem', lineHeight: 1.6 }}>
              Last updated: October 2026 · We value your trust and never sell customer data.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.8, fontSize: '15px', color: 'rgba(255,255,255,0.85)' }}>
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>1. What Data We Collect</h2>
              <p>
                When you purchase from SOHARTH, we collect personal information you provide such as your name, shipping address, email address, and phone number to fulfill and deliver your order.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>2. 100% Secure Encrypted Payments</h2>
              <p>
                We do NOT store your credit card or debit card numbers on our servers. All digital transactions (UPI, Cards, NetBanking, Wallets) are encrypted and processed through RBI-compliant secure payment gateways.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>3. Communication & Updates</h2>
              <p>
                With your consent, we may send you WhatsApp or email updates regarding your package dispatch, tracking links, and seasonal collection releases. You can opt out at any time with a single reply.
              </p>
            </section>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
