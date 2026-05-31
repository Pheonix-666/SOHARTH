'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, isHydrated } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change / resize
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="glass-nav"
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 50,
          padding: scrolled ? '0.6rem 0' : '1rem 0',
          transition: 'padding 0.4s ease',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Left Nav — desktop only */}
          <div className="nav-left" style={{ flex: 1, display: 'flex', gap: '2rem' }}>
            <Link href="/products?category=new" className="nav-link">New Arrivals</Link>
            <Link href="/products" className="nav-link">Collections</Link>
          </div>

          {/* Center Logo */}
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 0 }}
          >
            <Image
              src="/logo.jpg"
              alt="Solarth"
              width={40}
              height={40}
              priority
              style={{ objectFit: 'contain', borderRadius: '50%' }}
            />
          </Link>

          {/* Right Actions */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.25rem' }}>
            <Link href="/about" className="nav-link nav-right-link">Our Story</Link>

            {/* Cart */}
            <Link href="/cart" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>
                shopping_bag
              </span>
              {isHydrated && cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
                  fontSize: '9px', fontWeight: 700,
                  width: '15px', height: '15px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="nav-burger"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Drawer */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          backgroundColor: 'rgba(14,13,13,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '2.5rem',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        onClick={() => setMenuOpen(false)}
      >
        {[
          { href: '/',                     label: 'Home',         icon: 'home' },
          { href: '/products?category=new', label: 'New Arrivals', icon: 'star' },
          { href: '/products',             label: 'Collections',  icon: 'grid_view' },
          { href: '/about',                label: 'Our Story',    icon: 'favorite' },
          { href: '/cart',                 label: 'Cart',         icon: 'shopping_bag' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              color: pathname === item.href ? 'var(--primary)' : 'var(--on-surface-variant)',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 5vw, 32px)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              transition: 'color 0.25s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
