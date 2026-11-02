'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';
import { GIFTING_PACKAGES } from '@/data/extras';
import { useCart } from '@/context/CartContext';

export default function ArtOfGiving() {
  const { formatINR } = useCart();

  return (
    <section className="py-20 sm:py-28 bg-canvas-subtle/50 relative overflow-hidden border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-6 border-b border-border-subtle gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
              <Gift className="w-3 h-3" />
              <span>Chapter 08 · The Art of Giving</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal tracking-tight">
              Curated Hampers. <br />
              <span className="italic font-light text-rosewood">Unforgettable Celebrations.</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed mb-4">
              From intimate personalised birthday keepsakes to 500-piece bespoke bridal favours. We coordinate custom packaging, handwritten calligraphy notes, and doorstep delivery across India.
            </p>
            <Link
              href="/corporate-gifting"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-editorial font-semibold text-plum hover:text-rosewood transition-colors group"
            >
              <span>Explore Wedding & Corporate Inquiries</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-rosewood" />
            </Link>
          </div>
        </div>

        {/* Gifting Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {GIFTING_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="group bg-canvas rounded-sm border border-border-subtle overflow-hidden hover:border-rosewood/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[4/3] bg-canvas-subtle overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-plum/90 backdrop-blur-sm text-champagne text-[11px] uppercase tracking-refined px-2.5 py-1 rounded-sm font-sans font-medium">
                    {pkg.category}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-1">
                    Lead time: {pkg.leadTime}
                  </span>
                  <h3 className="font-serif text-xl text-plum group-hover:text-rosewood transition-colors leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-ink-muted font-light mt-2 line-clamp-2 leading-relaxed">
                    {pkg.subtitle}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-baseline justify-between text-xs">
                    <span className="text-ink-muted">Starting from:</span>
                    <span className="font-serif text-base text-plum font-semibold">
                      {formatINR(pkg.startingPrice)} <span className="text-[11px] font-sans font-normal text-ink-muted">/ piece</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="p-5 pt-0">
                <Link
                  href="/gifting"
                  className="w-full py-2.5 bg-canvas-subtle hover:bg-plum hover:text-canvas border border-border-subtle text-plum text-xs uppercase tracking-editorial font-medium rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Gifting Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

