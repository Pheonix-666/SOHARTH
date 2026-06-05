'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useState, useEffect } from 'react';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productsList, setProductsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProductsList(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products dynamically:', err);
        setIsLoading(false);
      });
  }, []);

  const featured = productsList.slice(0, 3);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>Loading Celestial Orbit...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (featured.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <span className="material-symbols-outlined shimmer" style={{ fontSize: '3rem', opacity: 0.3 }}>travel_explore</span>
          <div className="font-label-caps" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>The catalogue is void — check back soon.</div>
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
        <section style={{ position: 'relative', height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Image
            src="/hero-bg.jpeg"
            alt="Solarth hero"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center top', transform: 'scale(1.05)' }}
          />
          <div className="hero-gradient" style={{ position: 'absolute', inset: 0 }} />

          <div className="fade-in-up" style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 var(--margin-mobile)' }}>
            <span className="font-label-caps" style={{ opacity: 0.8, marginBottom: '1.5rem', display: 'block', letterSpacing: '0.5em' }}>
              Celestial Minimalist Fashion
            </span>
            <h1 className="font-display-hero" style={{ marginBottom: '3rem', color: 'var(--primary)' }}>
              ELEVATE
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div className="desktop-only" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/products" className="btn-primary">Explore Collection</Link>
                <Link href="/products?category=new" className="btn-ghost">New Arrivals</Link>
                <Link href="/account" className="btn-ghost" style={{ marginLeft: '1rem' }}>My Account</Link>
              </div>
            </div>
          </div>

          <div className="floating-cta-container mobile-only">
            <Link href="/products" className="btn-pill-cta">
              <span>Get Started</span>
              <span className="arrows">
                <span className="material-symbols-outlined">chevron_right</span>
                <span className="material-symbols-outlined" style={{ marginLeft: '-8px' }}>chevron_right</span>
                <span className="material-symbols-outlined" style={{ marginLeft: '-8px' }}>chevron_right</span>
              </span>
            </Link>
          </div>

          {/* Atmospheric line */}
          <div style={{ position: 'absolute', bottom: '5rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.2, pointerEvents: 'none' }}>
            <div style={{ width: '1px', height: '300px', background: 'linear-gradient(to top, var(--primary), transparent)' }} />
          </div>
        </section>

        {/* ─── BRAND STATEMENT ─── */}
        <section style={{ padding: 'var(--section-gap) 0' }}>
          <div className="container brand-statement" style={{ maxWidth: '760px', textAlign: 'center' }}>
            <span className="material-symbols-outlined shimmer" style={{ fontSize: '2.5rem', opacity: 0.4, marginBottom: '2rem', display: 'block' }}>
              auto_awesome
            </span>
            <h2 className="font-headline-lg" style={{ marginBottom: '2rem', lineHeight: 1.15 }}>
              Born from the silence of the void, crafted for the movement of light.
            </h2>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
              Solarth bridges the gap between high-fashion editorial and cosmic wonder. Every piece is a quiet luxury, echoing the precision of astronomical phenomena and the stillness of deep space.
            </p>
          </div>
        </section>



        {/* ─── NEW ARRIVALS BENTO ─── */}
        <section style={{ paddingBottom: 'var(--section-gap)' }}>
          <div className="container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
              <div>
                <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.3em', marginBottom: '1rem', display: 'block' }}>
                  The Seasonal Edit
                </span>
                <h2 className="font-headline-lg">NEW ARRIVALS</h2>
              </div>
              <Link href="/products" className="font-label-caps" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', transition: 'border-color 0.3s' }}>
                View All Pieces
              </Link>
            </div>

            {/* Bento Grid */}
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--gutter)', height: '900px' }}>
              {/* Hero Card */}
              <Link
                href={`/products/${featured[0].id}`}
                className="product-card featured-card"
                style={{ gridColumn: 'span 8', gridRow: 'span 2', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)', borderRadius: '16px' }}
              >
                <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface-container)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: 'none' }} onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>favorite</span>
                </button>
                <div className="card-image" style={{ height: '100%', borderRadius: '16px' }}>
                  <Image src={featured[0].image} alt={featured[0].name} fill style={{ objectFit: 'cover', transition: 'transform 1s ease' }} />
                </div>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  padding: '3rem', opacity: 0, transition: 'opacity 0.5s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >
                  {featured[0].tag && (
                    <span className="font-caption" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', letterSpacing: '0.3em' }}>
                      {featured[0].tag}
                    </span>
                  )}
                  <h3 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{featured[0].name}</h3>
                  <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '380px', marginBottom: '1.5rem' }}>
                    {featured[0].description.slice(0, 100)}...
                  </p>
                  <button className="btn-primary" style={{ width: 'fit-content' }}>Quick View</button>
                </div>
              </Link>

              {/* Small Cards */}
              {featured.slice(1).map(p => (
                <Link
                  href={`/products/${p.id}`}
                  key={p.id}
                  className="product-card"
                  style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', position: 'relative' }}
                >
                  <button style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--surface-container)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: 'none' }} onClick={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>favorite</span>
                  </button>
                  <div className="card-image" style={{ flex: 1, position: 'relative', minHeight: '350px', borderRadius: '16px' }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ paddingTop: '1.5rem' }}>
                    <h3 className="font-headline-md" style={{ marginBottom: '0.5rem' }}>{p.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>₹{p.price.toLocaleString()}</span>
                      <span className="font-label-caps" style={{ opacity: 0.4 }}>{p.subtitle.split('/')[1]?.trim()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── GLASSMORPHISM FEATURE ─── */}
        <section style={{ paddingTop: 'var(--section-gap)', paddingBottom: 'var(--section-gap)', backgroundColor: 'var(--surface-dim)', position: 'relative', overflow: 'hidden' }}>
          {/* Background image */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', opacity: 0.3 }}>
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800"
              alt="Atmospheric detail"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="glass-panel glass-panel-mobile" style={{ maxWidth: '600px', padding: '4rem' }}>
              <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.4em', marginBottom: '2rem', display: 'block' }}>
                The Alpine Edit
              </span>
              <h2 className="font-headline-lg" style={{ marginBottom: '2rem' }}>CLEAN SILHOUETTES. COOL TONES.</h2>
              <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '3rem' }}>
                Built for comfort, styled for impact. Our technical range blends high-performance materials with a meditative aesthetic inspired by high-altitude horizons.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div>
                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>FABRIC</h4>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>Recycled technical wool</p>
                </div>
                <div>
                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>THERMAL</h4>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>-15°C Certified</p>
                </div>
              </div>
              <Link href="/products" className="btn-ghost">Discover The Range</Link>
            </div>
          </div>
        </section>

        {/* ─── NEWSLETTER ─── */}
        <section style={{ padding: 'var(--section-gap) 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
            <span className="material-symbols-outlined shimmer" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '2rem', display: 'block', fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
            <h2 className="font-headline-lg" style={{ marginBottom: '1rem' }}>JOIN THE ORBIT</h2>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '3rem' }}>
              Subscribe to receive early access to new collections and editorial insights into the celestial lifestyle.
            </p>
            <form style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', justifyContent: 'center' }} onSubmit={e => e.preventDefault()}>
              <div style={{ flex: 1, borderBottom: '1px solid var(--outline)', paddingBottom: '0.5rem' }}>
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--primary)', fontFamily: 'var(--font-body)', fontSize: '12px',
                    fontWeight: 600, letterSpacing: '0.2em',
                  }}
                />
              </div>
              <button type="submit" className="font-label-caps" style={{ color: 'var(--primary)', borderBottom: '1px solid transparent', paddingBottom: '0.5rem', transition: 'border-color 0.3s' }}>
                Submit
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />

    </>
  );
}
