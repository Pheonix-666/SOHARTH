import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Pan-India Express & COD | SOHARTH',
  description:
    'Pan-India express delivery across 19,000+ PIN codes, 24-48h dispatch timelines, and Cash on Delivery (COD) terms for SOHARTH heavyweight apparel.',
  alternates: {
    canonical: `${siteUrl}/shipping-policy`,
  },
  openGraph: {
    title: 'Shipping & Delivery Policy | SOHARTH',
    description: 'Free Express Shipping & Cash on Delivery across 19,000+ PIN codes in India.',
    url: `${siteUrl}/shipping-policy`,
    siteName: 'SOHARTH',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ShippingPolicyPage() {
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
        name: 'Shipping Policy',
        item: `${siteUrl}/shipping-policy`,
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
              ✦ LOGISTICS & FULFILLMENT
            </span>
            <h1 className="font-headline-lg" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, margin: 0, lineHeight: 1.15 }}>
              Shipping & Delivery Policy
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '0.75rem', lineHeight: 1.6 }}>
              Last updated: October 2026 · Standard Express Dispatch across all 19,000+ PIN codes in India.
            </p>
          </div>

          {/* Quick Key Highlights Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '3.5rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#fde047', marginBottom: '0.75rem', display: 'block' }}>local_shipping</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>Free Express Shipping</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                Complimentary express shipping on all prepaid orders and orders valued above ₹999.
              </p>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#4ade80', marginBottom: '0.75rem', display: 'block' }}>payments</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>Cash on Delivery (COD)</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                Available across India with a nominal ₹49 handling fee at checkout. Pay cash or UPI at your door.
              </p>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#60a5fa', marginBottom: '0.75rem', display: 'block' }}>schedule</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>24–48h Dispatch</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                Every garment is quality-inspected, steam-pressed, and dispatched within 24 to 48 hours.
              </p>
            </div>
          </div>

          {/* Detailed Policy Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', lineHeight: 1.8, fontSize: '15px', color: 'rgba(255,255,255,0.85)' }}>
            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                1. Domestic Delivery Timelines
              </h2>
              <p>
                All orders are dispatched from our central production hub. Delivery timelines vary slightly depending on your delivery address:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', color: 'var(--on-surface-variant)' }}>
                <li><strong>Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2 to 4 business days.</li>
                <li><strong>Tier-2 & Tier-3 Cities:</strong> 3 to 6 business days.</li>
                <li><strong>North-East & Remote Regions:</strong> 5 to 7 business days.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                2. Live Order Tracking
              </h2>
              <p>
                As soon as your package is picked up by our courier partners (BlueDart, Delhivery, Xpressbees, or DTDC), you will automatically receive an SMS and WhatsApp notification containing your live tracking AWB link.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                3. Cash on Delivery (COD) Guidelines
              </h2>
              <p>
                To prevent automated fraud and ensure smooth deliveries, our logistics team may trigger an automated OTP verification over WhatsApp or SMS before dispatching COD shipments. Please ensure your contact number is active and accepts incoming messages.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                4. Need Urgent Delivery or Queries?
              </h2>
              <p>
                If you have an urgent travel deadline or require priority air courier dispatch, please message our concierge desk on WhatsApp at <strong style={{ color: '#fde047' }}>+91 91377 73967</strong> or email us at <strong style={{ color: '#fff' }}>concierge@soharth.com</strong>.
              </p>
            </section>
          </div>

          <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '11px' }}>
              Explore Collections
            </Link>
            <Link href="/returns-exchange" style={{ padding: '0.75rem 2rem', fontSize: '11px', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', display: 'inline-flex', alignItems: 'center' }}>
              View Returns & Exchanges Policy →
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
