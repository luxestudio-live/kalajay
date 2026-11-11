'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Gift,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
    totalCount,
    formatINR,
    whatsappCheckoutUrl
  } = useCart();

  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const freeDeliveryThreshold = BRAND_CONFIG.shipping.freeThreshold;
  const amountToFreeShipping = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-editorial text-ink-light hover:text-rosewood mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Exploring Catalogue</span>
          </Link>
          <h1 className="font-serif text-4xl sm:text-5xl text-plum font-normal tracking-tight">
            Your Shopping Bag
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-ink-muted font-light">
            {totalCount === 0
              ? 'Your bag is currently empty.'
              : `${totalCount} handcrafted ${totalCount === 1 ? 'piece' : 'pieces'} staged for artisan handcraft.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {cart.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blush/40 flex items-center justify-center text-rosewood">
              <ShoppingBag className="w-8 h-8 text-rosewood" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-3xl text-plum">Your Bag is Empty</h2>
            <p className="text-xs text-ink-light leading-relaxed">
              Explore our handmade pearl vanity organisers, crystal evening bags, and artisanal tealight lanterns.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] text-xs uppercase tracking-editorial font-semibold rounded-full transition-colors"
              >
                <span>Browse All Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Left Items Column (Span 8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Delivery Bar */}
              <div className="bg-blush/40 p-4 rounded-sm border border-border-subtle text-xs text-ink">
                <div className="flex items-center justify-between mb-1.5 font-medium">
                  {amountToFreeShipping > 0 ? (
                    <span>
                      Add <strong className="text-rosewood">{formatINR(amountToFreeShipping)}</strong> more to unlock{' '}
                      <span className="text-rosewood font-semibold">Free Pan-India Delivery</span>
                    </span>
                  ) : (
                    <span className="text-rosewood font-semibold flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-rosewood" />
                      <span>Complimentary Pan-India Delivery Unlocked!</span>
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

              {/* Items List */}
              <div className="divide-y divide-border-subtle border-y border-border-subtle">
                {cart.map(item => (
                  <div key={item.key} className="py-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-24 bg-canvas-subtle rounded-sm overflow-hidden shrink-0 border border-border-subtle">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-refined text-ink-muted block font-medium">
                          {item.category} · {item.code}
                        </span>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-serif text-lg text-plum hover:text-rosewood transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.variantLabel && (
                          <p className="text-xs text-rosewood font-medium mt-0.5">
                            Colorway: {item.variantLabel}
                          </p>
                        )}
                        <p className="font-serif text-sm font-semibold text-plum sm:hidden mt-1">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls & Line Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="inline-flex items-center border border-border-medium rounded-full bg-canvas-subtle overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink hover:text-rosewood transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-plum font-serif">
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

                      <div className="text-right hidden sm:block min-w-[90px]">
                        <span className="font-serif text-base font-semibold text-plum">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="block text-[11px] text-ink-muted">
                            {formatINR(item.price)} each
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.key)}
                        className="text-ink-faint hover:text-rosewood p-2 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Complimentary Gifting Card Option */}
              <div className="p-6 bg-canvas-subtle rounded-sm border border-border-subtle space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={e => setIsGift(e.target.checked)}
                    className="w-4 h-4 accent-rosewood rounded-sm"
                  />
                  <div className="flex items-center gap-2 text-xs font-medium text-plum">
                    <Gift className="w-4 h-4 text-rosewood" />
                    <span>This order is a gift (Complimentary Handwritten Calligraphy Card & Wax Seal)</span>
                  </div>
                </label>

                {isGift && (
                  <div className="pt-2 animate-fade-in">
                    <label className="text-[11px] text-ink-light block mb-1">
                      Recipient Name & Handwritten Message:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. &apos;Happy Birthday Tara! May this handcrafted jewellery box hold all your sweetest memories. With love, Priya&apos;"
                      value={giftNote}
                      onChange={e => setGiftNote(e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-border-medium rounded-sm text-xs text-plum focus:outline-none focus:border-rosewood"
                    />
                  </div>
                )}
              </div>

              {/* Order Notes for Maker */}
              <div className="p-6 bg-canvas-subtle rounded-sm border border-border-subtle space-y-2">
                <label className="text-xs uppercase tracking-editorial text-plum font-bold block">
                  Artisan Delivery Instructions / Craft House Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions for our dispatch team (e.g. deliver after 4 PM, call on arrival, etc.)..."
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-border-medium rounded-sm text-xs text-plum focus:outline-none focus:border-rosewood"
                />
              </div>
            </div>

            {/* Right Summary Column (Span 4) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 bg-canvas-subtle p-6 sm:p-8 rounded-sm border border-border-medium shadow-xl space-y-6">
                <h3 className="font-serif text-2xl text-plum border-b border-border-subtle pb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs text-ink divide-y divide-border-subtle/60">
                  <div className="flex justify-between pt-1">
                    <span className="text-ink-muted">Subtotal ({totalCount} pieces)</span>
                    <span className="font-medium text-plum">{formatINR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between pt-3">
                    <span className="text-ink-muted">Pan-India Delivery</span>
                    <span className="font-medium text-plum">
                      {deliveryFee === 0 ? (
                        <span className="text-rosewood font-semibold">FREE</span>
                      ) : (
                        formatINR(deliveryFee)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3">
                    <span className="text-ink-muted">Gift Packaging</span>
                    <span className="text-rosewood font-semibold">COMPLIMENTARY</span>
                  </div>

                  <div className="flex justify-between pt-4 text-base font-semibold text-plum border-t border-border-subtle">
                    <span>Estimated Total</span>
                    <span className="font-serif text-2xl text-rosewood">{formatINR(total)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full py-4 px-6 bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] text-xs uppercase tracking-refined font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-md group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href={whatsappCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 sm:px-5 bg-canvas hover:bg-emerald-50/60 border border-emerald-700/30 hover:border-emerald-600 text-ink hover:text-emerald-950 text-xs rounded-full flex items-center justify-center gap-2.5 transition-all shadow-2xs group cursor-pointer"
                  >
                    <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5 shrink-0 object-contain" />
                    <span className="tracking-refined uppercase text-xs font-semibold whitespace-nowrap">
                      Order via WhatsApp
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium shrink-0 hidden sm:inline-block">
                      Instant Approval
                    </span>
                  </a>
                  <p className="text-[10px] text-ink-light text-center tracking-wide">
                    Direct Craft House concierge & instant order confirmation
                  </p>
                </div>

                <div className="p-4 bg-canvas rounded-sm border border-border-subtle text-[11px] text-ink-light space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-plum">
                    <ShieldCheck className="w-4 h-4 text-rosewood" />
                    <span>48-Hour Transit Protection</span>
                  </div>
                  <p>
                    Every Kalajay order is insured during transit. In case of any transit issue, we provide an immediate complimentary replacement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

