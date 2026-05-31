'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

export default function Home() {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { setProductsList(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const featured = productsList.slice(0, 3);

  if (isLoading || featured.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{
          paddingTop: '5rem', minHeight: '100svh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.35em', opacity: 0.4 }}>
            Loading Celestial Orbit…
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>

        {/* ─── HERO ─── */}
        <section className="hero-section">
          {/* Background image */}
          <Image
            src="/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg"
            alt="Solarth hero"
            fill priority
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
          <div className="hero-gradient" style={{ position: 'absolute', inset: 0 }} />

          {/* Content */}
          <div className="fade-in-up" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
            <span className="hero-tagline">Celestial Minimalist Fashion</span>
            <h1 className="hero-title">ELEVATE</h1>
            <div className="hero-ctas">
              <Link href="/products" className="btn-primary" style={{ flex: 1, maxWidth: '240px' }}>
                Explore Collection
              </Link>
              <Link href="/products?category=new" className="btn-ghost" style={{ flex: 1, maxWidth: '200px' }}>
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: 'absolute', bottom: '2rem', left: '50%',
            transform: 'translateX(-50%)', opacity: 0.2,
          }}>
            <div style={{
              width: '1px', height: '60px',
              background: 'linear-gradient(to bottom, transparent, var(--primary))',
            }} />
          </div>
        </section>

        {/* ─── BRAND STATEMENT ─── */}
        <section className="section container" style={{ maxWidth: '720px', textAlign: 'center', margin: '0 auto' }}>
          <span className="material-symbols-outlined shimmer"
            style={{ fontSize: '2rem', opacity: 0.35, marginBottom: '1.5rem', display: 'block' }}>
            auto_awesome
          </span>
          <h2 className="font-headline-lg" style={{ marginBottom: '1.5rem' }}>
            Born from the silence of the void, crafted for the movement of light.
          </h2>
          <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: '1.9' }}>
            Solarth bridges high-fashion editorial and cosmic wonder. Every piece is a quiet luxury,
            echoing the precision of astronomical phenomena and the stillness of deep space.
          </p>
        </section>

        {/* ─── NEW ARRIVALS BENTO ─── */}
        <section style={{ paddingBottom: 'var(--section-gap)' }}>
          <div className="container">
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-end', marginBottom: '2rem',
            }}>
              <div>
                <span className="font-label-caps" style={{
                  color: 'var(--primary)', letterSpacing: '0.3em',
                  marginBottom: '0.5rem', display: 'block',
                }}>
                  The Seasonal Edit
                </span>
                <h2 className="font-headline-lg">NEW ARRIVALS</h2>
              </div>
              <Link href="/products" className="font-label-caps" style={{
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                paddingBottom: '3px',
              }}>
                View All
              </Link>
            </div>

            {/* Bento Grid */}
            <div className="bento-grid">
              {/* Hero Card */}
              {featured[0] && (
                <Link
                  href={`/products/${featured[0].id}`}
                  className="product-card bento-hero"
                >
                  <Image
                    src={featured[0].image} alt={featured[0].name}
                    fill style={{ objectFit: 'cover' }}
                  />
                  {/* Overlay info */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    padding: '1.5rem',
                  }}>
                    {featured[0].tag && (
                      <span className="font-caption" style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
                        padding: '0.2rem 0.6rem', borderRadius: '4px',
                        letterSpacing: '0.2em', width: 'fit-content', marginBottom: '0.5rem',
                      }}>
                        {featured[0].tag}
                      </span>
                    )}
                    <h3 className="font-headline-md" style={{ color: 'var(--primary)' }}>
                      {featured[0].name}
                    </h3>
                    <p className="font-caption" style={{ color: 'rgba(255,255,255,0.65)', marginTop: '0.3rem' }}>
                      ${featured[0].price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              )}

              {/* Small Cards */}
              {featured.slice(1).map(p => (
                <Link
                  href={`/products/${p.id}`}
                  key={p.id}
                  className="product-card bento-sm"
                >
                  <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    padding: '1rem',
                  }}>
                    <h3 className="font-label-caps" style={{ color: 'var(--primary)' }}>{p.name}</h3>
                    <p className="font-caption" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>
                      ${p.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile CTA */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <Link href="/products" className="btn-ghost">
                Explore All Pieces
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FEATURE SECTION — Alpine Edit ─── */}
        <section style={{ backgroundColor: 'var(--surface-container-low)', overflow: 'hidden' }}>
          <div className="feature-section">
            {/* Image */}
            <div className="feature-image-col">
              <Image
                src="/WhatsApp Image 2026-05-29 at 12.50.13 PM.jpeg"
                alt="Alpine Edit"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 60%, var(--surface-container-low))',
              }} />
            </div>
            {/* Text */}
            <div className="feature-text-col">
              <span className="font-label-caps" style={{
                color: 'var(--primary)', letterSpacing: '0.4em',
                marginBottom: '1.5rem', display: 'block', opacity: 0.65,
              }}>
                The Alpine Edit
              </span>
              <h2 className="font-headline-lg" style={{ marginBottom: '1.25rem' }}>
                CLEAN SILHOUETTES.<br />COOL TONES.
              </h2>
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', lineHeight: '1.9' }}>
                Built for comfort, styled for impact. Technical materials meet a meditative aesthetic
                inspired by high-altitude horizons.
              </p>

              {/* Specs row */}
              <div style={{ display: 'flex', gap: '3rem', marginBottom: '2.5rem' }}>
                <div>
                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>FABRIC</h4>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>Recycled technical wool</p>
                </div>
                <div>
                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>THERMAL</h4>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>−15 °C Certified</p>
                </div>
              </div>

              <Link href="/products" className="btn-ghost" style={{ alignSelf: 'flex-start' }}>
                Discover The Range
              </Link>
            </div>
          </div>
        </section>

        {/* ─── NEWSLETTER ─── */}
        <section className="section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <span className="material-symbols-outlined shimmer" style={{
              fontSize: '2.5rem', color: 'var(--primary)',
              marginBottom: '1.5rem', display: 'block',
              fontVariationSettings: "'FILL' 1",
            }}>
              stars
            </span>
            <h2 className="font-headline-lg" style={{ marginBottom: '1rem' }}>JOIN THE ORBIT</h2>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem', lineHeight: '1.8' }}>
              Subscribe to receive early access to new collections and editorial insights.
            </p>
            <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
              <div style={{
                flex: 1,
                borderBottom: '1px solid var(--outline-variant)',
                paddingBottom: '0.5rem',
              }}>
                <input
                  type="email"
                  placeholder="YOUR@EMAIL.COM"
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', outline: 'none',
                    color: 'var(--primary)', fontFamily: 'var(--font-body)',
                    fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em',
                  }}
                />
              </div>
              <button type="submit" className="btn-primary">
                Join
              </button>
            </form>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
