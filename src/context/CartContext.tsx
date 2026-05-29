'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  qty: number;
  size: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id: string; name: string; subtitle: string; price: number; image: string }, size: string, qty?: number) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQty: (id: string, size: string, delta: number) => void;
  cartCount: number;
  clearCart: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('solarth_cart');
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('solarth_cart', JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  const addToCart = (
    product: { id: string; name: string; subtitle: string; price: number; image: string },
    size: string,
    qty = 1
  ) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && item.size === size);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          qty: next[existingIdx].qty + qty,
        };
        return next;
      }
      return [...prev, { ...product, qty, size }];
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQty = (id: string, size: string, delta: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id && item.size === size
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        cartCount,
        clearCart,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
