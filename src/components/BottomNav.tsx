'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const navItems = [
  { href: '/',          label: 'Home',       icon: 'home' },
  { href: '/products',  label: 'Shop',       icon: 'grid_view' },
  { href: '/cart',      label: 'Cart',       icon: 'shopping_bag' },
  { href: '/about',     label: 'About',      icon: 'favorite' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount, isHydrated } = useCart();

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href === '/products' && pathname.startsWith('/products'));
        const isCart = item.href === '/cart';

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {isCart && isHydrated && cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-7px',
                  backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
                  fontSize: '8px', fontWeight: 700,
                  width: '14px', height: '14px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
