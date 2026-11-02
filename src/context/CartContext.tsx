'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, BRAND_CONFIG } from '@/data/catalogue';

export interface CartItem {
  key: string;
  id: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  variantLabel?: string;
  variantCode?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, qty: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  formatINR: (val: number) => string;
  whatsappCheckoutUrl: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kalajay_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('kalajay_cart', JSON.stringify(cart));
      } catch {
        // ignore
      }
    }
  }, [cart, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const itemPrice = variant ? variant.price : product.price;
    const itemImg = variant?.image || product.coverImage;
    const variantLabel = variant?.label;
    const variantCode = variant?.code || product.code;
    const key = variantCode ? `${product.code}-${variantCode}` : product.code;

    setCart(prev => {
      const existing = prev.find(item => item.key === key);
      if (existing) {
        return prev.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          code: product.code,
          slug: product.slug,
          name: product.name,
          category: product.category,
          price: itemPrice,
          image: itemImg,
          variantLabel,
          variantCode,
          quantity
        }
      ];
    });

    setIsOpen(true);
  };

  const removeFromCart = (key: string) => {
    setCart(prev => prev.filter(item => item.key !== key));
  };

  const updateQuantity = (key: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(key);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.key === key ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= BRAND_CONFIG.shipping.freeThreshold ? 0 : BRAND_CONFIG.shipping.standardRate;
  const total = subtotal + deliveryFee;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const orderLines = cart.map(item => 
    `• ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} × ${item.quantity} = ${formatINR(item.price * item.quantity)}`
  ).join('\n');

  const waMessage = cart.length
    ? `Hi Kalajay! I would like to order the following handcrafted pieces:\n\n${orderLines}\n\nSubtotal: ${formatINR(subtotal)}\nDelivery: ${deliveryFee === 0 ? 'Free' : formatINR(deliveryFee)}\nTotal Order Value: ${formatINR(total)}\n\nPlease let me know how to proceed with payment and dispatch details!`
    : `Hi Kalajay! I'm browsing the digital flagship and would like to know more about your bespoke pieces.`;

  const whatsappCheckoutUrl = `https://wa.me/919740540847?text=${encodeURIComponent(waMessage)}`;

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        deliveryFee,
        total,
        formatINR,
        whatsappCheckoutUrl
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

