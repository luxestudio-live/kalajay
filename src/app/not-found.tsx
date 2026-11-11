'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-canvas min-h-[75vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-xl mx-auto text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[10px] font-sans uppercase tracking-monumental font-semibold">
          <Compass className="w-3 h-3 text-gold" />
          <span>Error 404 · Uncharted Space</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl text-ink font-normal tracking-tight">
          Lost in the Craft House
        </h1>

        <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-md mx-auto">
          The creation or chronicle you are seeking has been moved, renamed, or safely returned to the archive. Let us guide you back to our curated editions.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors"
          >
            <span>Return to Flagship Home</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-canvas border border-border-strong text-plum hover:text-rosewood text-xs uppercase tracking-editorial font-medium rounded-sm transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-rosewood" />
            <span>Browse All 69 Pieces</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

