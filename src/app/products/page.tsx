'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { use, useState, useEffect, useRef } from 'react';

interface Product {
  id: string | number;
  name: string;
  subtitle?: string;
  price: number;
  image: string;
  created_at: string;
  category: string;
}

interface CategoryFilter {
  label: string;
  value: string | undefined;
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = use(searchParams);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [navHidden, setNavHidden] = useState(false);
  const [navHeight, setNavHeight] = useState(64);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const measureNav = () => {
      const nav = document.querySelector('.glass-nav') as HTMLElement | null;
      if (nav) setNavHeight(nav.offsetHeight);
    };
    measureNav();

    const onScroll = () => {
      const y = window.scrollY;
      measureNav();
      if (y > 80) {
        setNavHidden(y > lastScrollY.current);
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measureNav);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measureNav);
    };
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProductsList(productsData);
        // Map API data to expected Filter structure if necessary
        const formattedCats = categoriesData.map((c: any) =>
          typeof c === 'string' ? { label: c.toUpperCase(), value: c } : c
        );
        setCategories(formattedCats);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dynamic catalog and categories:', err);
        setIsLoading(false);
      });
  }, []);

  const filters: CategoryFilter[] = [
    { label: 'ALL', value: undefined },
    ...categories,
    { label: 'NEW ARRIVALS', value: 'new' },
  ];

  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

  const displayProducts = category
    ? productsList.filter((p) => {
      if (category === 'new') {
        const createdAt = new Date(p.created_at);
        return createdAt >= twentyDaysAgo;
      }
      return p.category === category;
    })
    : productsList;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '8rem', paddingBottom: 'var(--section-gap, 4rem)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.4em', opacity: 0.4, fontSize: '11px', textTransform: 'uppercase' }}>
            Syncing Collections...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '6rem', backgroundColor: 'var(--background, #0a0a0a)', color: 'var(--primary, #fff)' }}>

        {/* ─── FILTER BAR ─── */}
        <div style={{
          position: 'sticky',
          top: navHidden ? '0px' : `${navHeight}px`,
          zIndex: 40,
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '1.25rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Added 'no-scrollbar' class here */}
          <div className="container no-scrollbar" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2.5rem',
            overflowX: 'auto',
            padding: '0 1rem',
            WebkitOverflowScrolling: 'touch' /* Smooth momentum scrolling on iOS */
          }}>
            {filters.map((f) => {
              const isActive = category === f.value || (!category && !f.value);
              return (
                <Link
                  key={f.label}
                  href={f.value ? `/products?category=${f.value}` : '/products'}
                  className="font-label-caps"
                  style={{
                    color: isActive ? 'var(--primary, #fff)' : 'var(--on-surface-variant, #888)',
                    borderBottom: '2px solid',
                    borderColor: isActive ? 'var(--primary, #fff)' : 'transparent',
                    paddingBottom: '6px',
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.25em',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── PRODUCT GRID ─── */}
        <section className="container" style={{ padding: '4rem 1rem var(--section-gap, 6rem)' }}>
          <div className="catalog-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '2rem',
            rowGap: '4rem'
          }}>
            {displayProducts.map((product, i) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className={`product-card-group ${i % 2 === 1 ? 'catalog-item-offset' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {/* Image Wrap for Pure CSS Hover Isolation */}
                <div style={{
                  aspectRatio: '3/4',
                  position: 'relative',
                  marginBottom: '1.25rem',
                  backgroundColor: 'var(--surface-container-low, #141414)',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.03)'
                }}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="product-image-hover"
                    style={{
                      objectFit: 'cover',
                      transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </div>

                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                    <h3 className="font-headline-md" style={{
                      color: 'var(--primary, #fff)',
                      fontSize: '15px',
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                      margin: 0
                    }}>{product.name}</h3>
                    <span className="font-body-md" style={{
                      color: 'var(--primary, #fff)',
                      fontSize: '14px',
                      fontWeight: 500
                    }}>₹{product.price.toLocaleString()}</span>
                  </div>
                  {product.subtitle && (
                    <p className="font-label-caps" style={{
                      color: 'var(--on-surface-variant, #888)',
                      fontSize: '10px',
                      letterSpacing: '0.15em',
                      margin: 0,
                      textTransform: 'uppercase'
                    }}>{product.subtitle}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── NEWSLETTER BENTO ─── */}
        <section className="container" style={{ padding: '0 1rem 6rem' }}>
          <div className="newsletter-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: '#0e0e0e'
          }}>
            <div className="glass-panel" style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="font-headline-lg" style={{ color: 'var(--primary, #fff)', marginBottom: '1rem', fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em' }}>
                Transmission from the Void
              </h2>
              <p className="font-body-lg" style={{ color: 'var(--on-surface-variant, #888)', marginBottom: '3.5rem', fontSize: '15px', lineHeight: 1.6, maxWidth: '440px' }}>
                Receive early access to planetary collections and editorial narratives directly in your inbox.
              </p>

              <form style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end' }} onSubmit={e => e.preventDefault()}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="YOUR@EMAIL.COM"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '0.75rem 0',
                      color: 'var(--primary, #fff)',
                      fontFamily: 'var(--font-body, inherit)',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.2em',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{
                  padding: '0.75rem 2.5rem',
                  letterSpacing: '0.2em',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#fff',
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}>JOIN</button>
              </form>
            </div>

            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '350px' }}>
              <Image
                src="/WhatsApp Image 2026-05-29 at 12.50.12 PM (1).jpeg"
                alt="Collection"
                fill
                priority
                style={{ objectFit: 'cover', opacity: 0.4 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0e0e0e, transparent)' }} />
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Global CSS fixes injection for pure-CSS image zoom on card hover */}
      <style jsx global>{`
        .product-card-group:hover .product-image-hover {
          transform: scale(1.04) !important;
        }
        @media (max-width: 768px) {
          .catalog-item-offset {
            transform: translateY(0px) !important;
          }
        }
      `}</style>
    </>
  );
}