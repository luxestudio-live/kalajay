'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Heart, Check } from 'lucide-react';
import { PRODUCTS, Product } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';

export default function ObjectsOfAffection() {
  const { addToCart, formatINR } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  // Curate 8 signature pieces across multiple categories
  const signaturePieces = PRODUCTS.slice(0, 8);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section className="py-20 sm:py-28 bg-canvas relative overflow-hidden border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-6 border-b border-border-subtle gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
              <Heart className="w-3 h-3 text-rosewood" />
              <span>Chapter 05 · Objects of Affection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal tracking-tight">
              Signature Works. <br />
              <span className="italic font-light text-rosewood">Patiently Hand-Strung.</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed mb-4">
              Our most celebrated creations—sculptural vanity organisers, luminous evening clutches, and iridescent daily talismans.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-editorial font-semibold text-plum hover:text-rosewood transition-colors group"
            >
              <span>Explore All Storefront Editions</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-rosewood" />
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {signaturePieces.map((product, idx) => (
            <div
              key={product.id}
              className="group bg-canvas-subtle/50 rounded-sm border border-border-subtle overflow-hidden hover:border-rosewood/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <Link href={`/products/${product.slug}`} className="block relative">
                {/* Product Image Frame */}
                <div className="relative aspect-[4/5] bg-canvas overflow-hidden">
                  <img
                    src={product.coverImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle Badge */}
                  {product.isBestSeller && (
                    <span className="absolute top-3 left-3 bg-plum text-canvas text-[11px] uppercase tracking-refined px-2.5 py-1 rounded-sm font-sans font-medium">
                      Craft House Signature
                    </span>
                  )}
                  {product.variants.length > 0 && (
                    <span className="absolute bottom-3 left-3 bg-canvas/90 backdrop-blur-sm text-plum text-[11px] font-medium px-2 py-0.5 rounded-sm border border-border-subtle">
                      {product.variants.length} Colorways
                    </span>
                  )}
                </div>

                {/* Product Meta */}
                <div className="p-4 sm:p-5">
                  <span className="text-[11px] uppercase tracking-refined text-ink-muted block font-sans font-medium">
                    {product.category} · {product.code}
                  </span>
                  <h3 className="font-serif text-lg text-plum group-hover:text-rosewood transition-colors mt-1 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-serif text-base text-rosewood font-semibold">
                      {formatINR(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-ink-faint line-through">
                        {formatINR(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Quick Add Button */}
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(product, e)}
                  className={`w-full py-2.5 px-3 rounded-sm text-xs uppercase tracking-editorial font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    addedId === product.id
                      ? 'bg-rosewood text-canvas'
                      : 'bg-canvas border border-border-medium text-plum hover:bg-plum hover:text-canvas hover:border-plum'
                  }`}
                >
                  {addedId === product.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

