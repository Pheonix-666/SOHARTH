'use client';

import { useState } from 'react';
import Link from 'next/link';
import SizeChartModal from './SizeChartModal';

export default function Footer() {
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  return (
    <>
      <footer style={{
        width: '100%',
        paddingTop: 'calc(var(--section-gap) / 1.5)',
        paddingBottom: '3.5rem',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="container">

          {/* Trust Banner Strip in Footer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '3rem',
            marginBottom: '3rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#fde047' }}>local_shipping</span>
              <div>
                <h5 style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#fff' }}>Free Express Shipping</h5>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>On prepaid & orders over ₹999</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#4ade80' }}>payments</span>
              <div>
                <h5 style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#fff' }}>Cash on Delivery</h5>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>Available across 19,000+ PIN codes</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#60a5fa' }}>sync_alt</span>
              <div>
                <h5 style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#fff' }}>7-Day Easy Returns</h5>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>Doorstep pickup & size exchanges</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#fde047' }}>verified</span>
              <div>
                <h5 style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#fff' }}>240+ GSM Pure Cotton</h5>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>Bio-washed & pre-shrunk fabric</p>
              </div>
            </div>
          </div>

          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {/* About Column */}
            <div style={{ maxWidth: '280px' }}>
              <div className="font-headline-lg" style={{ letterSpacing: '0.25em', color: 'var(--primary)', marginBottom: '1rem', fontSize: '24px' }}>
                SOHARTH
              </div>
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', fontSize: '13px', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                Premium 240+ GSM heavyweight oversized and cultural t-shirts. Architectural silhouettes engineered with bio-washed combed cotton.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#25d366' }}>chat</span>
                <a
                  href="https://wa.me/919137773967?text=Hi%20Soharth%20Team%2C%20I%20have%20a%20question%20about%20my%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: '#25d366', fontWeight: 600, textDecoration: 'underline' }}
                >
                  WhatsApp: +91 91377 73967
                </a>
              </div>
            </div>

            {/* T-Shirt Collections (Direct & Clear) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.6, marginBottom: '0.25rem', fontSize: '11px' }}>
                T-SHIRT COLLECTIONS
              </h4>
              <Link href="/products?category=heroic" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                Oversized Tees (The Void)
              </Link>
              <Link href="/products?category=ethnic" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                Ethnic & Heritage Tees
              </Link>
              <Link href="/products?category=quotes" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                Graphic Statement Tees
              </Link>
              <Link href="/products?category=new" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                New Arrivals · Latest Drops
              </Link>
              <Link href="/products" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em', color: '#fde047', fontWeight: 600 }}>
                Explore All T-Shirts →
              </Link>
            </div>

            {/* Client Service & Trust Policies (Real Links!) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'flex-start' }}>
              <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.6, marginBottom: '0.25rem', fontSize: '11px' }}>
                CUSTOMER CARE & POLICIES
              </h4>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="nav-link"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textAlign: 'left',
                }}
              >
                Size Guide & Measurement
              </button>
              <Link href="/shipping-policy" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                Shipping & COD Policy
              </Link>
              <Link href="/returns-exchange" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                7-Day Returns & Exchanges
              </Link>
              <Link href="/contact" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                Contact & Support
              </Link>
              <Link href="/terms" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                Terms of Service
              </Link>
            </div>

            {/* Community & Social */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.6, marginBottom: '0.25rem', fontSize: '11px' }}>
                CONNECT & ATELIER
              </h4>
              <a
                href="https://www.instagram.com/soharth.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
                style={{ fontSize: '13px', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Instagram (@soharth.in)</span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
              </a>
              <Link href="/about" className="nav-link" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
                Our Brand Story
              </Link>
              <a
                href="/#custom-orders"
                className="nav-link"
                style={{ fontSize: '13px', letterSpacing: '0.08em' }}
              >
                Custom Bulk & Corporate Merch
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom" style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span className="font-label-caps" style={{ opacity: 0.6, fontSize: '11px' }}>
              © {new Date().getFullYear()} <span className="soharth-font">SOHARTH</span>. 100% PURE COTTON STREETWEAR.
            </span>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/privacy-policy" className="nav-link" style={{ fontSize: '12px', opacity: 0.7 }}>Privacy Policy</Link>
              <Link href="/terms" className="nav-link" style={{ fontSize: '12px', opacity: 0.7 }}>Terms of Service</Link>
              <Link href="/shipping-policy" className="nav-link" style={{ fontSize: '12px', opacity: 0.7 }}>Shipping & COD</Link>
              <Link href="/contact" className="nav-link" style={{ fontSize: '12px', opacity: 0.7 }}>Help Desk</Link>
            </div>
          </div>
        </div>
      </footer>

      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />
    </>
  );
}
