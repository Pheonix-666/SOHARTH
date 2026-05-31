'use client';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { use, useState, useEffect } from 'react';

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = use(searchParams);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProductsList(productsData);
        setCategories(categoriesData);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filters = [
    { label: 'All', value: undefined },
    ...categories,
    { label: 'New', value: 'new' },
  ];

  const displayProducts = category
    ? productsList.filter(p => p.category === category || (category === 'new' && p.tag === 'NEW'))
    : productsList;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main style={{
          paddingTop: '5rem', minHeight: '100svh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.35em', opacity: 0.4 }}>
            Syncing Collections…
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '4rem' }}>

        {/* ─── COLLECTION HEADER ─── */}
        <header className="container" style={{
          paddingTop: 'clamp(2rem, 6vw, 5rem)',
          paddingBottom: 'clamp(1.5rem, 4vw, 3rem)',
          textAlign: 'center',
        }}>
          <span className="font-label-caps" style={{ opacity: 0.5, display: 'block', marginBottom: '0.75rem', letterSpacing: '0.35em' }}>
            The Eclipse Edit
          </span>
          <h1 className="font-display-hero" style={{ color: 'var(--primary)' }}>
            COLLECTIONS
          </h1>
          <p className="font-body-md" style={{
            color: 'var(--on-surface-variant)', marginTop: '1rem',
            maxWidth: '400px', margin: '1rem auto 0',
          }}>
            Silhouettes inspired by astronomical precision and the void between stars.
          </p>
        </header>

        {/* ─── FILTER BAR — scrollable pills ─── */}
        <div className="filter-bar">
          <div className="container">
            <div className="pill-scroll-row">
              {filters.map(f => (
                <Link
                  key={f.label}
                  href={f.value ? `/products?category=${f.value}` : '/products'}
                  className={`pill-chip${(category === f.value || (!category && !f.value)) ? ' active' : ''}`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ─── PRODUCT GRID ─── */}
        <section className="container section-sm" style={{ paddingBottom: 'var(--section-gap)' }}>
          {displayProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', opacity: 0.4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
                inventory_2
              </span>
              <p className="font-label-caps">No pieces in this orbit yet</p>
            </div>
          ) : (
            <div className="product-grid">
              {displayProducts.map((product, i) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className="product-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    // Stagger on desktop only via media query
                  }}
                >
                  <div className="card-image" style={{
                    aspectRatio: '3/4',
                    position: 'relative',
                    marginBottom: '0.875rem',
                    backgroundColor: 'var(--surface-container-low)',
                  }}>
                    <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} />
                    {product.tag && (
                      <span className="font-caption" style={{
                        position: 'absolute', top: '0.6rem', left: '0.6rem',
                        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                        padding: '0.2rem 0.5rem', letterSpacing: '0.15em',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '4px',
                      }}>
                        {product.tag}
                      </span>
                    )}
                    {/* Wishlist button */}
                    <button
                      onClick={e => e.preventDefault()}
                      style={{
                        position: 'absolute', top: '0.6rem', right: '0.6rem',
                        background: 'rgba(20,19,19,0.6)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>
                        favorite
                      </span>
                    </button>
                  </div>

                  {/* Product info */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 className="font-headline-md" style={{
                        color: 'var(--primary)', fontSize: 'clamp(13px, 3vw, 20px)',
                        lineHeight: 1.3,
                      }}>
                        {product.name}
                      </h3>
                      <span className="font-body-md" style={{ color: 'var(--primary)', flexShrink: 0, fontSize: '13px' }}>
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="font-caption" style={{ color: 'var(--on-surface-variant)', marginTop: '0.3rem' }}>
                      {product.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ─── BOTTOM PROMO ─── */}
        <section className="container" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', textAlign: 'center' }}>
            <h2 className="font-headline-lg" style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
              Join The Orbit
            </h2>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Receive early access to planetary collections and editorial narratives.
            </p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px', margin: '0 auto' }}
              onSubmit={e => e.preventDefault()}>
              <input
                type="email" placeholder="YOUR@EMAIL.COM"
                style={{
                  background: 'transparent',
                  border: 'none', borderBottom: '1px solid var(--outline-variant)',
                  padding: '0.75rem 0', color: 'var(--primary)',
                  fontFamily: 'var(--font-body)', fontSize: '12px',
                  fontWeight: 600, letterSpacing: '0.15em', outline: 'none',
                  textAlign: 'center',
                }}
              />
              <button type="submit" className="btn-primary">JOIN</button>
            </form>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
