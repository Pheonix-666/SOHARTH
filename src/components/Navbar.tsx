'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [hidden, setHidden]       = useState(false);
  const lastScrollY               = useRef(0);

  const { cartCount, isHydrated } = useCart();
  const pathname = usePathname();

  // Scroll: track direction + scrolled state
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);

      // Only hide/show on scroll direction change past a threshold
      if (y > 80) {
        setHidden(y > lastScrollY.current);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname?.startsWith(path);
  };

  return (
    <>
      <nav
        className={`glass-nav ${scrolled ? 'scrolled' : ''} ${pathname?.startsWith('/products/') ? 'nav-product-page' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 50,
          transform: hidden && !menuOpen ? 'translateY(-110%)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), padding 0.4s ease, background 0.4s ease',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Left Area: Links (Desktop) / Logo (Mobile) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <div className="nav-left desktop-only" style={{ display: 'flex', gap: '2rem' }}>
              <Link href="/products?category=new" className={`nav-link ${isActive('/products?category=new') ? 'active' : ''}`}>New Arrivals</Link>
              <Link href="/products?category=ethnic" className={`nav-link ${isActive('/products?category=ethnic') ? 'active' : ''}`}>Ethnic</Link>
              <Link href="/products" className={`nav-link ${isActive('/products') && pathname === '/products' ? 'active' : ''}`}>Collections</Link>
            </div>
            <Link href="/" className="nav-logo-link mobile-flex" style={{ display: 'flex', alignItems: 'center', zIndex: 51, position: 'relative' }}>
              <Image src="/logo.jpg" alt="Soharth" width={36} height={36} priority style={{ objectFit: 'contain', borderRadius: '50%' }} />
            </Link>
          </div>

          {/* Center Area: Logo (Desktop) / Empty (Mobile) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link href="/" className="nav-logo-link desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logo.jpg" alt="Soharth" width={48} height={48} priority style={{ objectFit: 'contain', borderRadius: '50%', transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} className="nav-logo-desktop" />
            </Link>
          </div>

          {/* Right Area: Actions */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem' }}>
            <Link href="/about" className={`nav-link nav-right-link desktop-only ${isActive('/about') ? 'active' : ''}`}>Our Story</Link>

            {/* Cart */}
            <Link href="/cart" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', zIndex: 51 }}>
              <span className="material-symbols-outlined nav-cart-icon" style={{ color: 'var(--primary)', fontSize: '24px', transition: 'transform 0.3s ease' }}>
                shopping_bag
              </span>
              {isHydrated && cartCount > 0 && (
                <span className="cart-badge fade-in-up" style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
                  fontSize: '10px', fontWeight: 800,
                  width: '18px', height: '18px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              className="nav-burger mobile-only"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '10px',
                minWidth: '48px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 51,
                position: 'relative',
                touchAction: 'manipulation'
              }}
            >
              <div style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', color: 'var(--primary)', fontSize: '30px',
                    opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                 }}>menu</span>
                 <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', color: 'var(--primary)', fontSize: '30px',
                    opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                 }}>close</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className="mobile-drawer"
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          backgroundColor: 'rgba(14,13,13,0.98)',
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '6rem 1.5rem calc(2rem + env(safe-area-inset-bottom)) 1.5rem',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '0.75rem',
          width: '100%', maxWidth: '340px',
          transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {[
            { href: '/', label: 'Home', icon: 'home' },
            { href: '/products?category=ethnic', label: 'Ethnic Collection', icon: 'auto_awesome' },
            { href: '/products?category=new', label: 'New Arrivals', icon: 'local_fire_department' },
            { href: '/products', label: 'All Collections', icon: 'grid_view' },
            { href: '/about', label: 'Our Story', icon: 'history_edu' },
            { href: '/cart', label: 'My Bag', icon: 'shopping_bag', badge: cartCount },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="mobile-nav-link"
              style={{
                width: '100%',
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: isActive(item.href) ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                border: '1px solid',
                borderColor: isActive(item.href) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                color: isActive(item.href) ? '#ffffff' : 'var(--on-surface-variant)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(15px)',
                transition: `opacity 0.3s ease ${0.05 + i * 0.04}s, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${0.05 + i * 0.04}s, background 0.2s`,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isActive(item.href) ? '#fde047' : 'inherit' }}>
                  {item.icon}
                </span>
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  backgroundColor: '#fde047',
                  color: '#000',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Drawer Footer with Instagram */}
        <div style={{
          width: '100%', maxWidth: '340px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)',
          opacity: menuOpen ? 1 : 0,
          transition: 'opacity 0.4s ease 0.3s',
        }}>
          <a
            href="https://www.instagram.com/soharth.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '24px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textDecoration: 'none',
            }}
          >
            <span>Follow @soharth.in on Instagram</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
          </a>
          <span style={{ fontSize: '10px', color: 'var(--on-surface-variant)', letterSpacing: '0.2em' }}>
            CELESTIAL APPAREL CO.
          </span>
        </div>
      </div>
    </>
  );
}
