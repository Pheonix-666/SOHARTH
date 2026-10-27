import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';

export const metadata: Metadata = {
  title: 'Contact Us | Client Concierge & Support | SOHARTH',
  description:
    'Reach SOHARTH client service via direct WhatsApp concierge (+91 91377 73967), email, or order tracking desk. Fast assistance for sizing and delivery.',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'Contact Us | SOHARTH Client Concierge',
    description:
      'Direct WhatsApp concierge & support for SOHARTH luxury streetwear orders, sizing, and collaborations.',
    url: `${siteUrl}/contact`,
    siteName: 'SOHARTH',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact SOHARTH Client Concierge',
    description: 'Instant WhatsApp & email client concierge for SOHARTH streetwear.',
  },
};

export default function ContactPage() {
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact SOHARTH',
    url: `${siteUrl}/contact`,
    description: 'Direct contact channels for SOHARTH client support.',
    mainEntity: {
      '@type': 'Organization',
      name: 'SOHARTH',
      url: siteUrl,
      telephone: '+91-9137773967',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-9137773967',
        contactType: 'Customer Support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
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
        name: 'Contact Us',
        item: `${siteUrl}/contact`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main style={{ paddingTop: '8rem', paddingBottom: '6rem', backgroundColor: '#080808', color: '#fff', minHeight: '90vh' }}>
        <div className="container" style={{ maxWidth: '840px', padding: '0 1.25rem' }}>
          
          <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
            <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', fontSize: '11px', display: 'block', marginBottom: '0.75rem' }}>
              ✦ DEDICATED CONCIERGE
            </span>
            <h1 className="font-headline-lg" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 300, margin: 0, lineHeight: 1.15 }}>
              We&apos;re Here to Assist You
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px', marginTop: '0.75rem', maxWidth: '520px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
              Whether you have sizing inquiries, order tracking questions, or corporate bulk collaboration ideas, our atelier team responds swiftly.
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem' }}>
            
            {/* WhatsApp Support (Primary) */}
            <a
              href="https://wa.me/919137773967?text=Hi%20Soharth%20Team%2C%20I%20have%20an%20inquiry%20regarding%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '2rem',
                backgroundColor: 'rgba(37, 211, 102, 0.08)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                borderRadius: '20px',
                textDecoration: 'none',
                color: '#fff',
                transition: 'transform 0.25s, border-color 0.25s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#25d366' }}>chat</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#25d366', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Instant WhatsApp
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem' }}>+91 91377 73967</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                Chat live with our client concierge. Average response time: under 15 minutes.
              </p>
              <span style={{ color: '#25d366', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Open WhatsApp Chat →
              </span>
            </a>

            {/* Email Support */}
            <a
              href="mailto:concierge@soharth.com?subject=Customer%20Support%20Inquiry%20-%20Soharth"
              style={{
                display: 'block',
                padding: '2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                textDecoration: 'none',
                color: '#fff',
                transition: 'transform 0.25s, border-color 0.25s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#60a5fa' }}>mail</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Email Concierge
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem' }}>concierge@soharth.com</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                For editorial queries, corporate orders, and order assistance.
              </p>
              <span style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Send Email →
              </span>
            </a>

            {/* Operating Hours */}
            <div
              style={{
                padding: '2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#fde047' }}>schedule</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fde047', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Business Hours
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem' }}>Mon – Sat, 10 AM – 7 PM</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                Orders placed online are fulfilled 24/7. Inquiries sent after hours will be answered first thing the following morning.
              </p>
            </div>

          </div>

          {/* Instagram Community Banner */}
          <div style={{
            padding: '2rem',
            borderRadius: '20px',
            backgroundColor: '#111',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <span className="font-label-caps" style={{ color: '#fde047', fontSize: '10px', letterSpacing: '0.2em' }}>
                OFFICIAL SOCIAL COMMUNITY
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '4px 0 2px' }}>Follow @soharth.in on Instagram</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0 }}>
                Tag us wearing your SOHARTH piece for a feature in our cosmic gallery.
              </p>
            </div>

            <a
              href="https://www.instagram.com/soharth.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Visit Instagram</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
