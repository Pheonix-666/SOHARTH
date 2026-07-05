'use client';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { use, useState, useEffect, useRef } from 'react';

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = use(searchParams);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productsList, setProductsList] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
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
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProductsList(productsData);
        setCategories(categoriesData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dynamic catalog and categories:', err);
        setIsLoading(false);
      });
  }, []);

  const filters = [
    { label: 'ALL', value: undefined },
    ...categories,
    { label: 'NEW ARRIVALS', value: 'new' },
  ];

  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

  const displayProducts = category
    ? productsList.filter(p => {
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
        <main style={{ paddingTop: '8rem', paddingBottom: 'var(--section-gap)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>Syncing Collections...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '8rem' }}>

        {/* ─── FILTER BAR ─── */}
        <div style={{
          position: 'sticky',
          top: navHidden ? '0px' : `${navHeight}px`,
          zIndex: 40,
          backgroundColor: 'rgba(20, 19, 19, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '0.85rem 0',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div className="container filter-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', paddingBlockStart: '4px', paddingBlockEnd: '2px' }}>
            {filters.map(f => {
              const isActive = category === f.value || (!category && !f.value);
              return (
                <Link
                  key={f.label}
                  href={f.value ? `/products?category=${f.value}` : '/products'}
                  className="font-label-caps"
                  style={{
                    color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                    borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                    paddingBottom: '4px',
                    letterSpacing: '0.3em',
                    transition: 'color 0.3s ease, border-color 0.3s ease',
                    whiteSpace: 'nowrap',
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── PRODUCT GRID ─── */}
        <section className="container" style={{ paddingBottom: 'var(--section-gap)' }}>
          <div className="catalog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gutter)', rowGap: '3.5rem' }}>
            {displayProducts.map((product, i) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className={`product-card ${i % 2 === 1 ? 'catalog-item-offset' : ''}`}
                style={{
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <div className="card-image" style={{
                  aspectRatio: '3/4', position: 'relative', marginBottom: '1rem',
                  backgroundColor: 'var(--surface-container-low)', overflow: 'hidden',
                }}>
                  <Image
                    src={product.image} alt={product.name} fill
                    style={{ objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  />
                </div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <h3 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '0.2rem', fontSize: '14px' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="font-label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '9px', opacity: 0.6 }}>{product.subtitle}</p>
                    <span className="font-body-md" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600 }}>₹{product.price.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── NEWSLETTER BENTO ─── */}
        <section className="container" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="newsletter-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--gutter)' }}
          >
            <div className="glass-panel glass-panel-mobile" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="font-headline-lg" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Transmission from the Void</h2>
              <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '3rem' }}>
                Receive early access to planetary collections and editorial narratives directly in your inbox.
              </p>
              <form style={{ display: 'flex', gap: '1rem' }} onSubmit={e => e.preventDefault()}>
                <input
                  type="email" placeholder="YOUR@EMAIL.COM"
                  style={{
                    flex: 1, background: 'transparent',
                    border: 'none', borderBottom: '1px solid var(--outline-variant)',
                    padding: '1rem 0', color: 'var(--primary)',
                    fontFamily: 'var(--font-body)', fontSize: '12px',
                    fontWeight: 600, letterSpacing: '0.2em', outline: 'none',
                  }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '1rem 2rem', letterSpacing: '0.2em' }}>JOIN</button>
              </form>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '400px' }}>
              <Image
                src="/WhatsApp Image 2026-05-29 at 12.50.12 PM (1).jpeg"
                alt="Collection"
                fill
                style={{ objectFit: 'cover', opacity: 0.6 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--background), transparent)' }} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
