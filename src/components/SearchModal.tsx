'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProductPricing } from '@/lib/pricing';
import { products as initialProducts } from '@/lib/data';

export interface ProductItem {
  id: string | number;
  name: string;
  subtitle?: string;
  price: number;
  original_price?: number;
  image: string;
  category: string;
  tag?: string;
  description?: string;
  material?: string;
  created_at?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TAGS = [
  { label: 'Ethnic', query: 'ethnic' },
  { label: 'Heroic', query: 'heroic' },
  { label: 'Quotes', query: 'quotes' },
  { label: 'New Arrivals', query: 'new' },
  { label: 'Cotton Tees', query: 'cotton' },
  { label: 'Oversized', query: 'oversized' },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductItem[]>(initialProducts as unknown as ProductItem[]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch product catalog once when opened
  useEffect(() => {
    if (!isOpen) return;

    if (products.length === 0) {
      setIsLoading(true);
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProducts(data);
          }
        })
        .catch((err) => {
          console.error('Failed to load products for search:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, products.length]);

  // Handle auto-focus and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keydown listeners (ESC, arrow navigation, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter products based on live search query
  const filteredProducts = useMemo(() => {
    if (!query.trim()) {
      return products.slice(0, 5); // Show top 5 preview items if no query
    }

    const q = query.toLowerCase().trim();
    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(q);
      const subtitleMatch = p.subtitle?.toLowerCase().includes(q);
      const categoryMatch = p.category?.toLowerCase().includes(q);
      const materialMatch = p.material?.toLowerCase().includes(q);
      const tagMatch = p.tag?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);

      return (
        nameMatch ||
        subtitleMatch ||
        categoryMatch ||
        materialMatch ||
        tagMatch ||
        descMatch
      );
    });
  }, [products, query]);

  // Handle form submission / enter key
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() && filteredProducts.length > 0) {
      const selected = filteredProducts[selectedIndex] || filteredProducts[0];
      if (selected) {
        onClose();
        router.push(`/products/${selected.id}`);
        return;
      }
    }

    onClose();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleSelectTag = (tagQuery: string) => {
    setQuery(tagQuery);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Products"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 5, 5, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(1rem, 5vh, 4rem) 1rem 2rem',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#111111',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 1px rgba(255, 255, 255, 0.2) inset',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '24px',
              color: 'var(--primary, #ffffff)',
              opacity: 0.8,
            }}
          >
            search
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search celestial apparel, fabrics, ethnic tees..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '16px',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.02em',
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '50%',
                transition: 'color 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.08em',
              transition: 'all 0.2s',
            }}
          >
            <span>ESC</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.85rem 1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          className="no-scrollbar"
        >
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              marginRight: '4px',
            }}
          >
            Trending:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleSelectTag(tag.query)}
              style={{
                backgroundColor:
                  query.toLowerCase() === tag.query.toLowerCase()
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor:
                  query.toLowerCase() === tag.query.toLowerCase()
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '4px 12px',
                color:
                  query.toLowerCase() === tag.query.toLowerCase()
                    ? '#ffffff'
                    : 'rgba(255, 255, 255, 0.75)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {isLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '32px',
                  display: 'block',
                  margin: '0 auto 8px',
                  animation: 'spin 1.5s linear infinite',
                }}
              >
                progress_activity
              </span>
              <p style={{ fontSize: '12px', letterSpacing: '0.1em' }}>
                SEARCHING CELESTIAL VAULT...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '40px', opacity: 0.4, marginBottom: '12px', display: 'block' }}
              >
                search_off
              </span>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                No pieces found matching &ldquo;{query}&rdquo;
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
                Try searching for broader keywords like &quot;ethnic&quot;, &quot;cotton&quot;, or &quot;heroic&quot;.
              </p>
              <Link
                href="/products"
                onClick={onClose}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                }}
              >
                <span>Browse All Collections</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  arrow_forward
                </span>
              </Link>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 6px 4px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontWeight: 600,
                  }}
                >
                  {query ? `MATCHING PIECES (${filteredProducts.length})` : 'FEATURED PIECES'}
                </span>
                {query && (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary, #ffffff)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      letterSpacing: '0.1em',
                      textDecoration: 'underline',
                    }}
                  >
                    View All in Catalog →
                  </button>
                )}
              </div>

              {filteredProducts.map((product) => {
                const pricing = getProductPricing(product);

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      textDecoration: 'none',
                      color: '#ffffff',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Thumbnail Image */}
                    <div
                      style={{
                        position: 'relative',
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#1a1a1a',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="56px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.3,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '2px',
                        }}
                      >
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {product.name}
                        </h4>
                        {product.category && (
                          <span
                            style={{
                              fontSize: '9px',
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {product.category}
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {product.subtitle || product.material || 'Heavyweight Celestial Cotton'}
                      </p>
                    </div>

                    {/* Price Info */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#ffffff',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        ₹{pricing.discountedPrice}
                      </div>
                      {pricing.discountPercent > 0 && (
                        <div
                          style={{
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <span
                            style={{
                              textDecoration: 'line-through',
                              color: 'rgba(255, 255, 255, 0.4)',
                            }}
                          >
                            ₹{pricing.originalPrice}
                          </span>
                          <span
                            style={{
                              color: '#4ade80',
                              fontWeight: 600,
                              fontSize: '10px',
                            }}
                          >
                            {pricing.discountPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>

                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '18px',
                        color: 'rgba(255, 255, 255, 0.3)',
                        flexShrink: 0,
                      }}
                    >
                      chevron_right
                    </span>
                  </Link>
                );
              })}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              ↵ ENTER
            </span>
            <span>View all results</span>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary, #ffffff)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.05em',
            }}
          >
            <span>Full Catalog View</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              open_in_new
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
