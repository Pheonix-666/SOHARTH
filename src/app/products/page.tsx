'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { use, useState, useEffect, useRef, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface Product {
  id: string | number;
  name: string;
  subtitle?: string;
  price: number;
  image: string;
  created_at: string;
  category: string;
  tag?: string;
  description?: string;
  material?: string;
}

interface CategoryFilter {
  label: string;
  value: string | undefined;
}

// Category metadata for rich section branding
const CATEGORY_META: Record<string, { label: string; subtitle: string; description: string; badge: string; banner: string }> = {
  ethnic: {
    label: 'ETHNIC COLLECTION',
    subtitle: 'Cultural Prints & Heritage Fusion Tees',
    description: 'Traditional motifs and ethnic fusion art printed on heavy PC cotton t-shirts.',
    badge: 'ETHNIC TEES',
    banner: '/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg',
  },
  heroic: {
    label: 'HEROIC COLLECTION',
    subtitle: 'Oversized Heavyweight & Vanguard Drops',
    description: 'Bold, structured oversized t-shirts engineered with heavy cotton and relaxed fits.',
    badge: 'HEROIC TEES',
    banner: '/WhatsApp Image 2026-05-29 at 12.50.12 PM (1).jpeg',
  },
  quotes: {
    label: 'QUOTES & STATEMENTS',
    subtitle: 'Minimalist Typography & Rebellious Prints',
    description: 'Subtle yet bold graphic quote tees and minimalist statement prints.',
    badge: 'STATEMENT TEES',
    banner: '/WhatsApp Image 2026-05-29 at 12.50.13 PM.jpeg',
  },
  outerwear: {
    label: 'STREETWEAR & HEAVY TEES',
    subtitle: 'Heavyweight Cotton & Oversized Drops',
    description: 'Architectural heavyweight t-shirts and drop-shoulder streetwear fits.',
    badge: 'HEAVY TEES',
    banner: '/WhatsApp Image 2026-05-29 at 12.50.12 PM.jpeg',
  },
  essentials: {
    label: 'ESSENTIALS',
    subtitle: 'Premium Everyday Base Tees',
    description: 'Clean, minimalist t-shirts crafted for everyday comfort and durability.',
    badge: 'CORE TEES',
    banner: '/709526651_18100526473869171_34782773961128010_n.jpg',
  },
  new: {
    label: 'NEW ARRIVALS',
    subtitle: 'Latest T-Shirt Transmissions',
    description: 'The newest t-shirt releases engineered within the past 20 days.',
    badge: 'RECENT DROP',
    banner: '/hero-bg.jpeg',
  },
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name'>('featured');
  const lastScrollY = useRef(0);

  const { addToCart } = useCart();
  const { showToast } = useToast();

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
        setProductsList(Array.isArray(productsData) ? productsData : []);
        
        // Format categories list dynamically
        const formattedCats: CategoryFilter[] = Array.isArray(categoriesData)
          ? categoriesData.map((c: any) =>
              typeof c === 'string'
                ? { label: c.toUpperCase(), value: c.toLowerCase() }
                : { label: c.label.toUpperCase(), value: c.value.toLowerCase() }
            )
          : [];

        // Ensure default key categories exist if missing
        const defaultOrder = ['ethnic', 'heroic', 'quotes', 'outerwear', 'essentials'];
        const existingValues = new Set(formattedCats.map((c) => c.value));
        
        defaultOrder.forEach((val) => {
          if (!existingValues.has(val)) {
            formattedCats.push({ label: val.toUpperCase(), value: val });
          }
        });

        setCategories(formattedCats);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load catalog and categories:', err);
        setIsLoading(false);
      });
  }, []);

  // Filter Bar buttons
  const filters: CategoryFilter[] = [
    { label: 'ALL SECTIONS', value: undefined },
    ...categories,
    { label: 'NEW ARRIVALS', value: 'new' },
  ];

  const twentyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 20);
    return d;
  }, []);

  // Process sorting & searching across products
  const filterAndSortProducts = (items: Product[]) => {
    let result = [...items];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.material && p.material.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  };

  // Group products by category for section display
  const categorizedSections = useMemo(() => {
    const map: Record<string, Product[]> = {};

    // Grouping
    productsList.forEach((p) => {
      const catKey = p.category ? p.category.toLowerCase() : 'other';
      if (!map[catKey]) map[catKey] = [];
      map[catKey].push(p);
    });

    // Ensure all defined categories have entries if products exist or default placeholders
    const categoryOrder = ['ethnic', 'heroic', 'quotes', 'outerwear', 'essentials'];
    
    // Add any other dynamic categories found in products or categories API
    categories.forEach((c) => {
      if (c.value && !categoryOrder.includes(c.value)) {
        categoryOrder.push(c.value);
      }
    });

    // Include 'other' if products exist in unknown categories
    if (map['other'] && map['other'].length > 0) {
      categoryOrder.push('other');
    }

    return categoryOrder.map((catKey) => {
      const rawProducts = map[catKey] || [];
      const defaultMeta = CATEGORY_META[catKey] || {
        label: catKey.toUpperCase() + ' COLLECTION',
        subtitle: 'Curated T-Shirt Designs',
        description: `Explore our signature selection of ${catKey} t-shirts.`,
        badge: 'TEES',
        banner: '/hero-bg.jpeg',
      };

      // Dynamically use actual product image from website catalog for section banner
      const bannerImage = rawProducts.length > 0 && rawProducts[0].image
        ? rawProducts[0].image
        : defaultMeta.banner;

      return {
        key: catKey,
        meta: {
          ...defaultMeta,
          banner: bannerImage,
        },
        products: filterAndSortProducts(rawProducts),
        totalCount: rawProducts.length,
      };
    });
  }, [productsList, categories, searchQuery, sortBy]);

  // Single category filter view
  const singleCategoryProducts = useMemo(() => {
    if (!category) return [];

    let filtered = productsList;

    if (category === 'new') {
      filtered = productsList.filter((p) => new Date(p.created_at) >= twentyDaysAgo);
    } else {
      filtered = productsList.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    return filterAndSortProducts(filtered);
  }, [category, productsList, twentyDaysAgo, searchQuery, sortBy]);

  const activeCategoryMeta = useMemo(() => {
    if (!category) return null;

    const catKey = category.toLowerCase();
    const defaultMeta = CATEGORY_META[catKey] || {
      label: category.toUpperCase() + ' COLLECTION',
      subtitle: 'Curated T-Shirt Pieces',
      description: `Browse all t-shirts in the ${category} collection.`,
      badge: 'COLLECTION',
      banner: '/hero-bg.jpeg',
    };

    const firstProduct = singleCategoryProducts.length > 0 ? singleCategoryProducts[0] : null;
    const bannerImage = firstProduct?.image || defaultMeta.banner;

    return {
      ...defaultMeta,
      banner: bannerImage,
    };
  }, [category, singleCategoryProducts]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        id: String(product.id),
        name: product.name,
        subtitle: product.subtitle || '',
        price: product.price,
        image: product.image,
      },
      'OS'
    );
    showToast(`Added ${product.name} to cart`, 'success');
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const topOffset = navHeight + 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - topOffset,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '8rem', paddingBottom: 'var(--section-gap, 4rem)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="material-symbols-outlined shimmer" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem', display: 'block' }}>auto_awesome</span>
            <div className="font-label-caps" style={{ letterSpacing: '0.4em', opacity: 0.4, fontSize: '11px', textTransform: 'uppercase' }}>
              Syncing Celestial Collections...
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
      <main style={{ paddingTop: '6rem', backgroundColor: 'var(--background, #0a0a0a)', color: 'var(--primary, #fff)', minHeight: '100vh' }}>

        {/* ─── CATALOG HERO HEADER ─── */}
        <section style={{ position: 'relative', padding: '3.5rem 1rem 2.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: '#0c0c0c' }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem' }}>
                <div>
                  <span className="font-label-caps" style={{ color: 'var(--primary, #fff)', letterSpacing: '0.4em', fontSize: '11px', opacity: 0.6, marginBottom: '0.75rem', display: 'block' }}>
                    SOHARTH CATALOGUE · {productsList.length} PIECES
                  </span>
                  <h1 className="font-headline-lg" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
                    {category ? (activeCategoryMeta?.label || `${category.toUpperCase()} SELECTION`) : 'EXPLORE ALL SECTIONS'}
                  </h1>
                </div>

                {/* Live Search & Sort Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  {/* Search Bar */}
                  <div style={{ position: 'relative', minWidth: '240px' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search apparel, fabric..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '40px',
                        padding: '0.6rem 1rem 0.6rem 2.4rem',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                      </button>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', fontSize: '18px', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
                      sort
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '40px',
                        padding: '0.6rem 2rem 0.6rem 2.4rem',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                      }}
                    >
                      <option value="featured" style={{ background: '#141414', color: '#fff' }}>Featured</option>
                      <option value="price-asc" style={{ background: '#141414', color: '#fff' }}>Price: Low to High</option>
                      <option value="price-desc" style={{ background: '#141414', color: '#fff' }}>Price: High to Low</option>
                      <option value="newest" style={{ background: '#141414', color: '#fff' }}>Newest Releases</option>
                      <option value="name" style={{ background: '#141414', color: '#fff' }}>Alphabetical</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', fontSize: '16px', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              <p className="font-body-lg" style={{ color: 'var(--on-surface-variant, #888)', fontSize: '14px', maxWidth: '640px', margin: 0, lineHeight: 1.6 }}>
                {category
                  ? (activeCategoryMeta?.description || `Discover our ${category} pieces designed with precision and dark celestial elegance.`)
                  : 'Navigate through our signature collections including Ethnic, Heroic, Quotes, Outerwear, and Essentials.'}
              </p>
            </div>
          </div>
        </section>

        {/* ─── STICKY FILTER BAR & SECTION JUMP ─── */}
        <div style={{
          position: 'sticky',
          top: navHidden ? '0px' : `${navHeight}px`,
          zIndex: 40,
          backgroundColor: 'rgba(10, 10, 10, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '1rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div className="container no-scrollbar" style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '1rem',
            overflowX: 'auto',
            padding: '0 1rem',
            WebkitOverflowScrolling: 'touch'
          }}>
            {filters.map((f) => {
              const isActive = category === f.value || (!category && !f.value);
              const targetSectionId = f.value || 'all-sections';

              return (
                <Link
                  key={f.label}
                  href={f.value ? `/products?category=${f.value}` : '/products'}
                  onClick={(e) => {
                    // Smooth scroll to section anchor if in ALL view
                    if (!category && f.value && document.getElementById(f.value)) {
                      e.preventDefault();
                      scrollToSection(f.value);
                    }
                  }}
                  className="font-label-caps"
                  style={{
                    color: isActive ? '#000' : 'var(--on-surface-variant, #aaa)',
                    backgroundColor: isActive ? '#fff' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid',
                    borderColor: isActive ? '#fff' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '0.45rem 1.25rem',
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.15em',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {f.value === 'ethnic' && <span>✨</span>}
                  {f.value === 'heroic' && <span>🔥</span>}
                  {f.value === 'quotes' && <span>⚡</span>}
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── MAIN CONTENT AREA ─── */}
        {category ? (
          /* ─── SINGLE FILTERED CATEGORY VIEW ─── */
          <section className="container" style={{ padding: '3rem 1rem 6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: '12px' }}>
                  SHOWING {singleCategoryProducts.length} PIECE{singleCategoryProducts.length !== 1 ? 'S' : ''}
                </span>
                {searchQuery && (
                  <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                    matching &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>
              <Link href="/products" className="font-label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '11px', textDecoration: 'underline', letterSpacing: '0.15em' }}>
                ← View All Sections
              </Link>
            </div>

            {singleCategoryProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem 0', opacity: 0.5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>search_off</span>
                <p className="font-headline-md" style={{ marginBottom: '0.5rem' }}>No pieces found</p>
                <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Try clearing your search query or exploring other categories.</p>
              </div>
            ) : (
              <div className="catalog-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '2rem',
                rowGap: '4rem'
              }}>
                {singleCategoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickAdd={handleQuickAdd} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ─── MULTI-SECTION CATALOG VIEW (ALL SECTIONS) ─── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '6rem' }}>
            {categorizedSections.map((section) => {
              if (section.products.length === 0 && searchQuery) return null;

              return (
                <section
                  key={section.key}
                  id={section.key}
                  style={{
                    paddingTop: '3rem',
                    scrollMarginTop: `${navHeight + 60}px`,
                  }}
                >
                  <div className="container" style={{ padding: '0 1rem' }}>
                    
                    {/* Section Banner Header */}
                    <div style={{
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      marginBottom: '3rem',
                      minHeight: '220px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#121212'
                    }}>
                      <Image
                        src={section.meta.banner}
                        alt={section.meta.label}
                        fill
                        style={{ objectFit: 'cover', opacity: 0.35 }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.4) 60%, transparent 100%)' }} />

                      <div style={{ position: 'relative', zIndex: 10, padding: '2rem 2.5rem', width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem' }}>
                        <div>
                          <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.3em', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '0.75rem' }}>
                            {section.meta.badge}
                          </span>
                          <h2 className="font-headline-lg" style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 400, letterSpacing: '0.02em' }}>
                            {section.meta.label}
                          </h2>
                          <p className="font-body-md" style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '13px', maxWidth: '520px' }}>
                            {section.meta.subtitle} — {section.meta.description}
                          </p>
                        </div>

                        <Link
                          href={`/products?category=${section.key}`}
                          className="font-label-caps"
                          style={{
                            color: '#fff',
                            fontSize: '11px',
                            letterSpacing: '0.2em',
                            textDecoration: 'none',
                            borderBottom: '1px solid #fff',
                            paddingBottom: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          EXPLORE {section.meta.label} ({section.totalCount}) →
                        </Link>
                      </div>
                    </div>

                    {/* Section Product Grid */}
                    {section.products.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.4, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <p className="font-body-md">No pieces currently listed in this section.</p>
                      </div>
                    ) : (
                      <div className="catalog-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '2rem',
                        rowGap: '4rem'
                      }}>
                        {section.products.map((product) => (
                          <ProductCard key={product.id} product={product} onQuickAdd={handleQuickAdd} />
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* ─── NEWSLETTER BENTO ─── */}
        <section className="container" style={{ padding: '0 1rem 6rem' }}>
          <div className="newsletter-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: '#0e0e0e',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div className="glass-panel" style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="font-headline-lg" style={{ color: 'var(--primary, #fff)', marginBottom: '1rem', fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em' }}>
                Transmission from the Void
              </h2>
              <p className="font-body-lg" style={{ color: 'var(--on-surface-variant, #888)', marginBottom: '3.5rem', fontSize: '15px', lineHeight: 1.6, maxWidth: '440px' }}>
                Receive early access to planetary collections, ethnic heritage edits, and editorial narratives directly in your inbox.
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
                src={productsList[0]?.image || '/hero-bg.jpeg'}
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

      {/* Global CSS hover animations for cards */}
      <style jsx global>{`
        .product-card-group:hover .product-image-hover {
          transform: scale(1.05) !important;
        }
        .quick-add-btn:hover {
          background-color: #fff !important;
          color: #000 !important;
        }
      `}</style>
    </>
  );
}

// Reusable Product Card Component
function ProductCard({
  product,
  onQuickAdd,
}: {
  product: Product;
  onQuickAdd: (e: React.MouseEvent, p: Product) => void;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="product-card-group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Image Container */}
      <div style={{
        aspectRatio: '3/4',
        position: 'relative',
        marginBottom: '1.25rem',
        backgroundColor: 'var(--surface-container-low, #141414)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
      }}>
        {/* Product Image */}
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

        {/* Tag Badge */}
        {product.tag && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            padding: '3px 8px',
            borderRadius: '4px',
            zIndex: 10,
            textTransform: 'uppercase'
          }}>
            {product.tag}
          </span>
        )}

        {/* Quick Add Button */}
        <button
          onClick={(e) => onQuickAdd(e, product)}
          className="quick-add-btn"
          title="Quick Add to Cart"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(20,20,20,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.3s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            shopping_bag
          </span>
        </button>
      </div>

      {/* Meta details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
          <h3 className="font-headline-md" style={{
            color: 'var(--primary, #fff)',
            fontSize: '15px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            margin: 0
          }}>{product.name}</h3>
          <span className="font-body-md" style={{
            color: 'var(--primary, #fff)',
            fontSize: '14px',
            fontWeight: 600
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
  );
}