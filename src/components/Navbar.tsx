'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileTimeout = useRef<NodeJS.Timeout | null>(null);

  const { cartCount, isHydrated } = useCart();
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();

  const handleProfileEnter = () => {
    if (profileTimeout.current) clearTimeout(profileTimeout.current);
    setProfileDropdownOpen(true);
  };
  const handleProfileLeave = () => {
    profileTimeout.current = setTimeout(() => setProfileDropdownOpen(false), 200);
  };

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
        className={`glass-nav ${scrolled ? 'scrolled' : ''} ${pathname?.startsWith('/products/') ? 'nav-product-page' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Left Area: Links (Desktop) / Logo (Mobile) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <div className="nav-left desktop-only" style={{ display: 'flex', gap: '2rem' }}>
              <Link href="/products?category=new" className="nav-link">New Arrivals</Link>
              <Link href="/products" className="nav-link">Collections</Link>
            </div>
            <Link href="/" className="nav-logo-link mobile-flex" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logo.jpg" alt="Soharth" width={36} height={36} priority style={{ objectFit: 'contain', borderRadius: '50%' }} />
            </Link>
          </div>

          {/* Center Area: Logo (Desktop) / Empty (Mobile) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link href="/" className="nav-logo-link desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logo.jpg" alt="Soharth" width={44} height={44} priority style={{ objectFit: 'contain', borderRadius: '50%' }} />
            </Link>
          </div>

          {/* Right Area: Actions */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
            <Link href="/about" className="nav-link nav-right-link desktop-only">Our Story</Link>

            {/* Profile / Login */}
            {user ? (
              <div 
                className="desktop-only" 
                style={{ position: 'relative' }}
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <Link href="/account" className="nav-link nav-right-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0' }}>
                  Hello, {profile?.full_name ? profile.full_name.split(' ')[0] : 'User'}
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', transition: 'transform 0.3s', transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>arrow_drop_down</span>
                </Link>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '200px',
                    background: 'rgba(15,15,15,0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(229,226,224,0.1)',
                    borderRadius: '4px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    zIndex: 100
                  }}>
                    <div style={{ borderBottom: '1px solid rgba(229,226,224,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--primary)', fontSize: '13px', display: 'block' }}>{profile?.full_name || 'User'}</span>
                      <span style={{ color: 'var(--on-surface-variant)', fontSize: '11px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
                    </div>
                    <Link href="/account" className="nav-link" style={{ fontSize: '12px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                      Your Profile
                    </Link>
                    <Link href="/account" className="nav-link" style={{ fontSize: '12px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>inventory_2</span>
                      Your Orders
                    </Link>
                    <button 
                      onClick={() => { setProfileDropdownOpen(false); signOut(); }}
                      className="nav-link" 
                      style={{ fontSize: '12px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ff4b4b' }}>logout</span>
                      <span style={{ color: '#ff4b4b' }}>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="nav-link nav-right-link desktop-only">
                Sign In
              </Link>
            )}

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

            {/* Hamburger */}
            <button
              className="nav-burger mobile-only"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
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
            { href: user ? '/account' : '/auth/login', label: user ? 'Account' : 'Sign In' },
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
