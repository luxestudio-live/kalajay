'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Gem, Check } from 'lucide-react';
import { PRODUCTS, Product } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { addToCart, formatINR } = useCart();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kalajay_wishlist');
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      } else {
        // Default sample curated pieces for new visitors
        const sampleIds = [PRODUCTS[0]?.id, PRODUCTS[3]?.id, PRODUCTS[8]?.id].filter(Boolean);
        setWishlistIds(sampleIds);
      }
    } catch {
      // fallback
    }
  }, []);

  const removeFromWishlist = (id: string) => {
    const updated = wishlistIds.filter((item) => item !== id);
    setWishlistIds(updated);
    try {
      localStorage.setItem('kalajay_wishlist', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleMoveToBag = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
      removeFromWishlist(product.id);
    }, 1200);
  };

  const wishlistProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[10px] font-sans uppercase tracking-monumental font-semibold mb-4 shadow-2xs">
            <Heart className="w-3 h-3 text-rosewood fill-rosewood" />
            <span>Private Patron Vault</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-plum font-normal tracking-tight">
            Your Saved Pieces
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-xl mx-auto">
            Treasures reserved for upcoming milestones, wedding trousseaus, and personal celebrations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {wishlistProducts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blush/40 flex items-center justify-center text-rosewood">
              <Heart className="w-8 h-8 text-gold" />
            </div>
            <h2 className="font-serif text-3xl text-plum">Your Wishlist is Empty</h2>
            <p className="text-xs text-ink-light leading-relaxed">
              Explore our handmade pearl vanity organisers, crystal evening bags, and artisanal tealight lanterns to begin curating your private collection.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors"
              >
                <span>Browse All Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-xs text-ink-muted border-b border-border-subtle pb-4">
              <span>{wishlistProducts.length} {wishlistProducts.length === 1 ? 'piece' : 'pieces'} saved in your private vault</span>
              <Link href="/shop" className="text-rosewood hover:underline font-medium">
                Continue Browsing Catalogue →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistProducts.map((product) => {
                const isAdded = addedId === product.id;
                return (
                  <div
                    key={product.id}
                    className="bg-canvas border border-border-subtle rounded-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-square bg-canvas-subtle overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.coverImage || product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label="Remove from wishlist"
                        className="absolute top-3 right-3 p-2 bg-canvas/90 hover:bg-white text-ink-light hover:text-rosewood rounded-full shadow-xs transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-monumental text-rosewood font-sans font-semibold block mb-1">
                          {product.category}
                        </span>
                        <h3 className="font-serif text-lg text-plum leading-snug">
                          <Link href={`/products/${product.slug}`} className="hover:text-rosewood transition-colors">
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-ink-muted font-light line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border-subtle/80 flex items-center justify-between">
                        <span className="font-serif text-base text-plum font-normal">
                          {formatINR(product.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveToBag(product)}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-[11px] font-sans font-semibold uppercase tracking-refined transition-all ${
                            isAdded
                              ? 'bg-emerald-800 text-canvas'
                              : 'bg-plum hover:bg-rosewood text-canvas'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added to Bag</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Move to Bag</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

