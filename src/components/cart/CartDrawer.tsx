'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, MessageCircle, ShieldCheck, Gem } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
    totalCount,
    formatINR,
    whatsappCheckoutUrl
  } = useCart();

  if (!isOpen) return null;

  const freeDeliveryThreshold = BRAND_CONFIG.shipping.freeThreshold;
  const amountToFreeShipping = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-plum/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-canvas shadow-2xl flex flex-col justify-between animate-fade-in border-l border-border-subtle">
          {/* Header */}
          <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-canvas-subtle/50">
            <div>
              <h2 className="font-serif text-2xl tracking-wide text-plum font-normal">
                Your Shopping Bag
              </h2>
              <p className="text-xs text-ink-light font-sans mt-0.5">
                {totalCount === 0
                  ? 'No pieces added yet'
                  : `${totalCount} handcrafted ${totalCount === 1 ? 'piece' : 'pieces'} selected`}
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-2 text-ink hover:text-rosewood transition-colors focus:outline-none"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.length > 0 && (
            <div className="bg-blush/40 px-6 py-3 border-b border-border-subtle text-xs text-ink">
              <div className="flex items-center justify-between mb-1.5 font-medium">
                {amountToFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-rosewood">{formatINR(amountToFreeShipping)}</strong> more for{' '}
                    <span className="text-rosewood font-semibold">Free Pan-India Delivery</span>
                  </span>
                ) : (
                  <span className="text-rosewood font-semibold flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5 text-gold" />
                    <span>Unlocked: Free Delivery across India!</span>
                  </span>
                )}
                <span className="text-[11px] text-ink-light">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden border border-border-subtle">
                <div
                  className="bg-rosewood h-full rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-blush/50 flex items-center justify-center text-rosewood">
                  <Gem className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl text-plum">Your bag is empty</h3>
                <p className="text-xs text-ink-light max-w-xs mx-auto leading-relaxed">
                  Discover our handmade jewel boxes, beaded evening bags, and radiant tealight lanterns.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-plum hover:bg-plum-light text-canvas text-xs uppercase tracking-editorial font-medium rounded-sm transition-colors"
                  >
                    <span>Explore the Catalogue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.key}
                  className="flex gap-4 pb-6 border-b border-border-subtle last:border-b-0"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-canvas-subtle rounded-sm overflow-hidden shrink-0 border border-border-subtle">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-base text-plum hover:text-rosewood transition-colors leading-snug"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.key)}
                          className="text-ink-faint hover:text-rosewood p-1 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.variantLabel && (
                        <p className="text-[11px] text-rosewood font-medium mt-0.5">
                          Variant: {item.variantLabel}
                        </p>
                      )}
                      <p className="text-[11px] text-ink-light">
                        {item.category} · {item.code}
                      </p>
                    </div>

                    {/* Quantity & Line Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-border-medium rounded-full bg-canvas-subtle/80 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink hover:text-rosewood transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-semibold text-plum font-serif">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink hover:text-rosewood transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-medium text-plum font-serif text-sm">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="block text-[11px] text-ink-muted">
                            {formatINR(item.price)} each
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-canvas-subtle/70 border-t border-border-subtle space-y-4">
              <div className="space-y-1.5 text-xs text-ink">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-medium text-plum">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Pan-India Delivery</span>
                  <span className="font-medium text-plum">
                    {deliveryFee === 0 ? (
                      <span className="text-rosewood font-semibold">FREE</span>
                    ) : (
                      formatINR(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border-subtle text-sm font-semibold text-plum">
                  <span>Estimated Total</span>
                  <span className="font-serif text-lg">{formatINR(total)}</span>
                </div>
                <p className="text-[11px] text-ink-muted italic pt-0.5">
                  Includes all taxes. Each item is handcrafted to order.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 px-6 bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] font-semibold text-xs uppercase tracking-refined flex items-center justify-center gap-2 rounded-full transition-all shadow-md group cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href={whatsappCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-canvas hover:bg-emerald-50/50 border border-emerald-700/30 hover:border-emerald-600 text-ink hover:text-emerald-950 font-medium text-xs flex items-center justify-center gap-2 rounded-full transition-all shadow-2xs group cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                    <MessageCircle className="w-2.5 h-2.5" />
                  </span>
                  <span className="tracking-refined uppercase text-[11px] font-semibold">
                    Order via WhatsApp
                  </span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-ink-muted pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rosewood" />
                <span>Transit Guarantee · 48-Hour Damage Replacement</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

