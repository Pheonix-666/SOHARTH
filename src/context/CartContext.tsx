'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
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

      if (user) {
        // 2. Fetch DB cart
        try {
          const res = await fetch(`/api/cart?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            const dbCart: CartItem[] = data.items || [];
            
            // 3. Merge: Local cart items overwrite DB cart items if there is a conflict (based on id + size)
            // Amazon style: keep both.
            const mergedCart = [...dbCart];
            localCart.forEach(localItem => {
              const existingIdx = mergedCart.findIndex(dbItem => dbItem.id === localItem.id && dbItem.size === localItem.size);
              if (existingIdx > -1) {
                // If it exists, add quantities together
                mergedCart[existingIdx].qty += localItem.qty;
              } else {
                mergedCart.push(localItem);
              }
            });

            setCart(mergedCart);
            // Optionally, clear local cart now that it's merged, or keep it perfectly in sync
            localStorage.setItem('soharth_cart', JSON.stringify(mergedCart));
            
            // Force sync to DB if merge happened
            if (localCart.length > 0) {
              await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, items: mergedCart })
              });
            }
          }
        } catch (err) {
          console.error('Failed to sync cart on login', err);
          setCart(localCart);
        }
      } else {
        // Not logged in, just use local
        setCart(localCart);
      }
      
      setIsHydrated(true);
      initialLoadDone.current = true;
    }

    initCart();
  }, [user]); // Re-run when user changes (login/logout)

  // Save cart to localStorage and DB whenever it changes
  useEffect(() => {
    if (isHydrated && initialLoadDone.current) {
      // 1. Always save to local
      localStorage.setItem('soharth_cart', JSON.stringify(cart));
      
      // 2. Sync to DB if logged in
      if (user) {
        // Simple debounce could go here, but fetch is fine for small changes
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, items: cart })
        }).catch(err => console.error('Failed to backup cart to DB', err));
      }
    }
  }, [cart, isHydrated, user]);

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
