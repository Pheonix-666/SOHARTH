'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getProductPricing } from '@/lib/pricing';

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

const BRAND_HERO_SHIRTS = [
  {
    id: 'king',
    name: 'THE KING',
    tagline: 'OVERSIZED TEE',
    image: '/flagship-king-tee.jpg',
    price: '₹349',
    position: 'center 62%'
  },
  {
    id: 'moon-knight',
    name: 'MOON KNIGHT',
    tagline: 'NOCTURNAL TEE',
    image: '/flagship-moon-knight.jpg',
    price: '₹349',
    position: 'center 60%'
  },
  {
    id: 'matrix',
    name: 'THE MATRIX',
    tagline: 'CYBER-GLITCH TEE',
    image: '/flagship-matrix.jpg',
    price: '₹349',
    position: 'center 58%'
  },
  {
    id: 'babayaga',
    name: 'BABA YAGA',
    tagline: 'DARK ASSASSIN TEE',
    image: '/flagship-babayaga.jpg',
    price: '₹349',
    position: 'center 60%'
  },
];

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productsList, setProductsList] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHeroShirt, setSelectedHeroShirt] = useState(BRAND_HERO_SHIRTS[0]);
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

  // Distinct categories available in products
  const availableCategories = ['all', ...Array.from(new Set(productsList.map(p => p.category?.toLowerCase()).filter(Boolean)))];

  const filteredProducts = selectedCategory === 'all'
    ? productsList
    : productsList.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  const featured = filteredProducts.slice(0, 5);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>Synchronizing Celestial Orbit...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (productsList.length === 0) {
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

        {/* ─── 10X CELESTIAL HERO SECTION ─── */}
        <section className="hero-celestial-container">
          {/* User's Actual Brand T-Shirt Hero Background */}
          <div className="hero-eclipse-bg">
            <Image
              key={selectedHeroShirt.id}
              src={selectedHeroShirt.image}
              alt={`Soharth ${selectedHeroShirt.name} Graphic Oversized Streetwear T-Shirt`}
              fill
              priority
              quality={95}
              style={{ objectFit: 'cover', objectPosition: selectedHeroShirt.position }}
            />
          </div>

          {/* Atmospheric Starry & Vignette Overlays */}
          <div className="hero-stars-overlay" />
          <div className="hero-vignette-overlay" />
          <div className="hero-top-fade" />
          <div className="hero-bottom-fade" />

          {/* Hero Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              padding: '0 5vw',
              maxWidth: '1080px',
              margin: '0 auto',
            }}
          >
            {/* Glowing Brand Pill */}
            <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="hero-pill-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fde047' }}>
                  auto_awesome
                </span>
                <span>AUTUMN / WINTER 2026 • CELESTIAL LUXURY APPAREL</span>
              </div>
            </div>

            {/* Title with Metallic Stardust Shimmer */}
            <h1 className="hero-title-metallic fade-in-up" style={{ animationDelay: '0.25s' }}>
              SOHARTH
            </h1>

            {/* Subhead Narrative */}
            <p className="hero-subhead-text fade-in-up" style={{ animationDelay: '0.4s' }}>
              BORN IN THE VOID. CRAFTED IN LIGHT.
            </p>

            {/* Value Highlights Ribbon */}
            <div className="hero-features-ribbon fade-in-up" style={{ animationDelay: '0.55s' }}>
              <span className="hero-feature-item">
                <span className="hero-feature-dot" />
                Heavyweight 320 GSM Crepe
              </span>
              <span className="hero-feature-item">
                <span className="hero-feature-dot" />
                Zero-Distortion Architectural Cuts
              </span>
              <span className="hero-feature-item">
                <span className="hero-feature-dot" />
                Limited Studio Drops
              </span>
            </div>

            {/* Interactive CTAs */}
            <div
              className="fade-in-up"
              style={{
                display: 'flex',
                gap: '1.25rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                animationDelay: '0.7s',
              }}
            >
              <Link href="/products" className="btn-flashy">
                <span className="btn-flashy-shimmer" />
                <span>EXPLORE THE DROP</span>
                <span className="material-symbols-outlined btn-flashy-icon">arrow_forward</span>
              </Link>

              <a
                href="#custom-orders"
                className="btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderColor: 'rgba(253, 224, 71, 0.45)',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '1.05rem 2.25rem',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  color: '#ffffff'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#fde047' }}>workspace_premium</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>CUSTOM ORDERS</span>
              </a>
            </div>

            {/* Floating Social Proof & Featured T-shirt Micro-Badges */}
            <div
              className="fade-in-up"
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: '3.5rem',
                animationDelay: '0.85s',
              }}
            >
              <Link
                href="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: '#fff',
                  background: 'rgba(253, 224, 71, 0.1)',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(253, 224, 71, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#fde047' }}>checkroom</span>
                <span>Featured: <strong>{selectedHeroShirt.name} {selectedHeroShirt.tagline}</strong> • {selectedHeroShirt.price}</span>
              </Link>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#a1a1aa',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#4ade80' }}>verified</span>
                <span>100% Organic Bio-Washed Cotton</span>
              </div>
            </div>

            {/* Actual Brand T-shirt Live Selector Switcher */}
            <div className="fade-in-up" style={{ animationDelay: '1s' }}>
              <div className="hero-tshirt-switchers">
                <span style={{ fontSize: '9px', color: '#71717a', paddingLeft: '10px', paddingRight: '4px', fontWeight: 700, letterSpacing: '0.15em' }}>
                  SHOWCASE:
                </span>
                {BRAND_HERO_SHIRTS.map((shirt) => (
                  <button
                    key={shirt.id}
                    onClick={() => setSelectedHeroShirt(shirt)}
                    className={`hero-tshirt-tab ${selectedHeroShirt.id === shirt.id ? 'active' : ''}`}
                  >
                    {shirt.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ambient Scroll Indicator */}
          <div className="scroll-indicator">
            <div className="scroll-indicator-line" />
          </div>
        </section>

        {/* ─── BRAND STATEMENT ─── */}
        <section className="reveal-on-scroll" style={{ padding: 'calc(var(--section-gap) / 1.5) 0 calc(var(--section-gap) / 2) 0' }}>
          <div className="container brand-statement" style={{ maxWidth: '780px', textAlign: 'center' }}>
            <span className="material-symbols-outlined shimmer" style={{ fontSize: '2.5rem', color: '#fde047', opacity: 0.8, marginBottom: '1.5rem', display: 'block' }}>
              auto_awesome
            </span>
            <h2 className="font-headline-lg" style={{ marginBottom: '1.75rem', lineHeight: 1.2, letterSpacing: '0.04em' }}>
              Born from the silence of the void, crafted for the movement of light.
            </h2>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>
              <span className="soharth-font" style={{ fontWeight: 800, color: '#fff' }}>SOHARTH</span> bridges high-fashion editorial aesthetics with ergonomic luxury. Every silhouette is engineered with double-bonded spacer fibers, mirroring cosmic stillness and effortless posture.
            </p>
          </div>
        </section>

        {/* ─── NEW ARRIVALS & BENTO SHOWCASE ─── */}
        <section className="reveal-on-scroll" style={{ paddingBottom: '4rem' }}>
          <div className="container">
            {/* Header & Filter Pills */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', marginBottom: '0.75rem', display: 'block', fontSize: '11px' }}>
                ✦ THE SEASONAL EDIT
              </span>
              <h2 className="font-headline-lg" style={{ marginBottom: '1.5rem' }}>
                CURATED APPAREL DROPS
              </h2>

              {/* Category Quick Filter Bar */}
              {availableCategories.length > 2 && (
                <div className="home-category-bar">
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`home-category-btn ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                    >
                      {cat.toUpperCase()} {cat === 'all' ? `(${productsList.length})` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bento Grid — Row 1: hero (8 cols) + 2 small (4 cols each) */}
            <div className="product-grid home-bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--gutter)' }}>
              {/* Hero Card */}
              {featured[0] && (() => {
                const p0 = featured[0];
                const pricing0 = getProductPricing(p0);
                return (
                  <Link
                    href={`/products/${p0.id}`}
                    className="product-card product-card-enhanced featured-card"
                    style={{ gridColumn: 'span 8', gridRow: 'span 1', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)', borderRadius: '16px', minHeight: '560px' }}
                  >
                    <span
                      className="product-discount-badge"
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        fontSize: '11px',
                        padding: '6px 12px',
                        zIndex: 10,
                      }}
                    >
                      <span className="material-symbols-outlined badge-fire-icon">local_fire_department</span>
                      {pricing0.discountPercent}% OFF • SPECIAL OFFER
                    </span>

                    {/* Quick Add Button with Size 'OS' or 'M' */}
                    <button
                      className="quick-add-hover"
                      style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(22, 21, 21, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s' }}
                      title="Quick Add to Bag"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...p0, price: pricing0.discountedPrice }, 'M');
                        showToast(`${p0.name} (Size M) added to bag!`, 'success');
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff' }}>add_shopping_cart</span>
                    </button>

                    <div className="card-image" style={{ height: '100%', borderRadius: '16px', position: 'relative' }}>
                      <Image src={p0.image || '/logo.jpg'} alt={p0.name} fill priority style={{ objectFit: 'cover', transition: 'transform 1s ease' }} />
                    </div>

                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      padding: '3rem', opacity: 0, transition: 'opacity 0.4s ease',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                      <span className="font-label-caps" style={{ color: '#fde047', fontSize: '10px', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                        FEATURED MASTERPIECE
                      </span>
                      <h3 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '24px' }}>{p0.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span className="font-headline-md" style={{ color: 'var(--primary)', fontSize: '22px', fontWeight: 800 }}>₹{pricing0.discountedPrice.toLocaleString()}</span>
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '15px', textDecoration: 'line-through', opacity: 0.7 }}>₹{pricing0.originalPrice.toLocaleString()}</span>
                        <span className="product-discount-tag-inline">
                          SAVE ₹{(pricing0.originalPrice - pricing0.discountedPrice).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '14px', lineHeight: 1.5 }}>
                        {p0.description?.slice(0, 120)}...
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '11px' }}>EXPLORE PIECE</button>
                      </div>
                    </div>
                  </Link>
                );
              })()}

              {/* Side cards: products 2 & 3 */}
              {featured.slice(1, 3).map(p => {
                const pricing = getProductPricing(p);
                return (
                  <Link
                    href={`/products/${p.id}`}
                    key={p.id}
                    className="product-card product-card-enhanced"
                    style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', position: 'relative' }}
                  >
                    <span
                      className="product-discount-badge"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 10,
                      }}
                    >
                      <span className="material-symbols-outlined badge-fire-icon">local_fire_department</span>
                      {pricing.discountPercent}% OFF
                    </span>
                    <button
                      className="quick-add-hover"
                      style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(22, 21, 21, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: '1px solid rgba(255,255,255,0.2)', transition: 'transform 0.3s' }}
                      title="Quick Add to Bag"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...p, price: pricing.discountedPrice }, 'M');
                        showToast(`${p.name} added to bag!`, 'success');
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>add_shopping_cart</span>
                    </button>
                    <div className="card-image" style={{ flex: 1, position: 'relative', minHeight: '280px', borderRadius: '16px', overflow: 'hidden' }}>
                      <Image src={p.image || '/logo.jpg'} alt={p.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="font-label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>{p.category}</span>
                        {p.tag && <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#fde047', backgroundColor: 'rgba(253, 224, 71, 0.12)', padding: '2px 6px', borderRadius: '3px' }}>{p.tag}</span>}
                      </div>
                      <h3 className="font-headline-md" style={{ marginBottom: '0.5rem', fontSize: '16px' }}>{p.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span className="font-body-md" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '15px' }}>₹{pricing.discountedPrice.toLocaleString()}</span>
                          <span style={{ color: 'var(--on-surface-variant)', fontSize: '12px', textDecoration: 'line-through', opacity: 0.65 }}>₹{pricing.originalPrice.toLocaleString()}</span>
                          <span className="product-discount-tag-inline">
                            {pricing.discountPercent}% OFF
                          </span>
                        </div>
                        <span className="font-caption" style={{ opacity: 0.6, fontSize: '11px' }}>{p.subtitle?.split('/')[1]?.trim() || 'Express Dispatch'}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Row 2: 2 equal cards (products 4–5) */}
              {featured.slice(3, 5).map(p => {
                const pricing = getProductPricing(p);
                return (
                  <Link
                    href={`/products/${p.id}`}
                    key={p.id}
                    className="product-card product-card-enhanced"
                    style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', position: 'relative', marginTop: '2rem' }}
                  >
                    <span
                      className="product-discount-badge"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 10,
                      }}
                    >
                      <span className="material-symbols-outlined badge-fire-icon">local_fire_department</span>
                      {pricing.discountPercent}% OFF
                    </span>
                    <button
                      className="quick-add-hover"
                      style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(22, 21, 21, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: '1px solid rgba(255,255,255,0.2)', transition: 'transform 0.3s' }}
                      title="Quick Add to Bag"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...p, price: pricing.discountedPrice }, 'M');
                        showToast(`${p.name} added to bag!`, 'success');
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>add_shopping_cart</span>
                    </button>
                    <div className="card-image" style={{ position: 'relative', height: '380px', borderRadius: '16px', overflow: 'hidden' }}>
                      <Image src={p.image || '/logo.jpg'} alt={p.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="font-label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>{p.category}</span>
                        <span className="font-caption" style={{ opacity: 0.6, fontSize: '11px' }}>320 GSM Crepe</span>
                      </div>
                      <h3 className="font-headline-md" style={{ marginBottom: '0.5rem', fontSize: '17px' }}>{p.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span className="font-body-md" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '16px' }}>₹{pricing.discountedPrice.toLocaleString()}</span>
                          <span style={{ color: 'var(--on-surface-variant)', fontSize: '12px', textDecoration: 'line-through', opacity: 0.65 }}>₹{pricing.originalPrice.toLocaleString()}</span>
                          <span className="product-discount-tag-inline">
                            {pricing.discountPercent}% OFF
                          </span>
                        </div>
                        <span className="font-label-caps" style={{ opacity: 0.4 }}>{p.subtitle?.split('/')[1]?.trim()}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CUSTOM CORPORATE & BULK APPAREL ORDERS ─── */}
        <section id="custom-orders" className="craftsmanship-section reveal-on-scroll">
          <div className="container">
            <div className="craftsmanship-grid">
              {/* Left: Authentic Brand Photoshoot Frame with Corporate Tag */}
              <div style={{ position: 'relative', height: '560px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0a' }}>
                <Image
                  src="/flagship-moon-knight.jpg"
                  alt="Soharth Custom Corporate Apparel and Bulk Merch"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.4) 50%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '2.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#fde047' }}>workspace_premium</span>
                    <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.25em', fontSize: '11px' }}>
                      PRIVATE ATELIER COMMISSIONS
                    </span>
                  </div>
                  <h3 className="font-headline-md" style={{ color: '#fff', fontSize: '22px', letterSpacing: '0.04em' }}>
                    CUSTOM CORPORATE STREETWEAR
                  </h3>
                  <p className="font-caption" style={{ color: '#a1a1aa', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    OVERSIZED TEES • HOODIES • GRAPHIC DROPS • MINIMUM ORDER: 20 PCS
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: '#e4e4e7', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)' }}>
                      ✦ High-Density Puff Print
                    </span>
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: '#e4e4e7', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)' }}>
                      ✦ 240–320 GSM French Terry / Pure Cotton
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Custom Corporate Details & Inquiries */}
              <div>
                <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', display: 'block', marginBottom: '0.75rem', fontSize: '11px' }}>
                  ✦ BESPOKE BRAND COMMISSIONS
                </span>
                <h2 className="font-headline-lg" style={{ marginBottom: '1.25rem', lineHeight: 1.15, letterSpacing: '0.02em' }}>
                  CUSTOM CORPORATE & BULK STREETWEAR
                </h2>
                <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', lineHeight: 1.75 }}>
                  Outfit your team, startup, festival, or private collective in luxury-grade streetwear. We handle end-to-end design, garment manufacturing, bespoke printing, custom neck tags, and direct pan-India shipping.
                </p>

                {/* 3 Custom Execution Pillars */}
                <div className="craft-feature-card">
                  <span className="craft-number">01 / BESPOKE PRINTING & EMBROIDERY</span>
                  <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                    Custom screen printing, 3D puff print, direct-to-film (DTF), and micro-embroidery tailored to your exact brand assets and color palette.
                  </p>
                </div>

                <div className="craft-feature-card">
                  <span className="craft-number">02 / ARCHITECTURAL HEAVYWEIGHT CUTS</span>
                  <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                    240 GSM to 320 GSM 100% bio-washed pure cotton and loopknit fabrics with drop-shoulder silhouettes that resist shrinking and hold drape.
                  </p>
                </div>

                <div className="craft-feature-card">
                  <span className="craft-number">03 / RAPID MOCKUPS & TIERED PRICING</span>
                  <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                    Free 3D digital mockups within 24 hours, physical sample delivery, low minimum order quantities (MOQ 20+), and dedicated bulk volume discounts.
                  </p>
                </div>

                {/* Instant Actions */}
                <div style={{ marginTop: '2.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <a
                    href="https://wa.me/919137773967?text=Hi%20Soharth%20Team%2C%20I%20would%20like%20to%20inquire%20about%20a%20custom%20corporate%2Fbulk%20T-shirt%20order."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-flashy"
                    style={{ padding: '0.95rem 2rem' }}
                  >
                    <span className="btn-flashy-shimmer" />
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                    <span>INQUIRE ON WHATSAPP</span>
                  </a>

                  <a
                    href="mailto:concierge@soharth.com?subject=Custom%20Corporate%20Order%20Inquiry%20-%20Soharth"
                    className="btn-ghost"
                    style={{ padding: '0.95rem 2rem', fontSize: '11px', letterSpacing: '0.2em' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
                    <span>EMAIL ATELIER</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VIEW ALL CTA STRIP ─── */}
        <section className="reveal-on-scroll" style={{ padding: '4rem 0 var(--section-gap)', textAlign: 'center' }}>
          <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.4em', marginBottom: '2rem', display: 'block', opacity: 0.7 }}>
            {productsList.length > 0 ? `${productsList.length} AVANT-GARDE PIECES AVAILABLE` : 'EXPLORE THE FULL COLLECTION'}
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
