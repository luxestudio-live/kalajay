'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Gem } from 'lucide-react';
import { COLLECTIONS, PRODUCTS } from '@/data/catalogue';

export default function CollectionsGallery() {
  // Count items per category
  const getCount = (name: string) => {
    return PRODUCTS.filter(p => p.category === name).length;
  };

  return (
    <section className="py-20 sm:py-28 bg-canvas relative overflow-hidden border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-6 border-b border-border-subtle gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
              <Gem className="w-3 h-3 text-gold" />
              <span>Chapter 03 · Collections as Art</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal tracking-tight">
              Curated Editions. <br />
              <span className="italic font-light text-rosewood">Tactile Sculptures.</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed mb-4">
              Explore nine distinct disciplines of handcraft—from radiant vanity architecture and structured evening clutches to intimate daily charms.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-editorial font-semibold text-plum hover:text-rosewood transition-colors group"
            >
              <span>Browse All 69 Handcrafted Pieces</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-rosewood" />
            </Link>
          </div>
        </div>

        {/* Asymmetric Curated Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Card 1: Organisers (Span 7) */}
          <div className="md:col-span-7">
            <Link
              href={`/collections/${COLLECTIONS[0].slug}`}
              className="group block relative aspect-[16/11] sm:aspect-[16/10] bg-canvas-subtle rounded-sm overflow-hidden border border-border-medium shadow-md"
            >
              <img
                src={COLLECTIONS[0].image}
                alt={COLLECTIONS[0].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/95 via-plum/50 to-transparent transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 right-6 text-canvas">
                <span className="text-[11px] uppercase tracking-refined text-champagne block mb-1 font-sans font-medium">
                  Collection 01 · {getCount(COLLECTIONS[0].name)} Pieces
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-canvas group-hover:text-champagne transition-colors">
                  {COLLECTIONS[0].name}
                </h3>
                <p className="text-xs text-canvas/80 font-light mt-1 max-w-md line-clamp-2">
                  {COLLECTIONS[0].tagline}
                </p>
              </div>
            </Link>
          </div>

          {/* Card 2: Purses (Span 5) */}
          <div className="md:col-span-5">
            <Link
              href={`/collections/${COLLECTIONS[1].slug}`}
              className="group block relative aspect-[16/11] sm:aspect-[16/14] md:aspect-auto md:h-full bg-canvas-subtle rounded-sm overflow-hidden border border-border-medium shadow-md"
            >
              <img
                src={COLLECTIONS[1].image}
                alt={COLLECTIONS[1].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/95 via-plum/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-canvas">
                <span className="text-[11px] uppercase tracking-refined text-champagne block mb-1 font-sans font-medium">
                  Collection 02 · {getCount(COLLECTIONS[1].name)} Pieces
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-canvas group-hover:text-champagne transition-colors">
                  {COLLECTIONS[1].name}
                </h3>
                <p className="text-xs text-canvas/80 font-light mt-1">
                  {COLLECTIONS[1].tagline}
                </p>
              </div>
            </Link>
          </div>

          {/* Card 3: Slings (Span 4) */}
          <div className="md:col-span-4">
            <Link
              href={`/collections/${COLLECTIONS[2].slug}`}
              className="group block relative aspect-[4/5] bg-canvas-subtle rounded-sm overflow-hidden border border-border-medium shadow-md"
            >
              <img
                src={COLLECTIONS[2].image}
                alt={COLLECTIONS[2].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/95 via-plum/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-canvas">
                <span className="text-[11px] uppercase tracking-refined text-champagne block mb-1 font-sans font-medium">
                  Collection 03 · {getCount(COLLECTIONS[2].name)} Pieces
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-canvas group-hover:text-champagne transition-colors">
                  {COLLECTIONS[2].name}
                </h3>
                <p className="text-xs text-canvas/80 font-light mt-1">
                  {COLLECTIONS[2].tagline}
                </p>
              </div>
            </Link>
          </div>

          {/* Card 4: AirPod Cases (Span 4) */}
          <div className="md:col-span-4">
            <Link
              href={`/collections/${COLLECTIONS[3].slug}`}
              className="group block relative aspect-[4/5] bg-canvas-subtle rounded-sm overflow-hidden border border-border-medium shadow-md"
            >
              <img
                src={COLLECTIONS[3].image}
                alt={COLLECTIONS[3].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/95 via-plum/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-canvas">
                <span className="text-[11px] uppercase tracking-refined text-champagne block mb-1 font-sans font-medium">
                  Collection 04 · {getCount(COLLECTIONS[3].name)} Pieces
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-canvas group-hover:text-champagne transition-colors">
                  {COLLECTIONS[3].name}
                </h3>
                <p className="text-xs text-canvas/80 font-light mt-1">
                  {COLLECTIONS[3].tagline}
                </p>
              </div>
            </Link>
          </div>

          {/* Card 5: Coasters & Candle Holders (Span 4) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <Link
              href={`/collections/${COLLECTIONS[4].slug}`}
              className="group block relative aspect-[16/10] bg-canvas-subtle rounded-sm overflow-hidden border border-border-medium shadow-md"
            >
              <img
                src={COLLECTIONS[4].image}
                alt={COLLECTIONS[4].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/95 via-plum/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-canvas">
                <span className="text-[11px] uppercase tracking-refined text-champagne block font-sans font-medium">
                  Collection 05 · {getCount(COLLECTIONS[4].name)} Pieces
                </span>
                <h4 className="font-serif text-lg text-canvas group-hover:text-champagne transition-colors">
                  {COLLECTIONS[4].name}
                </h4>
              </div>
            </Link>

            <Link
              href={`/collections/${COLLECTIONS[5].slug}`}
              className="group block relative aspect-[16/10] bg-canvas-subtle rounded-sm overflow-hidden border border-border-medium shadow-md"
            >
              <img
                src={COLLECTIONS[5].image}
                alt={COLLECTIONS[5].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/95 via-plum/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-canvas">
                <span className="text-[11px] uppercase tracking-refined text-champagne block font-sans font-medium">
                  Collection 06 · {getCount(COLLECTIONS[5].name)} Pieces
                </span>
                <h4 className="font-serif text-lg text-canvas group-hover:text-champagne transition-colors">
                  {COLLECTIONS[5].name}
                </h4>
              </div>
            </Link>
          </div>
        </div>

        {/* Lower Row: Key Rings, Crochet Magic, Little Treasures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {COLLECTIONS.slice(6, 9).map((col, idx) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="group block relative aspect-[4/3] bg-canvas-subtle rounded-sm overflow-hidden border border-border-medium shadow-md"
            >
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/95 via-plum/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-canvas">
                <span className="text-[11px] uppercase tracking-refined text-champagne block font-sans font-medium">
                  Edition 0{idx + 7} · {getCount(col.name)} Pieces
                </span>
                <h4 className="font-serif text-xl text-canvas group-hover:text-champagne transition-colors">
                  {col.name}
                </h4>
                <p className="text-xs text-canvas/85 font-light truncate mt-0.5">
                  {col.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

