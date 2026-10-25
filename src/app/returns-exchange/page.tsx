import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Returns & Exchange Policy | SOHARTH',
  description: '7-day seamless return, size exchange, and doorstep pickup guidelines for SOHARTH streetwear.',
};

export default function ReturnsExchangePage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '8rem', paddingBottom: '6rem', backgroundColor: '#080808', color: '#fff', minHeight: '90vh' }}>
        <div className="container" style={{ maxWidth: '840px', padding: '0 1.25rem' }}>
          
          <div style={{ marginBottom: '3rem' }}>
            <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', fontSize: '11px', display: 'block', marginBottom: '0.75rem' }}>
              ✦ RISK-FREE EXPERIENCE
            </span>
            <h1 className="font-headline-lg" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, margin: 0, lineHeight: 1.15 }}>
              7-Day Returns & Size Exchange
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '0.75rem', lineHeight: 1.6 }}>
              We want you to love your silhouette. If the fit isn&apos;t flawless, we will exchange or refund it seamlessly.
            </p>
          </div>

          {/* 3 Step Exchange Process */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '3.5rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#fde047', marginBottom: '0.75rem', display: 'block' }}>chat</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>1. Message Us</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                Ping us on WhatsApp (+91 91377 73967) within 7 days of delivery with your Order ID.
              </p>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#60a5fa', marginBottom: '0.75rem', display: 'block' }}>sync_alt</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>2. Doorstep Pickup</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                Our courier executive will arrive at your address to pick up the item in its original condition.
              </p>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#4ade80', marginBottom: '0.75rem', display: 'block' }}>currency_rupee</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>3. Instant Refund / Swap</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                Receive your replacement size or direct refund to your original payment method or UPI.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', lineHeight: 1.8, fontSize: '15px', color: 'rgba(255,255,255,0.85)' }}>
            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                Exchange Policy Terms
              </h2>
              <p>
                To be eligible for an exchange or return:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', color: 'var(--on-surface-variant)' }}>
                <li>Item must be unworn, unwashed, and without perfume/stain marks.</li>
                <li>Original brand tags and celestial poly-packaging must be intact.</li>
                <li>Request must be logged within 7 days of package delivery.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                COD Order Refunds
              </h2>
              <p>
                If your order was placed using Cash on Delivery (COD), our support concierge will provide a secure UPI/bank transfer link to credit your refund within 24 to 48 hours of quality inspection.
              </p>
            </section>

            <section style={{ backgroundColor: 'rgba(253, 224, 71, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(253, 224, 71, 0.2)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fde047', marginBottom: '0.5rem' }}>
                Need to initiate an exchange right now?
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#e4e4e7' }}>
                Click below to open a direct WhatsApp chat with our returns desk:
              </p>
              <a
                href="https://wa.me/919137773967?text=Hi%20Soharth%20Support%2C%20I%20would%20like%20to%20request%20a%20size%20exchange%2Freturn%20for%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '1rem', padding: '0.75rem 1.75rem', fontSize: '11px' }}
              >
                <span>Initiate on WhatsApp (+91 91377 73967)</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
              </a>
            </section>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
