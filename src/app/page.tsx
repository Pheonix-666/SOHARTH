'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

/* ─── COUNTER ITEM ─── */
function CounterItem({ icon, end, suffix, label, decimal }: { icon: string; end: number; suffix: string; label: string; decimal?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1800;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(parseFloat((eased * end).toFixed(decimal ? 1 : 0)));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, decimal]);

  return (
    <div ref={ref} className="counter-item">
      <span className="counter-icon">{icon}</span>
      <span className="counter-number">{decimal ? count.toFixed(1) : count.toLocaleString()}{suffix}</span>
      <span className="counter-label">{label}</span>
    </div>
  );
}




/* ─── REVIEW MODAL ─── */
function ReviewModal({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [text, setText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!name.trim() || !text.trim() || rating === 0) return;
    setStatus('loading');

    let image_url: string | null = null;

    if (photoFile) {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append('file', photoFile);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      setUploadingPhoto(false);
      if (upData.url) image_url = upData.url;
    }

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, rating, text, image_url }),
    });
    setStatus(res.ok ? 'success' : 'error');
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
    >
      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', maxWidth: '520px', width: '100%', position: 'relative', margin: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
          <span className="material-symbols-outlined">close</span>
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#4caf50', fontVariationSettings: "'FILL' 1", display: 'block', marginBottom: '1rem' }}>check_circle</span>
            <h3 className="font-headline-md" style={{ marginBottom: '0.75rem' }}>Thank You!</h3>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Your review has been submitted and will appear after approval.</p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: '2rem' }}>Close</button>
          </div>
        ) : (
          <>
            <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.4em', display: 'block', marginBottom: '1rem' }}>Share Your Experience</span>
            <h3 className="font-headline-md" style={{ marginBottom: '2rem' }}>Write a Review</h3>

            {/* Photo Upload */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  border: '2px dashed rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                  background: photoPreview ? 'transparent' : 'rgba(255,255,255,0.03)',
                  transition: 'border-color 0.2s',
                }}
              >
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '28px' }}>add_a_photo</span>
                }
              </div>
              <div>
                <p className="font-label-caps" style={{ marginBottom: '0.35rem', opacity: 0.6, letterSpacing: '0.2em', fontSize: '10px' }}>Your Photo (optional)</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.4rem 1rem', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}
                >
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '11px', cursor: 'pointer', marginLeft: '0.5rem', fontFamily: 'var(--font-body)' }}
                  >Remove</button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            {/* Star Picker */}
            <div style={{ marginBottom: '2rem' }}>
              <p className="font-label-caps" style={{ marginBottom: '0.75rem', opacity: 0.6, letterSpacing: '0.2em' }}>Your Rating</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '2rem',
                        color: (hover || rating) >= s ? '#d4af37' : 'rgba(255,255,255,0.2)',
                        fontVariationSettings: (hover || rating) >= s ? "'FILL' 1" : "'FILL' 0",
                        transition: 'color 0.15s',
                      }}
                    >star</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Fields */}
            {([
              { label: 'Your Name *', value: name, setter: setName, placeholder: 'e.g. Riya M.' },
              { label: 'City', value: city, setter: setCity, placeholder: 'e.g. Delhi' },
            ] as { label: string; value: string; setter: (v: string) => void; placeholder: string }[]).map(f => (
              <div key={f.label} style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <label className="font-label-caps" style={{ display: 'block', marginBottom: '0.4rem', opacity: 0.5, letterSpacing: '0.2em', fontSize: '10px' }}>{f.label}</label>
                <input
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--primary)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500 }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              <label className="font-label-caps" style={{ display: 'block', marginBottom: '0.4rem', opacity: 0.5, letterSpacing: '0.2em', fontSize: '10px' }}>Your Review *</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--primary)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, resize: 'none', lineHeight: 1.6 }}
              />
            </div>

            {status === 'error' && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '1rem' }}>Something went wrong. Please try again.</p>}

            <button
              onClick={submit}
              disabled={status === 'loading' || !name || !text || rating === 0}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', opacity: (!name || !text || rating === 0) ? 0.5 : 1 }}
            >
              {status === 'loading' ? (uploadingPhoto ? 'Uploading photo...' : 'Submitting...') : 'Submit Review'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productsList, setProductsList] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();

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

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setDbReviews(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading]);

  const featured = productsList.slice(0, 5);

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
        <section
          style={{
            position: 'relative',
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Image
            src="/hero-bg.jpeg"
            alt="Soharth hero"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />

          <div className="hero-gradient-mesh" />

          <div
            className="hero-gradient"
            style={{ position: 'absolute', inset: 0 }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              padding: '0 5vw',
            }}
          >
            <span
              className="font-label-caps stagger-reveal"
              style={{
                opacity: 0.8,
                marginBottom: '1.5rem',
                display: 'inline-block',
                letterSpacing: '0.5em',
              }}
            >
              <span className="stagger-reveal-inner" style={{ animationDelay: '0.2s' }}>
                Celestial Minimalist Fashion
              </span>
            </span>

            <h1
              className="font-display-hero stagger-reveal"
              style={{
                marginBottom: '3rem',
                color: 'var(--primary)',
              }}
            >
              <span className="stagger-reveal-inner" style={{ animationDelay: '0.4s' }}>
                ELEVATE
              </span>
            </h1>

            <div
              className="fade-in-up"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center',
                animationDelay: '0.8s',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Link href="/products" className="btn-primary">
                  Explore Collection
                </Link>

                <Link href="/products?category=new" className="btn-ghost">
                  New Arrivals
                </Link>
              </div>
            </div>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-indicator-line" />
          </div>
        </section>

        {/* ─── INTERACTIVE MARQUEE ─── */}
        <section className="marquee-container reveal-on-scroll">
          <div className="marquee-content">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <span className="marquee-item">CELESTIAL <span className="material-symbols-outlined marquee-star">flare</span></span>
                <span className="marquee-item">MINIMALIST <span className="material-symbols-outlined marquee-star">flare</span></span>
                <span className="marquee-item">PREMIUM <span className="material-symbols-outlined marquee-star">flare</span></span>
                <span className="marquee-item">ARCHITECTURAL <span className="material-symbols-outlined marquee-star">flare</span></span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BRAND STATEMENT ─── */}
        <section className="reveal-on-scroll" style={{ padding: 'calc(var(--section-gap) / 2) 0 var(--section-gap) 0' }}>
          <div className="container brand-statement" style={{ maxWidth: '760px', textAlign: 'center' }}>
            <span className="material-symbols-outlined shimmer" style={{ fontSize: '2.5rem', opacity: 0.4, marginBottom: '2rem', display: 'block' }}>
              auto_awesome
            </span>
            <h2 className="font-headline-lg" style={{ marginBottom: '2rem', lineHeight: 1.15 }}>
              Born from the silence of the void, crafted for the movement of light.
            </h2>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
              Soharth bridges the gap between high-fashion editorial and cosmic wonder. Every piece is a quiet luxury, echoing the precision of astronomical phenomena and the stillness of deep space.
            </p>
          </div>
        </section>



        {/* ─── NEW ARRIVALS BENTO ─── */}
        <section className="reveal-on-scroll" style={{ paddingBottom: '4rem' }}>
          <div className="container">
            {/* Header */}
            <div className="new-arrivals-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
              <div>
                <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.3em', marginBottom: '1rem', display: 'block' }}>
                  The Seasonal Edit
                </span>
                <h2 className="font-headline-lg">NEW ARRIVALS</h2>
              </div>
            </div>

            {/* Bento Grid — Row 1: hero (8 cols) + 2 small (4 cols each) */}
            <div className="product-grid home-bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--gutter)' }}>
              {/* Hero Card */}
              {featured[0] && (
                <Link
                  href={`/products/${featured[0].id}`}
                  className="product-card product-card-enhanced featured-card"
                  style={{ gridColumn: 'span 8', gridRow: 'span 1', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)', borderRadius: '16px', minHeight: '560px' }}
                >
                  <button
                    className="quick-add-hover"
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface-container)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: 'none', transition: 'transform 0.3s' }}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(featured[0], 'OS', 1);
                      showToast(`${featured[0].name} added to cart`, 'success');
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>add_shopping_cart</span>
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
                    <h3 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{featured[0].name}</h3>
                    <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '380px', marginBottom: '1.5rem' }}>
                      {featured[0].description?.slice(0, 100)}...
                    </p>
                    <button className="btn-primary" style={{ width: 'fit-content' }}>Quick View</button>
                  </div>
                </Link>
              )}

              {/* Side cards: products 2 & 3 */}
              {featured.slice(1, 3).map(p => (
                <Link
                  href={`/products/${p.id}`}
                  key={p.id}
                  className="product-card product-card-enhanced"
                  style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', position: 'relative' }}
                >
                  <button
                    className="quick-add-hover"
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--surface-container)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: 'none', transition: 'transform 0.3s' }}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(p, 'OS', 1);
                      showToast(`${p.name} added to cart`, 'success');
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>add_shopping_cart</span>
                  </button>
                  <div className="card-image" style={{ flex: 1, position: 'relative', minHeight: '260px', borderRadius: '16px', overflow: 'hidden' }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ paddingTop: '1.25rem' }}>
                    <h3 className="font-headline-md" style={{ marginBottom: '0.5rem' }}>{p.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>₹{p.price.toLocaleString()}</span>
                      <span className="font-label-caps" style={{ opacity: 0.4 }}>{p.subtitle?.split('/')[1]?.trim()}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Row 2: 2 equal cards (products 4–5) - Hidden on Desktop */}
              {featured.slice(3, 5).map(p => (
                <Link
                  href={`/products/${p.id}`}
                  key={p.id}
                  className="product-card product-card-enhanced desktop-hidden-product"
                  style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', position: 'relative', marginTop: '2rem' }}
                >
                  <button
                    className="quick-add-hover"
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--surface-container)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: 'none', transition: 'transform 0.3s' }}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(p, 'OS', 1);
                      showToast(`${p.name} added to cart`, 'success');
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>add_shopping_cart</span>
                  </button>
                  <div className="card-image" style={{ position: 'relative', height: '360px', borderRadius: '16px', overflow: 'hidden' }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ paddingTop: '1.25rem' }}>
                    <h3 className="font-headline-md" style={{ marginBottom: '0.5rem' }}>{p.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>₹{p.price.toLocaleString()}</span>
                      <span className="font-label-caps" style={{ opacity: 0.4 }}>{p.subtitle?.split('/')[1]?.trim()}</span>
                    </div>
                  </div>
                </Link>
              ))}

            </div>
          </div>
        </section>

        {/* ─── VIEW ALL CTA ─── */}
        <section className="reveal-on-scroll" style={{ padding: '3rem 0 var(--section-gap)', textAlign: 'center' }}>
          <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.4em', marginBottom: '2.5rem', display: 'block', opacity: 0.6 }}>
            {productsList.length > 0 ? `${productsList.length} pieces in the collection` : 'Explore the full collection'}
          </span>
          <Link href="/products" className="btn-flashy">
            <span className="btn-flashy-shimmer" />
            <span>View All Pieces</span>
            <span className="material-symbols-outlined btn-flashy-icon">arrow_forward</span>
          </Link>
        </section>

        {/* ─── SOCIAL PROOF COUNTER STRIP ─── */}
        <section className="counter-strip reveal-on-scroll">
          <div className="container">
            <div className="counter-grid">
              {[
                { icon: '🌍', end: 2400, suffix: '+', label: 'Happy Customers' },
                { icon: '👗', end: 180, suffix: '+', label: 'Pieces Curated' },
                { icon: '⭐', end: 4.9, suffix: '', label: 'Avg. Rating', decimal: true },
                { icon: '🚀', end: 48, suffix: 'h', label: 'Avg. Dispatch' },
              ].map((stat, i) => (
                <CounterItem key={i} {...stat} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── REVIEWS SECTION (Merged with Testimonials) ─── */}
        {(() => {
          const TESTIMONIALS = [
            { quote: '"Absolutely obsessed with my order. The fabric feels celestial — worth every rupee."', author: 'Riya M., Delhi' },
            { quote: '"Finally a brand that does minimal fashion right. The silhouettes are immaculate."', author: 'Aryan S., Mumbai' },
            { quote: '"Ordered twice already. Packaging, quality, vibe — all 10/10."', author: 'Priya K., Bengaluru' },
          ];

          const combinedReviews = [
            ...TESTIMONIALS.map((t, i) => ({
              id: `static-${i}`,
              name: t.author.split(',')[0].trim(),
              city: t.author.split(',')[1]?.trim() || '',
              rating: 5,
              text: t.quote.replace(/(^"|"$)/g, ''),
              created_at: new Date(Date.now() - i * 86400000 * 15).toISOString(),
            })),
            ...dbReviews
          ];

          return (
            <section className="reviews-section reveal-on-scroll" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="container">

                {/* Header row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div>
                    <div className="overall-rating-badge" style={{ marginBottom: '1rem' }}>
                      <span className="overall-rating-score">{combinedReviews.length > 0 ? (combinedReviews.reduce((a: number, r: {rating: number}) => a + r.rating, 0) / combinedReviews.length).toFixed(1) : '—'}</span>
                      <div className="overall-rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px' }}>star</span>
                        ))}
                      </div>
                      <span className="overall-rating-count">{combinedReviews.length} review{combinedReviews.length !== 1 ? 's' : ''}</span>
                    </div>
                    <h2 className="font-headline-lg" style={{ marginBottom: '0.5rem' }}>COMMUNITY REVIEWS</h2>
                    <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', opacity: 0.7 }}>Real words from real people who wear Soharth.</p>
                  </div>

                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_a_photo</span>
                    Write a Review
                  </button>
                </div>

                {/* Review cards — always 2+ cols */}
                {combinedReviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>rate_review</span>
                    <p className="font-label-caps" style={{ letterSpacing: '0.3em' }}>No reviews yet — be the first!</p>
                  </div>
                ) : (
                  <div className="reviews-grid-live">
                    {combinedReviews.map((r: {id: string; name: string; city: string; rating: number; text: string; image_url?: string; created_at: string}) => (
                      <div key={r.id} className="review-card">
                        <div className="review-card-stars">
                          {[...Array(r.rating)].map((_, s) => (
                            <span key={s} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '15px' }}>star</span>
                          ))}
                        </div>
                        <p className="review-card-text">{r.text}</p>
                        {r.image_url && (
                          <div style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', marginTop: '0.5rem' }}>
                            <img src={r.image_url} alt="Review photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="review-card-footer">
                          <div className="review-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                            {r.image_url
                              ? <img src={r.image_url} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>{r.name[0]}</span>
                            }
                          </div>
                          <div>
                            <div className="review-name">{r.name}</div>
                            <div className="review-meta">{r.city}{r.city ? ' · ' : ''}{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <div className="review-verified">
                            <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                            Verified
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })()}

        {/* Review Modal */}
        {reviewModalOpen && <ReviewModal onClose={() => setReviewModalOpen(false)} />}

      </main>
      <Footer />

    </>
  );
}
