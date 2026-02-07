import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  set: string;
  collector_number: string;
  quantity: number;
  price_cents: number | null;
  artist?: string;
}

interface CartContextType {
  cart: Map<string, CartItem>;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  getCartQuantity: (key: string) => number;
  getTotalCartItems: () => number;
  getCartTotal: () => number;
  getSortedCartItems: () => CartItem[];
}

const CART_STORAGE_KEY = 'mtgac-cart';

const loadCartFromStorage = (): Map<string, CartItem> => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(parsed);
    }
  } catch (e) {
    console.error('Failed to load cart from storage:', e);
  }
  return new Map();
};

const saveCartToStorage = (cart: Map<string, CartItem>) => {
  try {
    const serialized = JSON.stringify(Array.from(cart.entries()));
    localStorage.setItem(CART_STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save cart to storage:', e);
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Map<string, CartItem>>(() => loadCartFromStorage());

  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const key = `${item.set}-${item.collector_number}`;
    setCart(prevCart => {
      const newCart = new Map(prevCart);
      const existing = newCart.get(key);
      if (existing) {
        newCart.set(key, { ...existing, quantity: existing.quantity + 1 });
      } else {
        newCart.set(key, {
          ...item,
          quantity: item.quantity || 1,
        });
      }
      return newCart;
    });
  };

  const removeFromCart = (key: string) => {
    setCart(prevCart => {
      const newCart = new Map(prevCart);
      const existing = newCart.get(key);
      if (existing && existing.quantity > 1) {
        newCart.set(key, { ...existing, quantity: existing.quantity - 1 });
      } else {
        newCart.delete(key);
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart(new Map());
  };

  const getCartQuantity = (key: string): number => {
    return cart.get(key)?.quantity || 0;
  };

  const getTotalCartItems = (): number => {
    let total = 0;
    cart.forEach(item => total += item.quantity);
    return total;
  };

  const getCartTotal = (): number => {
    let total = 0;
    cart.forEach(item => {
      if (item.price_cents) {
        total += item.price_cents * item.quantity;
      }
    });
    return total;
  };

  const getSortedCartItems = (): CartItem[] => {
    return Array.from(cart.values()).sort((a, b) => {
      const artistA = (a.artist || '').toLowerCase();
      const artistB = (b.artist || '').toLowerCase();
      if (artistA !== artistB) {
        return artistA.localeCompare(artistB);
      }
      // Secondary sort by card name
      return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
    });
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      getCartQuantity,
      getTotalCartItems,
      getCartTotal,
      getSortedCartItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
