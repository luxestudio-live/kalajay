'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Gem, Heart } from 'lucide-react';
import { ARTISAN_STORIES } from '@/data/extras';

export default function HumanHandsAtelier() {
  return (
    <section className="py-20 sm:py-28 bg-canvas-subtle/70 relative overflow-hidden border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
            <Gem className="w-3 h-3 text-gold" />
            <span>Chapter 06 · Made by Human Hands</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal tracking-tight">
            The Women Behind the Shimmer. <br />
            <span className="italic font-light text-rosewood">21 Artisans Across 2 Cities.</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted font-light mt-4 leading-relaxed max-w-xl">
            Kalajay is not an industrial manufacturer. We are an artisanal sisterhood. Our production collective provides sustainable living wages, creative autonomy, and dignified livelihoods to our master women artisans.
          </p>
        </div>

        {/* 3 Artisan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTISAN_STORIES.map((artisan, idx) => (
            <div
              key={artisan.name}
              className="bg-canvas p-6 sm:p-8 rounded-sm border border-border-subtle shadow-sm flex flex-col justify-between relative group hover:border-rosewood/40 transition-colors"
            >
              <div>
                <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-2">
                  Atelier Artisan 0{idx + 1}
                </span>
                <h3 className="font-serif text-2xl text-plum mb-1">
                  {artisan.name}
                </h3>
                <p className="text-xs text-ink-light font-sans mb-4">
                  {artisan.location} · {artisan.experience}
                </p>
                <div className="text-2xl text-champagne font-serif mb-2 leading-none">“</div>
                <p className="text-xs sm:text-sm text-ink-muted font-light italic leading-relaxed">
                  {artisan.quote}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border-subtle/80 flex items-center justify-between text-[11px] text-ink-light">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rosewood fill-rosewood" />
                  <span>Master Bead Artisan</span>
                </span>
                <span className="font-serif italic text-rosewood">Kalajay Atelier</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 sm:p-8 bg-plum text-canvas rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-xl sm:text-2xl text-canvas">
              Every Purchase Directly Sustains Independent Women Makers.
            </h4>
            <p className="text-xs text-canvas/70 font-light">
              We practice transparent pricing, fair remuneration, and safe atelier working conditions.
            </p>
          </div>
          <Link
            href="/atelier"
            className="shrink-0 px-6 py-3 bg-champagne hover:bg-champagne-light text-plum text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors flex items-center gap-2"
          >
            <span>Learn About Our Ateliers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

