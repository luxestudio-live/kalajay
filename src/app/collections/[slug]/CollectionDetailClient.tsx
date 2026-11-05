'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Check, Gem, Filter } from 'lucide-react';
import { COLLECTIONS, PRODUCTS, Product } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';

interface CollectionDetailClientProps {
  slug?: string;
}

export default function CollectionDetailClient({ slug: propSlug }: CollectionDetailClientProps) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);

  const collection = COLLECTIONS.find(c => c.slug === slug);
  const { addToCart, formatINR } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('featured');

  if (!collection) {
    return notFound();
  }

  let products = PRODUCTS.filter(p => p.category === collection.name);

  // Sorting
  switch (sortOrder) {
    case 'price-asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'alpha':
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      break;
  }

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Collection Hero Banner */}
      <div className="relative bg-canvas-dark text-canvas py-16 sm:py-24 border-b border-plum-light/30 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rosewood/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-editorial text-champagne hover:underline mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Collections</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] uppercase tracking-refined text-champagne font-sans font-semibold block">
                Curated Edition · {products.length} {products.length === 1 ? 'Creation' : 'Creations'}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-canvas font-normal tracking-tight">
                {collection.name}
              </h1>
              <p className="font-serif italic text-lg sm:text-xl text-blush font-light">
                “{collection.tagline}”
              </p>
              <p className="text-xs sm:text-sm text-canvas/75 font-light leading-relaxed max-w-xl pt-2">
                {collection.description}
              </p>
            </div>

            {/* Collection Cover Showcase */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-canvas-darker border border-canvas/20 shadow-2xl">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Browsing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Sub-header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-border-subtle gap-4 text-xs text-ink">
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-gold" />
            <span className="font-medium text-plum">
              {products.length} {products.length === 1 ? 'Piece' : 'Pieces'} in {collection.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-ink-light">Sort by:</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="bg-canvas border border-border-medium px-3 py-1.5 rounded-sm text-xs text-plum focus:outline-none focus:border-rosewood cursor-pointer"
            >
              <option value="featured">Featured / Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="alpha">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Cards */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map(product => (
            <div
              key={product.id}
              className="group bg-canvas-subtle/40 rounded-sm border border-border-subtle overflow-hidden hover:border-rosewood/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <Link href={`/products/${product.slug}`} className="block relative">
                <div className="relative aspect-[4/5] bg-canvas overflow-hidden">
                  <img
                    src={product.coverImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {product.isBestSeller && (
                    <span className="absolute top-3 left-3 bg-plum text-canvas text-[11px] uppercase tracking-refined px-2.5 py-1 rounded-sm font-sans font-medium">
                      Icon
                    </span>
                  )}
                  {product.variants.length > 0 && (
                    <span className="absolute bottom-3 left-3 bg-canvas/90 backdrop-blur-sm text-plum text-[11px] font-medium px-2 py-0.5 rounded-sm border border-border-subtle">
                      {product.variants.length} Colors
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <span className="text-[11px] uppercase tracking-refined text-ink-muted block font-sans font-medium">
                    {product.code}
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
    </div>
  );
}

