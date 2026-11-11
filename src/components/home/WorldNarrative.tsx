'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Compass } from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function WorldNarrative() {
  return (
    <section className="py-20 sm:py-28 bg-canvas-subtle/50 relative overflow-hidden border-b border-border-subtle">
      {/* Decorative Watermark Typography in Background */}
      <div
        aria-hidden="true"
        role="presentation"
        className="absolute right-0 top-1/2 -translate-y-1/2 font-serif text-[18vw] leading-none text-plum/[0.03] select-none pointer-events-none whitespace-nowrap"
      >
        HANDCRAFTED
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Intimate Narrative & Brand Voice */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold">
              <Compass className="w-3 h-3 text-rosewood" />
              <span>Chapter 02 · The World of Kalajay</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal leading-[1.15] tracking-tight">
              A single bead. <br />
              A strand of yarn. <br />
              <span className="italic font-light text-rosewood">A little patience. Something beautiful.</span>
            </h2>

            <p className="font-sans text-sm sm:text-base text-ink-muted leading-relaxed font-light">
              Kalajay began with an unhurried love for making things by hand. Today, we are an independent collective built almost entirely by women artisans, weaving objects that bring tactile joy and quiet luminescence to everyday living.
            </p>

            <p className="font-sans text-sm text-ink-muted leading-relaxed font-light">
              From pearl jewellery boxes that shimmer upon morning vanities to crystalline clutches and AirPod talismans that accompany you into the night—each piece is counted, knotted, and balanced one single element at a time.
            </p>

            {/* Craft House Geographic Anchors */}
            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-border-subtle text-xs">
              <div className="p-4 bg-canvas rounded-sm border border-border-subtle shadow-xs">
                <span className="text-[11px] uppercase tracking-refined text-rosewood block mb-1 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 inline" />
                  <span>Bihar Craft House</span>
                </span>
                <p className="font-serif text-base text-plum font-normal">Design & Loom Beadwork</p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Where our 21 master women artisans hand-string and tension every structural wire.
                </p>
              </div>

              <div className="p-4 bg-canvas rounded-sm border border-border-subtle shadow-xs">
                <span className="text-[11px] uppercase tracking-refined text-rosewood block mb-1 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 inline" />
                  <span>Mumbai Studio</span>
                </span>
                <p className="font-serif text-base text-plum font-normal">Curation & Dispatch</p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Quality verification, bespoke gift packaging, and direct doorstep&nbsp;shipping.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/story"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-editorial text-plum hover:text-rosewood font-semibold border-b border-plum hover:border-rosewood pb-1 transition-all"
              >
                <span>Read the Complete Craft House Chronicle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Multi-Layered Editorial Collage */}
          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Primary Large Image */}
              <div className="col-span-8 relative aspect-[4/5] rounded-sm overflow-hidden bg-canvas border border-border-medium shadow-xl">
                <img
                  src="https://www.kalajay.in/v2/p3-2.jpg"
                  alt="Pearl Beaded Vanity Box by Kalajay"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-plum/80 backdrop-blur-md px-3 py-1 rounded-sm text-canvas text-[11px] tracking-refined uppercase font-sans font-medium">
                  Vanity Jewel Box · 1,400+ Pearls
                </div>
              </div>

              {/* Offset Detail Image */}
              <div className="col-span-4 space-y-4">
                <div className="relative aspect-square rounded-sm overflow-hidden bg-canvas border border-border-medium shadow-md">
                  <img
                    src="https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp"
                    alt="Pearl Beaded Accent Coaster"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-canvas border border-border-medium shadow-md">
                  <img
                    src="https://www.kalajay.in/media/products/07d7dce169019ce6e08e80a9d10984dc7edcc0b529f69738b5c51fb2b43e0e5a.webp"
                    alt="Crystal Beaded Butterfly Clutch"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-plum/20" />
                  <div className="absolute bottom-2 left-2 bg-plum/90 backdrop-blur-sm px-2 py-0.5 rounded-xs text-champagne text-[11px] uppercase tracking-refined font-semibold">
                    Crystal Facets
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Luxury Seal */}
            <div className="absolute -bottom-6 -left-6 bg-plum text-champagne p-4 rounded-sm shadow-xl border border-champagne/30 hidden sm:block">
              <span className="block text-2xl font-serif text-canvas">21</span>
              <span className="text-[11px] uppercase tracking-refined block font-sans font-medium">Women Artisans</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

