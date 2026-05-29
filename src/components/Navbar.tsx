'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { cartCount, isHydrated } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <>
      <nav
        className="glass-nav"
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 50,
          padding: scrolled ? '0.75rem 0' : '1.25rem 0',
          transition: 'padding 0.4s ease',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Left Nav — hidden on mobile */}
          <div className="nav-left" style={{ flex: 1, display: 'flex', gap: '2rem' }}>
            <Link href="/products?category=new" className="nav-link">New Arrivals</Link>
            <Link href="/products" className="nav-link">Collections</Link>
          </div>

          {/* Center Logo */}
          <Link
            href="/"
            className="nav-logo-link"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 0 }}
          >
            <Image
              src="/logo.jpg"
              alt="Solarth"
              width={44}
              height={44}
              priority
              style={{ objectFit: 'contain', borderRadius: '50%' }}
            />
          </Link>

          {/* Right Actions — hidden on mobile (except cart + burger) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
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
                  width: '16px', height: '16px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger — visible only on mobile */}
            <button
              className="nav-burger"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none' }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '26px' }}>
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 49,
            backgroundColor: 'rgba(20,19,19,0.97)',
            backdropFilter: 'blur(24px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '3rem',
          }}
          onClick={() => setMenuOpen(false)}
        >
          {[
            { href: '/',                    label: 'Home' },
            { href: '/products?category=new', label: 'New Arrivals' },
            { href: '/products',            label: 'Collections' },
            { href: '/about',               label: 'Our Story' },
            { href: '/cart',                label: 'Cart' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-headline-md"
              style={{
                color: 'var(--primary)',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontSize: '20px',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
