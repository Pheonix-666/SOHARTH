'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  qty: number;
  size: string;
  color?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id: string; name: string; subtitle: string; price: number; image: string }, size: string, color?: string, qty?: number) => void;
  removeFromCart: (id: string, size: string, color?: string) => void;
  updateQty: (id: string, size: string, delta: number, color?: string) => void;
  cartCount: number;
  clearCart: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Ref to prevent initial sync override
  const initialLoadDone = useRef(false);

  // Load cart from localStorage or DB on mount / auth change
  useEffect(() => {
    async function initCart() {
      // 1. Get local cart
      let localCart: CartItem[] = [];
      const stored = localStorage.getItem('soharth_cart');
      if (stored) {
        try {
          localCart = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse cart from localStorage:', e);
        }
      }

      setCart(localCart);
      
      setIsHydrated(true);
      initialLoadDone.current = true;
    }

    initCart();
  }, []); // Run once on mount

  // Save cart to localStorage and DB whenever it changes
  useEffect(() => {
    if (isHydrated && initialLoadDone.current) {
      // 1. Always save to local
      localStorage.setItem('soharth_cart', JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  const addToCart = (
    product: { id: string; name: string; subtitle: string; price: number; image: string },
    size: string,
    color?: string,
    qty = 1
  ) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && item.size === size && item.color === color);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          qty: next[existingIdx].qty + qty,
        };
        return next;
      }
      return [...prev, { ...product, qty, size, color }];
    });
  };

  const removeFromCart = (id: string, size: string, color?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size && item.color === color)));
  };

  const updateQty = (id: string, size: string, delta: number, color?: string) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id && item.size === size && item.color === color
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
