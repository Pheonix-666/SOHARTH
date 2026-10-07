'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, use, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { getProductPricing } from '@/lib/pricing';

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

  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor]);

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

  // Dynamically determine the gallery images based on the selected color
  const selectedColorObj = product.colors?.find((c: any) => c.name === selectedColor);
  const safeImages = selectedColorObj?.images && selectedColorObj.images.length > 0 && selectedColorObj.images.some((img: string) => img.trim() !== '')
    ? selectedColorObj.images.filter((img: string) => img.trim() !== '')
    : (product.images && product.images.length > 0 ? product.images : [product.image]);

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
            {(() => {
              const pricing = getProductPricing(product);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.3em' }}>
                      {product.collection || 'COLLECTION 01: SOHARTH'}
                    </span>
                    <span style={{
                      background: 'linear-gradient(135deg, rgba(235, 195, 75, 0.25) 0%, rgba(200, 150, 40, 0.15) 100%)',
                      border: '1px solid rgba(235, 195, 75, 0.55)',
                      color: '#fde047',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 10px rgba(235, 195, 75, 0.2)'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>local_fire_department</span>
                      {pricing.discountPercent}% OFF OFFER
                    </span>
                  </div>

                  <h1 className="font-headline-lg" style={{ lineHeight: 1.1, fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>{product.name}</h1>
                  <p className="font-body-lg desktop-only" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>{product.description}</p>
                  
                  {/* Luxury Price Container */}
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                      <span className="font-headline-md" style={{ color: '#fff', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        ₹{pricing.discountedPrice.toLocaleString()}
                      </span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '20px', textDecoration: 'line-through' }}>
                        ₹{pricing.originalPrice.toLocaleString()}
                      </span>
                      <span style={{
                        backgroundColor: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        color: '#34d399',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}>
                        SAVE ₹{pricing.savings.toLocaleString()}
                      </span>
                    </div>

                    {/* Delivery & Tax Perks */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fde047' }}>local_shipping</span>
                        ₹40 Delivery in Maharashtra (₹80 All-India)
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#34d399' }}>check_circle</span>
                        3% GST at Checkout
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* Color Selector */}
            {product?.colors && product.colors.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span className="font-label-caps" style={{ letterSpacing: '0.15em', fontSize: '11px' }}>
                  SELECT COLOR: <strong style={{ color: '#fff' }}>{selectedColor}</strong>
                </span>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {product.colors.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      style={{
                        width: '44px',
                        height: '44px',
                        minWidth: '44px',
                        minHeight: '44px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: selectedColor === color.name ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: selectedColor === color.name ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: selectedColor === color.name ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
                      }}
                    >
                      <span style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: color.hex || '#000',
                        display: 'block',
                      }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-label-caps" style={{ fontWeight: 700, letterSpacing: '0.15em' }}>SELECT SIZE</span>
                  <span style={{ fontSize: '11px', color: '#fde047', backgroundColor: 'rgba(253, 224, 71, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {selectedSize}
                  </span>
                </div>
                <span className="font-caption" style={{ opacity: 0.6, fontSize: '11px' }}>
                  Standard Fit
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem' }}>
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="font-label-caps size-btn"
                    style={{
                      minHeight: '52px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selectedSize === size ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedSize === size ? 'var(--on-primary)' : 'var(--primary)',
                      border: selectedSize === size ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transform: selectedSize === size ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: selectedSize === size ? '0 4px 16px rgba(255,255,255,0.25)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      touchAction: 'manipulation',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons (Desktop & Sticky Mobile) */}
            <div className="mobile-sticky-cta">
              {(() => {
                const pricing = getProductPricing(product);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', width: '100%' }}>
                    {/* Mobile Price & Size summary on the sticky bar */}
                    <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', minWidth: '90px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                          ₹{pricing.discountedPrice.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>
                          ₹{pricing.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#fde047', fontWeight: 700, letterSpacing: '0.05em' }}>
                        SIZE: {selectedSize} • {pricing.discountPercent}% OFF
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const colorImage = selectedColorObj?.images?.[0] || product.image;
                        addToCart({
                          id: product.id,
                          name: product.name,
                          subtitle: product.subtitle,
                          price: pricing.discountedPrice,
                          image: colorImage,
                        }, selectedSize, selectedColor || undefined);
                        setIsAdded(true);
                        setTimeout(() => setIsAdded(false), 2000);
                      }}
                      className="btn-primary add-to-bag-btn"
                      style={{
                        flex: 1,
                        minHeight: '52px',
                        padding: '0.85rem 1.5rem',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.15em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        backgroundColor: isAdded ? '#10b981' : 'var(--primary)',
                        color: isAdded ? '#fff' : 'var(--on-primary)',
                        borderRadius: '10px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                        transition: 'background-color 0.3s ease, transform 0.15s ease',
                      }}
                    >
                      {isAdded ? 'ADDED TO BAG' : 'ADD TO BAG'}
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {isAdded ? 'check_circle' : 'shopping_bag'}
                      </span>
                    </button>
                  </div>
                );
              })()}
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
              {related.map(p => {
                const pricing = getProductPricing(p);
                return (
                  <Link href={`/products/${p.id}`} key={p.id} className="product-card scrolling-product-card" style={{ position: 'relative' }}>
                    <div className="card-image" style={{ aspectRatio: '3/4', position: 'relative', marginBottom: '1.5rem', backgroundColor: 'var(--surface-container)' }}>
                      <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        backgroundColor: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.45)',
                        color: '#f3d978', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px'
                      }}>
                        {pricing.discountPercent}% OFF
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <h5 className="font-label-caps" style={{ marginBottom: '0.25rem', transition: 'color 0.3s' }}>{p.name}</h5>
                        <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>{p.subtitle}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span className="font-body-md" style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{pricing.discountedPrice.toLocaleString()}</span>
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '11px', textDecoration: 'line-through', opacity: 0.6 }}>₹{pricing.originalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
                {sameCategory.map(p => {
                  const pricing = getProductPricing(p);
                  return (
                    <Link href={`/products/${p.id}`} key={p.id} className="product-card scrolling-product-card" style={{ position: 'relative' }}>
                      <div className="card-image" style={{ aspectRatio: '3/4', position: 'relative', marginBottom: '1.5rem', backgroundColor: 'var(--surface-container)' }}>
                        <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                        <span style={{
                          position: 'absolute', top: '10px', right: '10px',
                          backgroundColor: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.45)',
                          color: '#f3d978', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px'
                        }}>
                          {pricing.discountPercent}% OFF
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <h5 className="font-label-caps" style={{ marginBottom: '0.25rem', transition: 'color 0.3s' }}>{p.name}</h5>
                          <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>{p.subtitle}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                          <span className="font-body-md" style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{pricing.discountedPrice.toLocaleString()}</span>
                          <span style={{ color: 'var(--on-surface-variant)', fontSize: '11px', textDecoration: 'line-through', opacity: 0.6 }}>₹{pricing.originalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
