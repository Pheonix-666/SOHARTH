'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: 'home', href: '/' },
    { label: 'Search', icon: 'search', href: '/search' },
    { label: 'Cart', icon: 'shopping_bag', href: '/cart' },
    { label: 'Profile', icon: 'person', href: '/login' },
  ];

  return (
    <nav className="bottom-nav mobile-only">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`bottom-nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined bottom-nav-icon" style={{ fontVariationSettings: pathname === item.href ? "'FILL' 1" : "'FILL' 0" }}>
            {item.icon}
          </span>
        </Link>
      ))}
    </nav>
  );
}
