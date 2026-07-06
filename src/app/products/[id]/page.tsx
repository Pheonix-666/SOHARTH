'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, use, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
        console.error('Failed to load dynamic details:', err);
        setIsLoading(false);
      });
  }, [id]);

  const product = productsList.find(p => p.id === id);
  const related = productsList.filter(p => p.id !== id).slice(0, 3);
  const sameCategory = product ? productsList.filter(p => p.category === product.category && p.id !== id) : [];

  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product, selectedColor]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="product-main" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>Receiving Coordinates...</div>
        </main>
        <Footer />
      </>
    );
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="container" style={{ paddingTop: '12rem', textAlign: 'center', minHeight: '60vh' }}>
          <h1 className="font-headline-lg" style={{ marginBottom: '1.5rem' }}>Product Not Found</h1>
          <Link href="/products" className="btn-primary">Return to Shop</Link>
        </main>
        <Footer />
      </>
    );
  }

  const safeImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <>
      <Navbar />
      <main className="product-main">

        {/* ─── BREADCRUMB ─── */}
        <div className="container" style={{ marginBottom: '0.5rem' }}>
          <Link href="/products" className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.3s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to Collections
          </Link>
        </div>

        {/* ─── PRODUCT SECTION ─── */}
        <section className="container product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--gutter)', paddingBottom: '3rem', alignItems: 'start' }}>

          {/* Gallery */}
          <div className="product-gallery">
            <div className="product-gallery-main">
              <Image
                src={safeImages[activeImage] || safeImages[0] || product.image}
                alt={product.name}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform 1s ease' }}
                priority
              />
            </div>
            <div className="product-gallery-thumbnails hide-scrollbar" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              {safeImages.slice(0, 4).map((img: string, i: number) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`product-gallery-thumb ${activeImage === i ? 'active' : ''}`}
                  style={{
                    position: 'relative', width: '80px', height: '100px', cursor: 'pointer',
                    borderRadius: '6px', overflow: 'hidden',
                    border: activeImage === i ? '2px solid var(--primary)' : '2px solid transparent',
                    opacity: activeImage === i ? 1 : 0.6, transition: 'all 0.3s ease'
                  }}
                >
                  <Image src={img} alt={product.name} fill style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info — Sticky */}
          <div className="product-info-sticky" style={{ position: 'sticky', top: '140px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* Title Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.3em' }}>
                {product.collection}
              </span>
              <h1 className="font-headline-lg" style={{ lineHeight: 1.1 }}>{product.name}</h1>
              <p className="font-body-lg desktop-only" style={{ color: 'var(--on-surface-variant)' }}>{product.description}</p>
              <div className="font-headline-md" style={{ paddingTop: '0.5rem' }}>
                ₹{product.price.toLocaleString()}
              </div>
            </div>
            {/* Color Selector */}
            {product?.colors && product.colors.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span className="font-label-caps">SELECT COLOR</span>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {product.colors.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: color.hex || '#000',
                        border: selectedColor === color.name ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                        padding: '2px', backgroundClip: 'content-box',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer',
                        transform: selectedColor === color.name ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span className="font-label-caps">SELECT SIZE</span>
                <a href="#" className="font-caption" style={{ textDecoration: 'underline', textUnderlineOffset: '4px', opacity: 0.6, transition: 'opacity 0.3s' }}>
                  Size Guide
                </a>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="font-label-caps size-btn"
                    style={{
                      padding: '1rem 0',
                      backgroundColor: selectedSize === size ? 'var(--primary)' : 'transparent',
                      color: selectedSize === size ? 'var(--on-primary)' : 'var(--primary)',
                      border: selectedSize === size ? '1px solid var(--primary)' : '1px solid rgba(201,198,194,0.2)',
                      borderRadius: '8px',
                      transform: selectedSize === size ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: selectedSize === size ? '0 4px 12px rgba(255,255,255,0.1)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mobile-sticky-cta">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      subtitle: product.subtitle,
                      price: product.price,
                      image: product.image,
                    }, selectedSize, selectedColor || undefined);
                    setIsAdded(true);
                    setTimeout(() => setIsAdded(false), 2000);
                  }}
                  className="btn-primary add-to-bag-btn"
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    fontSize: '12px',
                    letterSpacing: '0.2em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    backgroundColor: isAdded ? 'var(--on-surface-variant)' : 'var(--primary)',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {isAdded ? 'ADDED TO BAG' : 'ADD TO BAG'}
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {isAdded ? 'check_circle' : 'shopping_bag'}
                  </span>
                </button>
                <button
                  className="btn-ghost desktop-only"
                  style={{ width: '100%', padding: '1.5rem', fontSize: '12px', letterSpacing: '0.2em' }}
                >
                  Add to Wishlist
                </button>
              </div>
            </div>

            {/* Mobile Description */}
            <p className="font-body-lg mobile-only" style={{ color: 'var(--on-surface-variant)' }}>{product.description}</p>

            {/* Accordion Details */}
            <div style={{ borderTop: '1px solid rgba(71,71,65,0.3)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { key: 'materials', label: 'MATERIALS & CARE', content: product.material },
                { key: 'shipping', label: 'SHIPPING & RETURNS', content: product.shipping },
              ].map(({ key, label, content }) => (
                <div key={key} style={{ borderBottom: '1px solid rgba(71,71,65,0.3)' }}>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === key ? null : key)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1rem 0', color: 'var(--primary)',
                    }}
                  >
                    <span className="font-label-caps">{label}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', transition: 'transform 0.3s', transform: openAccordion === key ? 'rotate(180deg)' : 'rotate(0)' }}>
                      expand_more
                    </span>
                  </button>
                  {openAccordion === key && (
                    <p className="font-caption" style={{ color: 'var(--on-surface-variant)', paddingBottom: '1.5rem', lineHeight: 1.8 }}>
                      {content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DESIGN RATIONALE ─── */}
        <section style={{ backgroundColor: 'var(--surface-dim)', padding: 'var(--section-gap) 0', marginTop: 'var(--section-gap)', position: 'relative', overflow: 'hidden' }}>
          <div className="container">
            <div className="design-rationale-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gutter)', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div>
                  <h2 className="font-headline-lg" style={{ marginBottom: '1.5rem' }}>DESIGN RATIONALE</h2>
                  <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8 }}>
                    {product.description}
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gutter)' }}>
                  <div>
                    <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>01 SILHOUETTE</h4>
                    <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>Sharp architectural lines inspired by the jagged horizon of lunar craters.</p>
                  </div>
                  <div>
                    <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>02 FABRICATION</h4>
                    <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>{product.material?.split('.')[0] ?? ''}.</p>
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }} className="glass-panel">
                <Image
                  src={safeImages[1] || safeImages[0] || product.image}
                  alt={`${product.name} detail`}
                  fill
                  style={{ objectFit: 'cover', filter: 'grayscale(60%)', opacity: 0.7, transition: 'all 1s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'grayscale(0%)'; (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'grayscale(60%)'; (e.currentTarget as HTMLElement).style.opacity = '0.7'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── RECOMMENDED ─── */}
        <section style={{ padding: 'var(--section-gap) 0', overflow: 'hidden' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
              <div>
                <span className="font-label-caps" style={{ opacity: 0.5, display: 'block', marginBottom: '0.5rem' }}>THE UNIVERSE EXPANDS</span>
                <h3 className="font-headline-md" style={{ letterSpacing: '0.3em' }}>RECOMMENDED FOR YOU</h3>
              </div>
              <Link href="/products" className="btn-primary" style={{ padding: '0.75rem 1.5rem', letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0 }}>View All</Link>
            </div>
            <div style={{ display: 'flex', gap: 'var(--gutter)', overflowX: 'auto', paddingBottom: '1rem' }} className="hide-scrollbar">
              {related.map(p => (
                <Link href={`/products/${p.id}`} key={p.id} className="product-card scrolling-product-card">
                  <div className="card-image" style={{ aspectRatio: '3/4', position: 'relative', marginBottom: '1.5rem', backgroundColor: 'var(--surface-container)' }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h5 className="font-label-caps" style={{ marginBottom: '0.25rem', transition: 'color 0.3s' }}>{p.name}</h5>
                      <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>{p.subtitle}</p>
                    </div>
                    <span className="font-body-md">₹{p.price.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SAME CATEGORY ─── */}
        {sameCategory.length > 0 && (
          <section style={{ padding: '0 0 var(--section-gap) 0', overflow: 'hidden' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                  <span className="font-label-caps" style={{ opacity: 0.5, display: 'block', marginBottom: '0.5rem' }}>SIMILAR VIBES</span>
                  <h3 className="font-headline-md" style={{ letterSpacing: '0.3em' }}>MORE IN {product.category.toUpperCase()}</h3>
                </div>
                <Link href={`/products?category=${product.category}`} className="btn-primary" style={{ padding: '0.75rem 1.5rem', letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0 }}>View All</Link>
              </div>
              <div style={{ display: 'flex', gap: 'var(--gutter)', overflowX: 'auto', paddingBottom: '1rem' }} className="hide-scrollbar">
                {sameCategory.map(p => (
                  <Link href={`/products/${p.id}`} key={p.id} className="product-card scrolling-product-card">
                    <div className="card-image" style={{ aspectRatio: '3/4', position: 'relative', marginBottom: '1.5rem', backgroundColor: 'var(--surface-container)' }}>
                      <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h5 className="font-label-caps" style={{ marginBottom: '0.25rem', transition: 'color 0.3s' }}>{p.name}</h5>
                        <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>{p.subtitle}</p>
                      </div>
                      <span className="font-body-md">₹{p.price.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
