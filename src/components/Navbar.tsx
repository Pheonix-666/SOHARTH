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
            <div className="nav-left desktop-only" style={{ display: 'flex', gap: '2.5rem' }}>
              <Link href="/products?category=new" className={`nav-link ${isActive('/products?category=new') ? 'active' : ''}`}>New Arrivals</Link>
              <Link href="/products" className={`nav-link ${isActive('/products') && pathname !== '/products?category=new' ? 'active' : ''}`}>Collections</Link>
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', zIndex: 51, position: 'relative' }}
            >
              <div style={{ position: 'relative', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', color: 'var(--primary)', fontSize: '28px',
                    opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                 }}>menu</span>
                 <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', color: 'var(--primary)', fontSize: '28px',
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
          backgroundColor: 'rgba(20,19,19,0.98)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '2.5rem',
          transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {[
            { href: '/',                    label: 'Home' },
            { href: '/products?category=new', label: 'New Arrivals' },
            { href: '/products',            label: 'Collections' },
            { href: '/about',               label: 'Our Story' },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`font-headline-md mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
              style={{
                color: isActive(item.href) ? 'var(--primary)' : 'var(--on-surface-variant)',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontSize: '22px',
                position: 'relative',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.4s ease ${0.1 + i * 0.05}s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.05}s, color 0.3s ease, letter-spacing 0.3s ease`,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
