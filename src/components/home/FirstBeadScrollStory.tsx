'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gem, CheckCircle2 } from 'lucide-react';

export default function FirstBeadScrollStory() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      phase: 'The Raw Elements',
      subtitle: 'Materials & Mineral Luster',
      copy: 'Every Kalajay wonder begins with elemental raw components: faceted glass seed beads, lustrous synthetic pearls, polished crystal bicones, and high-tensile stainless steel monofilament thread. No synthetic glue, no machine molding.',
      image: 'https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp',
      metrics: ['Zero Plastic Moulding', 'Tensile Steel Core', 'Faceted Crystal Luster']
    },
    {
      num: '02',
      phase: 'The Maker’s Tension',
      subtitle: 'Human Craft & Hand-Strung Presence',
      copy: 'In our Bihar atelier, 21 women artisans sit together with trays of sorted beads. Each bead is manually picked and hand-threaded with exact micro-tension. Too tight, and the piece buckles; too loose, and the box loses its architectural stance.',
      image: 'https://www.kalajay.in/v2/p3-2.jpg',
      metrics: ['14+ Hours Per Piece', '21 Women Artisans', 'Exact Finger Calibration']
    },
    {
      num: '03',
      phase: 'The Micro Architecture',
      subtitle: 'Geometric Interlocking & Structural Detail',
      copy: 'Individual rows form rigid geometric planes—diamonds, honeycombs, and interlocking cubic lattices. Internal vanity mirrors are framed by hand, and protective velvet pads are hand-trimmed to cradle cherished rings and heirlooms.',
      image: 'https://www.kalajay.in/media/products/82de6afd08ff448280211f0bfcc8dde73ecbfa427b97749596ad38de44c9d763.webp',
      metrics: ['Interlocking Lattices', 'Velvet Protective Lining', 'Concealed Wire Knots']
    },
    {
      num: '04',
      phase: 'The Finished Wonder',
      subtitle: 'A Heirloom for Your Daily Sanctuary',
      copy: 'Inspected and wrapped at our Mumbai studio with hand-stamped wax seals and canvas dust bags. The object is complete: radiant under morning light, tactile to the touch, and made to last for years of affectionate daily use.',
      image: 'https://www.kalajay.in/media/products/b57e3efd6e2f7c2f0bcac6be9aaf5e1b506ff561e72739f1c3041d6fbf4afe8b.webp',
      metrics: ['Pan-India Dispatch', 'Wax Seal Packaging', 'A Lifetime of Light']
    }
  ];

  const current = steps[activeStep];

  return (
    <section className="py-20 sm:py-28 bg-canvas-dark text-canvas relative overflow-hidden border-b border-plum-light/30">
      {/* Background Radiance */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-rosewood/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas/10 rounded-full border border-canvas/20 text-champagne text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
            <Gem className="w-3 h-3 text-gold" />
            <span>Chapter 04 · From the First Bead</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-canvas font-normal tracking-tight">
            How a Little Wonder <br />
            <span className="italic font-light text-blush">Comes to Life.</span>
          </h2>
          <p className="text-xs sm:text-sm text-canvas/70 font-light mt-3 leading-relaxed">
            Follow the chronological transformation: from raw glass crystals and unyielding wire to an intimate luxury heirloom.
          </p>
        </div>

        {/* Step Selector Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-10 max-w-4xl mx-auto">
          {steps.map((st, idx) => (
            <button
              key={st.num}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`p-3 sm:p-4 rounded-sm text-left transition-all cursor-pointer border ${
                activeStep === idx
                  ? 'bg-plum border-champagne text-canvas shadow-lg'
                  : 'bg-canvas-darker/60 border-canvas/10 text-canvas/60 hover:text-canvas hover:border-canvas/30'
              }`}
            >
              <span className={`text-[11px] font-sans font-bold block mb-1 ${activeStep === idx ? 'text-champagne' : 'text-canvas/50'}`}>
                PHASE {st.num}
              </span>
              <span className="font-serif text-sm sm:text-base font-normal block leading-tight text-canvas">
                {st.phase}
              </span>
            </button>
          ))}
        </div>

        {/* Interactive Feature Display Spread */}
        <div className="bg-canvas-darker border border-canvas/15 rounded-sm p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual Frame */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/11] sm:aspect-[16/10] rounded-sm overflow-hidden bg-plum/40 border border-canvas/20 shadow-inner group">
                <img
                  src={current.image}
                  alt={current.phase}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-canvas text-xs">
                  <span className="bg-plum/90 backdrop-blur-md px-3 py-1 rounded-sm text-champagne text-[11px] font-sans tracking-refined uppercase font-medium">
                    Stage {current.num} of 04
                  </span>
                  <span className="font-serif italic text-sm text-canvas/90">
                    Kalajay Artisan Chronicles
                  </span>
                </div>
              </div>
            </div>

            {/* Narrative Explanation */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-[11px] uppercase tracking-refined text-champagne block mb-1 font-sans font-semibold">
                  {current.subtitle}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-canvas font-normal">
                  {current.phase}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-canvas/80 font-light leading-relaxed">
                {current.copy}
              </p>

              {/* Key Attributes Checklist */}
              <div className="pt-2 space-y-2 border-t border-canvas/15">
                {current.metrics.map(m => (
                  <div key={m} className="flex items-center gap-2 text-xs text-canvas/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-champagne shrink-0" />
                    <span className="font-sans font-light">{m}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-4">
                <Link
                  href="/atelier"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rosewood hover:bg-rosewood-dark text-canvas text-xs uppercase tracking-editorial font-medium rounded-sm transition-colors"
                >
                  <span>Tour the Atelier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {activeStep < 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
                    className="text-xs text-champagne hover:underline cursor-pointer"
                  >
                    Next Stage →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

