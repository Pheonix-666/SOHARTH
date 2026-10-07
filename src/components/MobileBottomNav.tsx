'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, isHydrated } = useCart();
  const [isVisible, setIsVisible] = useState(true);
  const [lastY, setLastY] = useState(0);

  // Auto-hide slightly when scrolling fast down, reveal on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 150) {
        setIsVisible(currentY < lastY || currentY < 100);
      } else {
        setIsVisible(true);
      }
      setLastY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastY]);

  // Don't show redundant bottom nav on product detail pages if they have their own sticky buy button,
  // or show a streamlined version
  const isProductDetail = pathname?.startsWith('/products/') && pathname !== '/products';
  if (isProductDetail) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Home', icon: 'home_app_logo' },
    { href: '/products', label: 'Explore', icon: 'grid_view' },
    { href: '/products?category=ethnic', label: 'Ethnic', icon: 'auto_awesome' },
    { href: '/cart', label: 'Bag', icon: 'local_mall', badge: cartCount },
  ];

  return (
    <nav
      className="mobile-bottom-nav mobile-only"
      style={{
        position: 'fixed',
        bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(140%)',
        zIndex: 90,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        width: 'calc(100% - 24px)',
        maxWidth: '400px',
        touchAction: 'manipulation',
      }}
      aria-label="Mobile Navigation"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          alignItems: 'center',
          backgroundColor: 'rgba(14, 14, 14, 0.92)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '32px',
          padding: '4px 6px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75), 0 0 1px rgba(255, 255, 255, 0.3) inset',
        }}
      >
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : item.href === '/products'
              ? pathname === '/products' && !window?.location?.search?.includes('category=ethnic')
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '48px',
                padding: '6px 4px',
                borderRadius: '24px',
                textDecoration: 'none',
                position: 'relative',
                color: isActive ? '#ffffff' : 'rgba(200, 199, 190, 0.65)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '22px',
                    color: isActive ? '#fde047' : 'inherit',
                    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                    transition: 'transform 0.2s ease',
                    transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  {item.icon}
                </span>

                {/* Badge for Bag */}
                {item.badge !== undefined && isHydrated && item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-10px',
                      backgroundColor: '#fde047',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: 800,
                      minWidth: '16px',
                      height: '16px',
                      padding: '0 3px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: '9px',
                  fontWeight: isActive ? 800 : 500,
                  letterSpacing: '0.08em',
                  marginTop: '3px',
                  textTransform: 'uppercase',
                  color: isActive ? '#ffffff' : 'inherit',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
