'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getProductPricing } from '@/lib/pricing';
import { products as initialProducts } from '@/lib/data';

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
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
    >
      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem', maxWidth: '520px', width: '100%', position: 'relative', margin: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
          <span className="material-symbols-outlined">close</span>
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#4caf50', fontVariationSettings: "'FILL' 1", display: 'block', marginBottom: '1rem' }}>check_circle</span>
            <h3 className="font-headline-md" style={{ marginBottom: '0.75rem' }}>Thank You!</h3>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Your review has been submitted and will appear after verification.</p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: '2rem' }}>Close</button>
          </div>
        ) : (
          <>
            <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.3em', display: 'block', marginBottom: '0.75rem', fontSize: '11px' }}>Share Your Experience</span>
            <h3 className="font-headline-md" style={{ marginBottom: '1.5rem', fontSize: '22px' }}>Write a Customer Review</h3>

            {/* Photo Upload */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  border: '2px dashed rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                  background: photoPreview ? 'transparent' : 'rgba(255,255,255,0.03)',
                }}
              >
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '24px' }}>add_a_photo</span>
                }
              </div>
              <div>
                <p className="font-label-caps" style={{ marginBottom: '0.35rem', opacity: 0.6, letterSpacing: '0.15em', fontSize: '10px' }}>Fit Photo (optional)</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.35rem 0.85rem', color: '#fff', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {photoPreview ? 'Change Photo' : 'Upload Fit Photo'}
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            {/* Star Picker */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="font-label-caps" style={{ marginBottom: '0.5rem', opacity: 0.6, letterSpacing: '0.15em', fontSize: '10px' }}>Rating *</p>
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
                        fontSize: '1.8rem',
                        color: (hover || rating) >= s ? '#d4af37' : 'rgba(255,255,255,0.2)',
                        fontVariationSettings: (hover || rating) >= s ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >star</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Fields */}
            {([
              { label: 'Your Name *', value: name, setter: setName, placeholder: 'e.g. Aryan S.' },
              { label: 'City', value: city, setter: setCity, placeholder: 'e.g. Mumbai, Delhi, Bengaluru' },
            ] as { label: string; value: string; setter: (v: string) => void; placeholder: string }[]).map(f => (
              <div key={f.label} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
                <label className="font-label-caps" style={{ display: 'block', marginBottom: '0.25rem', opacity: 0.5, letterSpacing: '0.15em', fontSize: '10px' }}>{f.label}</label>
                <input
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', fontWeight: 500 }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
              <label className="font-label-caps" style={{ display: 'block', marginBottom: '0.25rem', opacity: 0.5, letterSpacing: '0.15em', fontSize: '10px' }}>Your Review *</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="How does the fabric, heavyweight drape, and sizing feel?"
                rows={3}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', fontWeight: 500, resize: 'none', lineHeight: 1.5 }}
              />
            </div>

            {status === 'error' && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '1rem' }}>Something went wrong. Please try again.</p>}

            <button
              onClick={submit}
              disabled={status === 'loading' || !name || !text || rating === 0}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', opacity: (!name || !text || rating === 0) ? 0.5 : 1 }}
            >
              {status === 'loading' ? (uploadingPhoto ? 'Uploading photo...' : 'Submitting...') : 'Submit Verified Review'}
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
    subtitle: '240 GSM Bio-Washed Combed Cotton',
    image: '/flagship-king-tee.jpg',
    price: '₹349',
    originalPrice: '₹599',
    position: 'center 62%'
  },
  {
    id: 'moon-knight',
    name: 'MOON KNIGHT',
    tagline: 'DROP-SHOULDER TEE',
    subtitle: 'Heavyweight Pure Black Noir',
    image: '/flagship-moon-knight.jpg',
    price: '₹349',
    originalPrice: '₹599',
    position: 'center 60%'
  },
  {
    id: 'matrix',
    name: 'THE MATRIX',
    tagline: 'CYBER GRAPHIC TEE',
    subtitle: 'Cybernetic High-Definition Print',
    image: '/flagship-matrix.jpg',
    price: '₹349',
    originalPrice: '₹599',
    position: 'center 58%'
  },
  {
    id: 'babayaga',
    name: 'BABA YAGA',
    tagline: 'DARK ASSASSIN TEE',
    subtitle: 'Minimalist Signature Artwork',
    image: '/flagship-babayaga.jpg',
    price: '₹349',
    originalPrice: '₹599',
    position: 'center 60%'
  },
];

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productsList, setProductsList] = useState<any[]>(initialProducts);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHeroShirt, setSelectedHeroShirt] = useState(BRAND_HERO_SHIRTS[0]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vipEmail, setVipEmail] = useState('');
  const [vipSuccess, setVipSuccess] = useState(false);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsList(data);
        }
      })
      .catch(err => {
        console.error('Failed to load products dynamically:', err);
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

  // Clean category definitions for filter pills
  const availableCategories = [
    { key: 'all', label: 'ALL T-SHIRTS' },
    { key: 'heroic', label: 'OVERSIZED TEES' },
    { key: 'ethnic', label: 'ETHNIC TEES' },
    { key: 'quotes', label: 'GRAPHIC TEES' },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? productsList
    : productsList.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  const featured = filteredProducts.slice(0, 5);

  const handleVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipEmail.trim()) return;
    setVipSuccess(true);
    showToast('Code SOHARTH10 applied! Check your email for welcome perks.', 'success');
  };

  // Modern Skeleton Loader instead of slow poetic line
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '6rem', minHeight: '85vh', backgroundColor: '#080808' }}>
          <div className="container" style={{ maxWidth: '1080px', padding: '2.5rem 1rem' }}>
            <div className="skeleton-shimmer" style={{ height: '420px', borderRadius: '24px', marginBottom: '2.5rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-shimmer" style={{ height: '360px', borderRadius: '16px' }} />
              ))}
            </div>
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
              quality={80}
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: selectedHeroShirt.position }}
            />
          </div>

          {/* Atmospheric Starry & Vignette Overlays */}
          <div className="hero-stars-overlay" />
          <div className="hero-vignette-overlay" />
          <div className="hero-top-fade" />
          <div className="hero-bottom-fade" />

          {/* Hero Content — Instant Selling Clarity (Know within 3 seconds) */}
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
            {/* Clear Product Category Eyebrow */}
            <div className="fade-in-up" style={{ animationDelay: '0.05s', marginBottom: '1rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(253, 224, 71, 0.12)',
                  border: '1px solid rgba(253, 224, 71, 0.35)',
                  padding: '6px 16px',
                  borderRadius: '30px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#fde047',
                  textTransform: 'uppercase',
                }}
              >
                <span>✦ 240+ GSM HEAVYWEIGHT COTTON · OVERSIZED TEES</span>
              </span>
            </div>

            {/* Title with Metallic Stardust Shimmer */}
            <h1 className="hero-title-metallic fade-in-up" style={{ animationDelay: '0.15s' }}>
              SOHARTH
            </h1>

            {/* Selling Subhead — Immediate Clarity */}
            <h2
              className="fade-in-up"
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: '0 auto 0.75rem',
                maxWidth: '820px',
                animationDelay: '0.25s',
              }}
            >
              PREMIUM OVERSIZED & CULTURAL STREETWEAR TEES
            </h2>

            <p
              className="fade-in-up"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 'clamp(13px, 1.8vw, 15px)',
                lineHeight: 1.6,
                maxWidth: '660px',
                margin: '0 auto 2.25rem',
                animationDelay: '0.35s',
              }}
            >
              Engineered with 100% bio-washed 240+ GSM combed cotton with relaxed drop-shoulder silhouettes. Built for effortless drape. Starting at <strong>₹349</strong> with Pan-India COD.
            </p>

            {/* Primary Selling CTAs */}
            <div
              className="fade-in-up"
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                animationDelay: '0.45s',
              }}
            >
              <Link href="/products?category=heroic" className="btn-flashy">
                <span className="btn-flashy-shimmer" />
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#000' }}>checkroom</span>
                <span>SHOP OVERSIZED TEES</span>
                <span className="material-symbols-outlined btn-flashy-icon">arrow_forward</span>
              </Link>

              <Link
                href="/products"
                className="btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '1.05rem 2.25rem',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#ffffff',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#fde047' }}>grid_view</span>
                <span>EXPLORE ALL T-SHIRTS</span>
              </Link>
            </div>

            {/* Instant 3-Pillar Confidence Strip Under Hero CTA */}
            <div
              className="fade-in-up"
              style={{
                display: 'flex',
                gap: '1.25rem',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginTop: '1.75rem',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: 500,
                animationDelay: '0.6s',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fde047' }}>local_shipping</span>
                Free Shipping Above ₹999
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4ade80' }}>payments</span>
                Cash on Delivery (COD)
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#60a5fa' }}>sync_alt</span>
                7-Day Easy Size Exchange
              </span>
            </div>

            {/* Featured T-shirt Micro-Badge with Real Price Tag */}
            <div
              className="fade-in-up"
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: '2.5rem',
                animationDelay: '0.75s',
              }}
            >
              <Link
                href="/products?category=heroic"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#fff',
                  background: 'rgba(253, 224, 71, 0.1)',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: '1px solid rgba(253, 224, 71, 0.35)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fde047' }}>checkroom</span>
                <span>Featured Piece: <strong>{selectedHeroShirt.name} {selectedHeroShirt.tagline}</strong> • <strong style={{ color: '#fde047' }}>{selectedHeroShirt.price}</strong> <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>{selectedHeroShirt.originalPrice}</span></span>
              </Link>
            </div>

            {/* Actual Brand T-shirt Live Selector Switcher */}
            <div className="fade-in-up" style={{ animationDelay: '0.9s', marginTop: '1.25rem' }}>
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

        {/* ─── 4-PILLAR TRUST & PURCHASE CONFIDENCE STRIP ─── */}
        <section style={{ backgroundColor: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.75rem 1rem' }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#fde047' }}>local_shipping</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.04em' }}>FREE EXPRESS SHIPPING</h4>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>Pan-India delivery in 3–5 days</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#4ade80' }}>payments</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.04em' }}>CASH ON DELIVERY (COD)</h4>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>Pay at door via cash or UPI</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#60a5fa' }}>sync_alt</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.04em' }}>7-DAY EASY EXCHANGES</h4>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>Hassle-free doorstep pickup</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#fde047' }}>verified</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.04em' }}>240+ GSM COMBED COTTON</h4>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>Bio-washed & pre-shrunk fabric</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BRAND & FABRIC STATEMENT ─── */}
        <section className="reveal-on-scroll" style={{ padding: 'calc(var(--section-gap) / 1.5) 0 calc(var(--section-gap) / 2) 0' }}>
          <div className="container brand-statement" style={{ maxWidth: '800px', textAlign: 'center' }}>
            <span className="material-symbols-outlined shimmer" style={{ fontSize: '2.5rem', color: '#fde047', opacity: 0.8, marginBottom: '1.25rem', display: 'block' }}>
              auto_awesome
            </span>
            <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', fontSize: '11px', display: 'block', marginBottom: '0.75rem' }}>
              ✦ ARCHITECTURAL STREETWEAR
            </span>
            <h2 className="font-headline-lg" style={{ marginBottom: '1.5rem', lineHeight: 1.25, letterSpacing: '0.02em', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Born from the silence of the void, crafted for the movement of light.
            </h2>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.75, fontSize: '15px' }}>
              <span className="soharth-font" style={{ fontWeight: 800, color: '#fff' }}>SOHARTH</span> bridges high-fashion editorial aesthetics with ergonomic luxury t-shirts. Every piece is constructed from 240+ GSM pure combed cotton, delivering an effortless drop-shoulder silhouette that holds its shape wash after wash.
            </p>
          </div>
        </section>

        {/* ─── BESTSELLER T-SHIRTS & CURATED APPAREL DROPS ─── */}
        <section className="reveal-on-scroll" style={{ paddingBottom: '4rem' }}>
          <div className="container">
            {/* Header & Filter Pills (Plain E-Commerce Categories) */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', marginBottom: '0.75rem', display: 'block', fontSize: '11px' }}>
                ✦ THE SIGNATURE ATELIER
              </span>
              <h2 className="font-headline-lg" style={{ marginBottom: '1.5rem', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
                BESTSELLER T-SHIRTS & STREETWEAR DROPS
              </h2>

              {/* Category Quick Filter Bar */}
              <div className="home-category-bar">
                {availableCategories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`home-category-btn ${selectedCategory.toLowerCase() === cat.key.toLowerCase() ? 'active' : ''}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bento Grid — Row 1: hero (8 cols) + 2 side cards (4 cols each) */}
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
                      {pricing0.discountPercent}% OFF • BESTSELLER
                    </span>

                    {/* Quick Add Button */}
                    <button
                      className="quick-add-hover"
                      style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(22, 21, 21, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s' }}
                      title="Quick Add (Size M)"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...p0, price: pricing0.discountedPrice }, 'M');
                        showToast(`${p0.name} (Size M) added to bag!`, 'success');
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff' }}>add_shopping_cart</span>
                    </button>

                    <div className="card-image" style={{ height: '100%', borderRadius: '16px', position: 'relative' }}>
                      <Image src={p0.image || '/logo.jpg'} alt={p0.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', transition: 'transform 1s ease' }} />
                    </div>

                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      padding: '3rem', opacity: 1,
                    }}>
                      <span className="font-label-caps" style={{ color: '#fde047', fontSize: '10px', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                        FEATURED OVERSIZED PIECE
                      </span>
                      <h3 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '24px' }}>{p0.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span className="font-headline-md" style={{ color: '#fff', fontSize: '22px', fontWeight: 800 }}>₹{pricing0.discountedPrice.toLocaleString()}</span>
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '15px', textDecoration: 'line-through', opacity: 0.7 }}>₹{pricing0.originalPrice.toLocaleString()}</span>
                        <span className="product-discount-tag-inline">
                          SAVE ₹{(pricing0.originalPrice - pricing0.discountedPrice).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '14px', lineHeight: 1.5 }}>
                        {p0.description?.slice(0, 120)}...
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '11px' }}>EXPLORE PIECE →</span>
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
                      style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(22, 21, 21, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: '1px solid rgba(255,255,255,0.2)', transition: 'transform 0.3s' }}
                      title="Quick Add (Size M)"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...p, price: pricing.discountedPrice }, 'M');
                        showToast(`${p.name} (Size M) added to bag!`, 'success');
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>add_shopping_cart</span>
                    </button>
                    <div className="card-image" style={{ flex: 1, position: 'relative', minHeight: '280px', borderRadius: '16px', overflow: 'hidden' }}>
                      <Image src={p.image || '/logo.jpg'} alt={p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
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
                        <span className="font-caption" style={{ opacity: 0.6, fontSize: '11px' }}>240 GSM Cotton</span>
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
                      style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(22, 21, 21, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, border: '1px solid rgba(255,255,255,0.2)', transition: 'transform 0.3s' }}
                      title="Quick Add (Size M)"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...p, price: pricing.discountedPrice }, 'M');
                        showToast(`${p.name} (Size M) added to bag!`, 'success');
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>add_shopping_cart</span>
                    </button>
                    <div className="card-image" style={{ position: 'relative', height: '380px', borderRadius: '16px', overflow: 'hidden' }}>
                      <Image src={p.image || '/logo.jpg'} alt={p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="font-label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>{p.category}</span>
                        <span className="font-caption" style={{ opacity: 0.6, fontSize: '11px' }}>Heavyweight Drop-Shoulder</span>
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
                        <span className="font-label-caps" style={{ opacity: 0.4 }}>Pure Bio-Wash</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ─── VIEW ALL CTA STRIP ─── */}
            <div style={{ textAlign: 'center', marginTop: '4.5rem', marginBottom: '1rem' }}>
              <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.3em', marginBottom: '1.25rem', display: 'block', fontSize: '11px', opacity: 0.85 }}>
                ✦ {productsList.length > 0 ? `${productsList.length} STREETWEAR PIECES AVAILABLE` : 'EXPLORE THE FULL COLLECTION'} ✦
              </span>
              <Link
                href="/products"
                className="btn-flashy"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  padding: '1.25rem 3.5rem',
                  fontSize: '13px',
                  fontWeight: 900,
                  letterSpacing: '0.24em',
                  borderRadius: '999px',
                  boxShadow: '0 0 40px rgba(253, 224, 71, 0.35), 0 12px 32px rgba(0, 0, 0, 0.7)',
                }}
              >
                <span className="btn-flashy-shimmer" />
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#000', fontVariationSettings: "'FILL' 1" }}>grid_view</span>
                <span style={{ color: '#000', fontWeight: 900 }}>VIEW ALL T-SHIRTS</span>
                <span className="material-symbols-outlined btn-flashy-icon" style={{ fontSize: '20px', color: '#000', fontWeight: 900 }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── CUSTOM CORPORATE & BULK APPAREL ORDERS ─── */}
        <section id="custom-orders" className="craftsmanship-section reveal-on-scroll">
          <div className="container">
            <div className="craftsmanship-grid">
              <div style={{ position: 'relative', height: '540px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0a' }}>
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
                    OVERSIZED TEES • HOODIES • GRAPHIC DROPS • MOQ: 20 PCS
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

                <div className="craft-feature-card">
                  <span className="craft-number">01 / BESPOKE PRINTING & EMBROIDERY</span>
                  <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                    Custom screen printing, 3D puff print, direct-to-film (DTF), and micro-embroidery tailored to your exact brand assets.
                  </p>
                </div>

                <div className="craft-feature-card">
                  <span className="craft-number">02 / ARCHITECTURAL HEAVYWEIGHT CUTS</span>
                  <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                    240 GSM to 320 GSM 100% bio-washed pure cotton and loopknit fabrics with drop-shoulder silhouettes that resist shrinking.
                  </p>
                </div>

                <div className="craft-feature-card">
                  <span className="craft-number">03 / RAPID MOCKUPS & TIERED PRICING</span>
                  <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                    Free 3D digital mockups within 24 hours, physical sample delivery, low minimum order quantities (MOQ 20+), and bulk volume discounts.
                  </p>
                </div>

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

        {/* ─── SOCIAL PROOF COUNTER STRIP ─── */}
        <section className="counter-strip reveal-on-scroll">
          <div className="container">
            <div className="counter-grid">
              {[
                { icon: '🌍', end: 2400, suffix: '+', label: 'Satisfied Customers' },
                { icon: '👕', end: 180, suffix: '+', label: 'T-Shirt Designs' },
                { icon: '⭐', end: 4.9, suffix: '', label: 'Average Rating', decimal: true },
                { icon: '🚀', end: 48, suffix: 'h', label: 'Fast Dispatch' },
              ].map((stat, i) => (
                <CounterItem key={i} {...stat} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── REVIEWS SECTION (Community Social Proof) ─── */}
        {(() => {
          const TESTIMONIALS = [
            { quote: '"Absolutely obsessed with my oversized King tee. The 240 GSM fabric feels dense and luxury grade — worth every single rupee."', author: 'Riya M., Delhi' },
            { quote: '"Finally a homegrown brand that nails the boxy streetwear drop-shoulder fit right. Neck ribbing doesn\'t sag after washing."', author: 'Aryan S., Mumbai' },
            { quote: '"Ordered twice already. COD was smooth, packaging felt celestial, quality is genuinely 10/10."', author: 'Priya K., Bengaluru' },
            { quote: '"The ethnic fusion graphics look even better in real life. Pure combed cotton feels super soft on the skin."', author: 'Kabir V., Hyderabad' },
          ];

          const combinedReviews = [
            ...TESTIMONIALS.map((t, i) => ({
              id: `static-${i}`,
              name: t.author.split(',')[0].trim(),
              city: t.author.split(',')[1]?.trim() || '',
              rating: 5,
              text: t.quote.replace(/(^"|"$)/g, ''),
              created_at: new Date(Date.now() - i * 86400000 * 12).toISOString(),
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
                      <span className="overall-rating-score">{combinedReviews.length > 0 ? (combinedReviews.reduce((a: number, r: {rating: number}) => a + r.rating, 0) / combinedReviews.length).toFixed(1) : '4.9'}</span>
                      <div className="overall-rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px', color: '#fde047' }}>star</span>
                        ))}
                      </div>
                      <span className="overall-rating-count">{combinedReviews.length} verified reviews</span>
                    </div>
                    <h2 className="font-headline-lg" style={{ marginBottom: '0.5rem' }}>VERIFIED CUSTOMER REVIEWS</h2>
                    <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', opacity: 0.75 }}>Real feedback from streetwear enthusiasts across India.</p>
                  </div>

                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rate_review</span>
                    Write a Review
                  </button>
                </div>

                {/* Review cards */}
                <div className="reviews-grid-live">
                  {combinedReviews.map((r: {id: string; name: string; city: string; rating: number; text: string; image_url?: string; created_at: string}) => (
                    <div key={r.id} className="review-card">
                      <div className="review-card-stars">
                        {[...Array(r.rating)].map((_, s) => (
                          <span key={s} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '15px', color: '#fde047' }}>star</span>
                        ))}
                      </div>
                      <p className="review-card-text">{r.text}</p>
                      {r.image_url && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', marginTop: '0.5rem' }}>
                          <img src={r.image_url} alt="Review fit photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                          <div className="review-meta">{r.city}{r.city ? ' · ' : ''}Verified Buyer</div>
                        </div>
                        <div className="review-verified">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                          Verified Purchase
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* ─── INSTAGRAM COMMUNITY & UGC GALLERY ─── */}
        <section className="reveal-on-scroll" style={{ padding: '4rem 0', backgroundColor: '#0c0c0c', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <div>
                <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', fontSize: '11px', display: 'block', marginBottom: '0.5rem' }}>
                  ✦ THE COMMUNITY GALLERY
                </span>
                <h2 className="font-headline-lg" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', margin: 0 }}>
                  TAG @SOHARTH.IN TO BE FEATURED
                </h2>
              </div>
              <a
                href="https://www.instagram.com/soharth.in/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '8px 18px',
                  borderRadius: '24px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>Follow on Instagram</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { img: '/flagship-king-tee.jpg', handle: '@riya.urban', label: 'The King Oversized Tee' },
                { img: '/flagship-moon-knight.jpg', handle: '@kabir_fits', label: 'Moon Knight Drop-Shoulder' },
                { img: '/flagship-matrix.jpg', handle: '@zayan_glitch', label: 'The Matrix Graphic Tee' },
                { img: '/flagship-babayaga.jpg', handle: '@priya.minimal', label: 'Baba Yaga Black Tee' },
              ].map((ugc, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    height: '300px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: '#161616',
                  }}
                >
                  <Image src={ugc.img} alt={ugc.label} fill style={{ objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1.25rem',
                  }}>
                    <span style={{ fontSize: '11px', color: '#fde047', fontWeight: 700 }}>{ugc.handle}</span>
                    <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 500 }}>{ugc.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── VIP CLUB / 10% OFF OFFER NEWSLETTER ─── */}
        <section className="reveal-on-scroll" style={{ padding: '5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="container" style={{ maxWidth: '820px', textAlign: 'center' }}>
            <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', fontSize: '11px', display: 'block', marginBottom: '0.75rem' }}>
              ✦ EXCLUSIVE ATELIER ACCESS
            </span>
            <h2 className="font-headline-lg" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '1rem' }}>
              GET 10% OFF YOUR FIRST ORDER
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              Join the SOHARTH Inner Circle. Receive secret seasonal drops, restock alerts, and an instant discount code on WhatsApp & Email.
            </p>

            {vipSuccess ? (
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: '16px',
                maxWidth: '460px',
                margin: '0 auto'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#4ade80', marginBottom: '0.5rem', display: 'block' }}>check_circle</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px' }}>Welcome to SOHARTH</h4>
                <p style={{ color: '#4ade80', fontSize: '13px', margin: 0, fontWeight: 600 }}>
                  Use coupon code: <strong style={{ color: '#fff', fontSize: '15px', letterSpacing: '0.1em' }}>SOHARTH10</strong> at checkout!
                </p>
              </div>
            ) : (
              <form onSubmit={handleVipSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '480px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                <input
                  type="email"
                  value={vipEmail}
                  onChange={(e) => setVipEmail(e.target.value)}
                  placeholder="Enter your email or phone..."
                  required
                  style={{
                    flex: '1 1 260px',
                    padding: '0.9rem 1.25rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '30px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.9rem 2rem', fontSize: '11px', flexShrink: 0 }}
                >
                  CLAIM 10% OFF
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Review Modal */}
        {reviewModalOpen && <ReviewModal onClose={() => setReviewModalOpen(false)} />}

      </main>
      <Footer />
    </>
  );
}
