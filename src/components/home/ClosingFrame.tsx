'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Gem } from 'lucide-react';

export default function ClosingFrame() {
  return (
    <section className="py-24 sm:py-32 bg-canvas relative overflow-hidden border-b border-border-subtle text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold mb-6">
          <Gem className="w-3 h-3 text-gold" />
          <span>Chapter 10 · The Closing Frame</span>
        </div>

        <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-plum font-normal leading-[1.05] tracking-tight uppercase">
          A little wonder <br />
          <span className="italic font-light text-rosewood lowercase">
            goes a long way.
          </span>
        </h2>

        <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-ink-muted font-light leading-relaxed">
          Crafted with patience. Sustaining 21 independent women makers. Ready to bring tactile beauty, colour, and quiet ceremony to your home.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-4 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-monumental font-semibold rounded-sm transition-all shadow-md flex items-center justify-center gap-3 group"
          >
            <span>Explore All 69 Creations</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/customise"
            className="w-full sm:w-auto px-8 py-4 bg-canvas hover:bg-blush/30 border border-border-strong text-plum hover:text-rosewood text-xs uppercase tracking-monumental font-medium rounded-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Bespoke Studio</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

