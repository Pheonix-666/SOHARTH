'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { use, useState, useEffect, useRef, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getProductPricing } from '@/lib/pricing';
import { products as initialProducts } from '@/lib/data';

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

// Category metadata leading with plain e-commerce product terms, with cosmic names as subtitle
const CATEGORY_META: Record<string, { label: string; subtitle: string; description: string; badge: string; banner: string }> = {
  heroic: {
    label: 'OVERSIZED HEAVYWEIGHT TEES',
    subtitle: 'Black Essentials & Drop-Shoulder Cuts · The Void Atelier',
    description: 'Structured 240+ GSM drop-shoulder streetwear tees engineered with pure bio-washed combed cotton.',
    badge: 'OVERSIZED TEES',
    banner: '/WhatsApp Image 2026-05-29 at 12.50.12 PM (1).jpeg',
  },
  ethnic: {
    label: 'ETHNIC & HERITAGE FUSION TEES',
    subtitle: 'Cultural Prints & Traditional Motifs · Celestial Fusion',
    description: 'Traditional Indian heritage motifs fused with modern cosmic art printed on durable heavy cotton tees.',
    badge: 'ETHNIC TEES',
    banner: '/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg',
  },
  quotes: {
    label: 'GRAPHIC STATEMENT & ANIME TEES',
    subtitle: 'Minimalist Typography & Cyber Artwork · Starlight Tech Series',
    description: 'Subtle yet bold graphic quote prints and cybernetic glitch artwork engineered on luxury tees.',
    badge: 'GRAPHIC TEES',
    banner: '/WhatsApp Image 2026-05-29 at 12.50.13 PM.jpeg',
  },
  new: {
    label: 'NEW ARRIVALS · LATEST DROPS',
    subtitle: 'Fresh Streetwear Drops & Limited Releases',
    description: 'The newest t-shirt releases engineered within the past 20 days.',
    badge: 'NEW ARRIVALS',
    banner: '/hero-bg.jpeg',
  },
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; fit?: string; style?: string; price?: string; q?: string; search?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const category = resolvedParams?.category;
  const initialQuery = resolvedParams?.q || resolvedParams?.search || '';
  const initialFit = resolvedParams?.fit === 'oversized' || resolvedParams?.fit === 'regular' ? resolvedParams.fit : 'all';
  const initialStyle = resolvedParams?.style === 'graphic' || resolvedParams?.style === 'ethnic' || resolvedParams?.style === 'plain' ? resolvedParams.style : 'all';
  const initialPrice = resolvedParams?.price === 'under-499' || resolvedParams?.price === '500-799' || resolvedParams?.price === '800-plus' ? resolvedParams.price : 'all';

  const [productsList, setProductsList] = useState<Product[]>(initialProducts as unknown as Product[]);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [navHeight, setNavHeight] = useState(64);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [fitFilter, setFitFilter] = useState<'all' | 'oversized' | 'regular'>(initialFit);
  const [styleFilter, setStyleFilter] = useState<'all' | 'graphic' | 'ethnic' | 'plain'>(initialStyle);
  const [priceFilter, setPriceFilter] = useState<'all' | 'under-499' | '500-799' | '800-plus'>(initialPrice);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name'>('featured');
  const lastScrollY = useRef(0);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (resolvedParams?.q !== undefined || resolvedParams?.search !== undefined) {
      setSearchQuery(resolvedParams.q || resolvedParams.search || '');
    }
    if (resolvedParams?.fit) {
      setFitFilter(resolvedParams.fit === 'oversized' || resolvedParams.fit === 'regular' ? resolvedParams.fit : 'all');
    }
  }, [resolvedParams?.q, resolvedParams?.search, resolvedParams?.fit]);

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
        if (Array.isArray(productsData) && productsData.length > 0) {
          setProductsList(productsData);
        }

        const formattedCats: CategoryFilter[] = Array.isArray(categoriesData)
          ? categoriesData.map((c: any) =>
            typeof c === 'string'
              ? { label: c.toUpperCase(), value: c.toLowerCase() }
              : { label: c.label.toUpperCase(), value: c.value.toLowerCase() }
          )
          : [];

        setCategories(formattedCats);
      })
      .catch((err) => {
        console.error('Failed to load catalog and categories:', err);
      });
  }, []);

  // Filter Bar buttons (Leading with plain search terms)
  const filters: CategoryFilter[] = [
    { label: 'ALL T-SHIRTS', value: undefined },
    { label: 'OVERSIZED TEES', value: 'heroic' },
    { label: 'ETHNIC TEES', value: 'ethnic' },
    { label: 'GRAPHIC TEES', value: 'quotes' },
    ...categories.filter(c => !['heroic', 'ethnic', 'quotes', 'new'].includes(c.value || '')),
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

    // Fit filter
    if (fitFilter !== 'all') {
      result = result.filter((p) => {
        const text = `${p.name} ${p.subtitle || ''} ${p.category || ''} ${p.description || ''} ${p.tag || ''}`.toLowerCase();
        if (fitFilter === 'oversized') return text.includes('oversized') || text.includes('drop') || p.category === 'heroic';
        if (fitFilter === 'regular') return !text.includes('oversized') || text.includes('regular');
        return true;
      });
    }

    // Style filter
    if (styleFilter !== 'all') {
      result = result.filter((p) => {
        const text = `${p.name} ${p.subtitle || ''} ${p.category || ''} ${p.description || ''} ${p.tag || ''}`.toLowerCase();
        if (styleFilter === 'graphic') return text.includes('graphic') || text.includes('quote') || text.includes('anime') || p.category === 'quotes';
        if (styleFilter === 'ethnic') return text.includes('ethnic') || text.includes('heritage') || p.category === 'ethnic';
        if (styleFilter === 'plain') return text.includes('plain') || text.includes('basic') || text.includes('solid');
        return true;
      });
    }

    // Price filter
    if (priceFilter !== 'all') {
      result = result.filter((p) => {
        if (priceFilter === 'under-499') return p.price <= 499;
        if (priceFilter === '500-799') return p.price > 499 && p.price <= 799;
        if (priceFilter === '800-plus') return p.price > 799;
        return true;
      });
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

    productsList.forEach((p) => {
      const catKey = p.category ? p.category.toLowerCase() : 'other';
      if (!map[catKey]) map[catKey] = [];
      map[catKey].push(p);
    });

    const categoryOrder = ['heroic', 'ethnic', 'quotes'];

    categories.forEach((c) => {
      if (c.value && !categoryOrder.includes(c.value) && c.value !== 'new') {
        categoryOrder.push(c.value);
      }
    });

    return categoryOrder.map((catKey) => {
      const rawProducts = map[catKey] || [];
      const defaultMeta = CATEGORY_META[catKey] || {
        label: catKey.toUpperCase() + ' TEES',
        subtitle: 'Curated Streetwear Designs',
        description: `Explore our signature selection of ${catKey} t-shirts.`,
        badge: 'TEES',
        banner: '/hero-bg.jpeg',
      };

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
  }, [productsList, categories, searchQuery, fitFilter, styleFilter, priceFilter, sortBy]);

  const totalMultiSectionResults = useMemo(() => {
    return categorizedSections.reduce((acc, sec) => acc + sec.products.length, 0);
  }, [categorizedSections]);

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
  }, [category, productsList, twentyDaysAgo, searchQuery, fitFilter, styleFilter, priceFilter, sortBy]);

  const activeCategoryMeta = useMemo(() => {
    if (!category) return null;
    const catKey = category.toLowerCase();
    return CATEGORY_META[catKey] || {
      label: `${category.toUpperCase()} COLLECTION`,
      subtitle: 'Curated T-Shirt Releases',
      description: `Explore pieces within the ${category} collection.`,
      badge: 'COLLECTION',
      banner: '/hero-bg.jpeg',
    };
  }, [category]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const pricing = getProductPricing(product);
    addToCart(
      {
        id: String(product.id),
        name: product.name,
        subtitle: product.subtitle || '',
        price: pricing.discountedPrice,
        image: product.image,
      },
      'M'
    );
    showToast(`Added ${product.name} (Size M) to your bag`, 'success');
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

  const hasActiveFilters = fitFilter !== 'all' || styleFilter !== 'all' || priceFilter !== 'all' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setSearchQuery('');
    setFitFilter('all');
    setStyleFilter('all');
    setPriceFilter('all');
  };

  // Modern skeleton loader instead of slow poetic text
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '85vh', backgroundColor: '#0a0a0a' }}>
          <div className="container" style={{ maxWidth: '1200px', padding: '0 1rem' }}>
            <div className="skeleton-shimmer" style={{ height: '50px', width: '320px', marginBottom: '2.5rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="skeleton-shimmer" style={{ height: '420px', borderRadius: '16px' }} />
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
      <main style={{ paddingTop: '5.5rem', backgroundColor: 'var(--background, #0a0a0a)', color: 'var(--primary, #fff)', minHeight: '100vh' }}>

        {/* ─── CATALOG HERO HEADER ─── */}
        <section style={{ position: 'relative', padding: '3.5rem 1rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: '#0c0c0c' }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem' }}>
                <div>
                  <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.3em', fontSize: '11px', marginBottom: '0.75rem', display: 'block' }}>
                    ✦ SOHARTH T-SHIRTS · 240+ GSM COMBED COTTON
                  </span>
                  <h1 className="font-headline-lg" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
                    {category ? (activeCategoryMeta?.label || `${category.toUpperCase()} TEES`) : 'EXPLORE ALL T-SHIRTS'}
                  </h1>
                  <p style={{ color: 'var(--on-surface-variant, #888)', fontSize: '14px', maxWidth: '640px', margin: '0.75rem 0 0', lineHeight: 1.6 }}>
                    {category
                      ? (activeCategoryMeta?.description || `Explore our ${category} t-shirts designed with precision and dark celestial elegance.`)
                      : 'Oversized heavyweights, cultural ethnic motifs, and minimalist graphic statements. Free Express Shipping & COD across India.'}
                  </p>
                </div>

                {/* Live Search & Sort Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  {/* Search Bar */}
                  <div style={{ position: 'relative', minWidth: '220px' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search tees, fabric, color..."
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
                      <option value="featured" style={{ background: '#141414', color: '#fff' }}>Featured Drops</option>
                      <option value="price-asc" style={{ background: '#141414', color: '#fff' }}>Price: Low to High</option>
                      <option value="price-desc" style={{ background: '#141414', color: '#fff' }}>Price: High to Low</option>
                      <option value="newest" style={{ background: '#141414', color: '#fff' }}>Newest Drops</option>
                      <option value="name" style={{ background: '#141414', color: '#fff' }}>Alphabetical</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', fontSize: '16px', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── REAL CATEGORY & ATTRIBUTE FILTERS (Fit, Style, Price) ─── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Filters:
                </span>

                {/* Fit Filter */}
                <select
                  value={fitFilter}
                  onChange={(e: any) => setFitFilter(e.target.value)}
                  style={{
                    backgroundColor: fitFilter !== 'all' ? 'rgba(253, 224, 71, 0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: fitFilter !== 'all' ? '#fde047' : 'rgba(255,255,255,0.12)',
                    color: fitFilter !== 'all' ? '#fde047' : '#fff',
                    border: '1px solid',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all" style={{ background: '#141414', color: '#fff' }}>Fit: All Silhouettes</option>
                  <option value="oversized" style={{ background: '#141414', color: '#fff' }}>Fit: Oversized Drop-Shoulder</option>
                  <option value="regular" style={{ background: '#141414', color: '#fff' }}>Fit: Regular Cut</option>
                </select>

                {/* Style Filter */}
                <select
                  value={styleFilter}
                  onChange={(e: any) => setStyleFilter(e.target.value)}
                  style={{
                    backgroundColor: styleFilter !== 'all' ? 'rgba(253, 224, 71, 0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: styleFilter !== 'all' ? '#fde047' : 'rgba(255,255,255,0.12)',
                    color: styleFilter !== 'all' ? '#fde047' : '#fff',
                    border: '1px solid',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all" style={{ background: '#141414', color: '#fff' }}>Style: All Prints</option>
                  <option value="graphic" style={{ background: '#141414', color: '#fff' }}>Style: Graphic & Quotes</option>
                  <option value="ethnic" style={{ background: '#141414', color: '#fff' }}>Style: Ethnic & Cultural</option>
                  <option value="plain" style={{ background: '#141414', color: '#fff' }}>Style: Plain & Minimal</option>
                </select>

                {/* Price Filter */}
                <select
                  value={priceFilter}
                  onChange={(e: any) => setPriceFilter(e.target.value)}
                  style={{
                    backgroundColor: priceFilter !== 'all' ? 'rgba(253, 224, 71, 0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: priceFilter !== 'all' ? '#fde047' : 'rgba(255,255,255,0.12)',
                    color: priceFilter !== 'all' ? '#fde047' : '#fff',
                    border: '1px solid',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all" style={{ background: '#141414', color: '#fff' }}>Price: All Ranges</option>
                  <option value="under-499" style={{ background: '#141414', color: '#fff' }}>Under ₹499</option>
                  <option value="500-799" style={{ background: '#141414', color: '#fff' }}>₹500 – ₹799</option>
                  <option value="800-plus" style={{ background: '#141414', color: '#fff' }}>₹800 and above</option>
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    Reset all filters
                  </button>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ─── STICKY CATEGORY NAV ─── */}
        <div style={{
          position: 'sticky',
          top: navHidden ? '0px' : `${navHeight}px`,
          zIndex: 40,
          backgroundColor: 'rgba(10, 10, 10, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '0.85rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div className="container no-scrollbar" style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '0.75rem',
            overflowX: 'auto',
            padding: '0 1rem',
            WebkitOverflowScrolling: 'touch'
          }}>
            {filters.map((f) => {
              const isActive = category === f.value || (!category && !f.value);

              return (
                <Link
                  key={f.label}
                  href={f.value ? `/products?category=${f.value}` : '/products'}
                  onClick={(e) => {
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
                    borderColor: isActive ? '#fff' : 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '24px',
                    padding: '0.6rem 1.3rem',
                    fontSize: '11px',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.12em',
                    transition: 'all 0.25s',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
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
          <section className="container" style={{ padding: '3rem 1rem 6rem', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: '12px' }}>
                  SHOWING {singleCategoryProducts.length} T-SHIRT{singleCategoryProducts.length !== 1 ? 'S' : ''}
                </span>
                {searchQuery && (
                  <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                    matching &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>
              <Link href="/products" className="font-label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '11px', textDecoration: 'underline', letterSpacing: '0.15em' }}>
                ← View All T-Shirts
              </Link>
            </div>

            {singleCategoryProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem 0', opacity: 0.6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>search_off</span>
                <p className="font-headline-md" style={{ marginBottom: '0.5rem' }}>No pieces found</p>
                <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>Try clearing filters or exploring other collections.</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="catalog-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '2rem',
                rowGap: '3.5rem'
              }}>
                {singleCategoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickAdd={handleQuickAdd} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ─── MULTI-SECTION CATALOG VIEW (ALL SECTIONS) ─── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '6rem' }}>
            {hasActiveFilters && totalMultiSectionResults === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem 1rem', opacity: 0.85 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem', opacity: 0.4 }}>
                  search_off
                </span>
                <p className="font-headline-md" style={{ marginBottom: '0.5rem', fontSize: '20px' }}>
                  No t-shirts match your filter criteria
                </p>
                <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem', fontSize: '14px' }}>
                  Try relaxing your price, fit, or style filters to view available garments.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '24px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : null}

            {categorizedSections.map((section) => {
              if (section.products.length === 0 && hasActiveFilters) return null;

              return (
                <section
                  key={section.key}
                  id={section.key}
                  style={{
                    paddingTop: '2.5rem',
                    scrollMarginTop: `${navHeight + 60}px`,
                  }}
                >
                  <div className="container" style={{ padding: '0 1rem', maxWidth: '1200px' }}>

                    {/* Section Banner Header */}
                    <div style={{
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      marginBottom: '2.5rem',
                      minHeight: '200px',
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
                      <div style={{
                        position: 'relative',
                        zIndex: 2,
                        padding: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        width: '100%',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)'
                      }}>
                        <div>
                          <span className="font-label-caps" style={{ color: '#fde047', letterSpacing: '0.25em', fontSize: '11px', display: 'block', marginBottom: '0.5rem' }}>
                            {section.meta.badge}
                          </span>
                          <h2 className="font-headline-lg" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', margin: 0, fontWeight: 300, color: '#fff' }}>
                            {section.meta.label}
                          </h2>
                          <p style={{ color: 'var(--on-surface-variant)', fontSize: '13px', margin: '4px 0 0', maxWidth: '520px' }}>
                            {section.meta.subtitle} — {section.meta.description}
                          </p>
                        </div>

                        <Link
                          href={`/products?category=${section.key}`}
                          className="font-label-caps"
                          style={{
                            color: '#fff',
                            fontSize: '11px',
                            letterSpacing: '0.15em',
                            textDecoration: 'none',
                            borderBottom: '1px solid #fff',
                            paddingBottom: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          VIEW ALL {section.meta.badge} ({section.totalCount}) →
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
                        rowGap: '3.5rem'
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

      </main>
      <Footer />
    </>
  );
}

// Product Card Component with Indian E-Commerce pricing and quick size add
function ProductCard({ product, onQuickAdd }: { product: Product; onQuickAdd: (e: React.MouseEvent, p: Product) => void }) {
  const pricing = getProductPricing(product);

  return (
    <Link
      href={`/products/${product.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: '#fff',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#121212',
          minHeight: '340px',
          display: 'block',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {pricing.discountPercent > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#fde047',
              color: '#000',
              fontWeight: 800,
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '12px',
              zIndex: 10,
              letterSpacing: '0.05em',
            }}
          >
            {pricing.discountPercent}% OFF
          </span>
        )}

        {/* Quick Add Button */}
        <button
          onClick={(e) => onQuickAdd(e, product)}
          title="Quick Add to Bag"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(22, 21, 21, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#fff' }}>
            add_shopping_cart
          </span>
        </button>

        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>image</span>
          </div>
        )}
      </div>

      <div style={{ paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span className="font-label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>
            {product.category?.toUpperCase() || 'STREETWEAR'}
          </span>
          <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 600 }}>IN STOCK</span>
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>
              ₹{pricing.discountedPrice.toLocaleString()}
            </span>
            {pricing.originalPrice > pricing.discountedPrice && (
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '12px', textDecoration: 'line-through', opacity: 0.6 }}>
                ₹{pricing.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <span style={{
            fontSize: '11px',
            color: '#fde047',
            fontWeight: 600,
            letterSpacing: '0.04em'
          }}>
            Save ₹{pricing.savings.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}