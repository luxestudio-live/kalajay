'use client';

import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Gem, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ProcessStepScroll() {
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const stepProgressRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Choose Colours & Minerals',
      subtitle: 'Materials & Mineral Luster',
      copy: 'Every Kalajay piece begins with elemental components: faceted glass seed beads, lustrous synthetic pearls, and high-tensile stainless monofilament wire. Zero industrial plastics, zero automated molding.',
      image: 'https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp',
      highlight: 'Zero Plastic Moulding',
      time: 'Raw Mineral Selection',
    },
    {
      num: '02',
      title: 'String Bead by Bead',
      subtitle: 'Human Craft & Hand-Strung Presence',
      copy: 'In our Bihar Craft House, 21 master women artisans sit together with trays of sorted beads. Each bead is manually hand-threaded with exact finger tension so that the final box stands structurally rigid without buckling.',
      image: 'https://www.kalajay.in/v2/p3-2.jpg',
      highlight: '14+ Hours Per Piece',
      time: '14+ Hours of Pure Hands',
    },
    {
      num: '03',
      title: 'Finish & Inspect Structure',
      subtitle: 'Architectural Lattices & Mirror Fitting',
      copy: 'Individual rows form rigid geometric planes—diamonds, honeycombs, and interlocking cubic lattices. Internal vanity mirrors are framed by hand, and protective velvet pads are hand-trimmed to cradle cherished rings.',
      image: 'https://www.kalajay.in/media/products/82de6afd08ff448280211f0bfcc8dde73ecbfa427b97749596ad38de44c9d763.webp',
      highlight: 'Velvet Protective Lining',
      time: 'Structural Integrity Check',
    },
    {
      num: '04',
      title: 'Pack with Wax Seal & Care',
      subtitle: 'Mumbai Studio Curation & Dispatch',
      copy: 'Inspected and wrapped at our Mumbai studio with hand-stamped wax seals, calligraphed notes, and breathable canvas dust bags. The piece is complete: radiant under morning light and made to last for years of daily affection.',
      image: 'https://www.kalajay.in/media/products/b57e3efd6e2f7c2f0bcac6be9aaf5e1b506ff561e72739f1c3041d6fbf4afe8b.webp',
      highlight: 'Pan-India 48h Transit Protection',
      time: 'Wax Sealed in Mumbai',
    },
  ];

  useIsomorphicLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const mm = gsap.matchMedia();

    // Desktop Pinned Process Documentary Scroll on the inner pin wrapper
    mm.add('(min-width: 1024px)', () => {
      if (!pinWrapperRef.current) return;

      const trigger = ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        start: 'top top',
        end: '+=220%',
        pin: true,
        anticipatePin: 1,
        scrub: 0.8,
        onUpdate: (self) => {
          const progress = self.progress;
          const stepIndex = Math.min(3, Math.floor(progress * 4));
          setActiveStep(stepIndex);
          if (stepProgressRef.current) {
            stepProgressRef.current.style.width = `${Math.round(progress * 100)}%`;
          }
        },
      });

      return () => {
        trigger.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  const current = steps[activeStep];

  return (
    <section className="relative w-full bg-[#141312] border-b border-border-subtle/20 overflow-hidden">
      {/* 
        Inner Pin Stage: GSAP pins this inner wrapper.
        The outer <section> is owned purely by React and never reparented,
        preventing NotFoundError / removeChild crashes during client-side navigation.
      */}
      <div
        ref={pinWrapperRef}
        className="bg-[#141312] text-canvas relative overflow-hidden flex flex-col justify-center py-6 lg:py-8 lg:h-screen lg:max-h-[760px] lg:min-h-[540px]"
      >
        {/* Background Soft Radiance */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[550px] h-[550px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-canvas/10 rounded-full border border-canvas/20 text-champagne text-[11px] font-sans uppercase tracking-refined font-semibold mb-1.5">
              <Gem className="w-3 h-3 text-gold" />
              <span>Chapter 04 · From One Bead to Your Hands</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-canvas font-normal tracking-tight leading-tight">
              How a Little Wonder <span className="italic font-light text-champagne">Comes to Life.</span>
            </h2>
            <p className="text-xs sm:text-[13px] text-canvas/70 font-light mt-1 leading-relaxed">
              Follow the chronological transformation: from raw glass crystals and unyielding wire to an intimate luxury heirloom.
            </p>
          </div>

          {/* Main Stage: Clean Unboxed Architectural Layout */}
          <div className="py-2 sm:py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Visual Frame */}
              <div className="lg:col-span-6">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-[16px] overflow-hidden bg-black/40 border border-canvas/15 shadow-inner group">
                  {steps.map((st, idx) => (
                    <img
                      key={st.num}
                      src={st.image}
                      alt={st.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                        activeStep === idx
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-105 pointer-events-none'
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-3.5 sm:left-4 sm:right-4 flex items-center justify-between text-canvas text-xs">
                    <span className="bg-black/90 backdrop-blur-md px-3 py-0.5 rounded-full text-champagne text-[11px] font-sans tracking-refined uppercase font-medium border border-champagne/30">
                      Step {current.num} of 04
                    </span>
                    <span className="font-serif italic text-xs text-canvas/90 hidden sm:inline">
                      {current.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Redesigned Vertical Craft Chronicle Scroll Timeline */}
              <div ref={textContainerRef} className="lg:col-span-6 flex flex-col justify-between space-y-3">
                {/* 4 Interactive Vertical Milestone Cards with Golden Guide Rail */}
                <div className="relative pl-6 space-y-2.5">
                  {/* Vertical Golden Connecting Hairline */}
                  <div className="absolute left-2.5 top-3.5 bottom-3.5 w-[1.5px] bg-white/10 rounded-full overflow-hidden">
                    {/* Animated Fill Bar */}
                    <div
                      className="w-full bg-gold transition-all duration-300 ease-out rounded-full"
                      style={{ height: `${(activeStep / 3) * 100}%` }}
                    />
                  </div>

                  {steps.map((st, idx) => {
                    const isActive = activeStep === idx;
                    return (
                      <div
                        key={st.num}
                        onClick={() => setActiveStep(idx)}
                        className={`relative rounded-[14px] p-3 transition-all duration-300 cursor-pointer border select-none ${
                          isActive
                            ? 'bg-white/[0.06] border-gold/60 shadow-lg'
                            : 'bg-transparent border-transparent hover:bg-white/[0.02] opacity-75 hover:opacity-100'
                        }`}
                      >
                        {/* Milestone Node on the Vertical Rail */}
                        <div
                          className={`absolute -left-6 top-3.5 w-5 h-5 -translate-x-1/2 rounded-full border flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? 'bg-[#141312] border-gold text-champagne scale-110 shadow-xs'
                              : 'bg-[#0C0B0A] border-white/30 text-canvas/80'
                          }`}
                        >
                          <span className="text-[11px] font-mono font-semibold">{st.num}</span>
                        </div>

                        {/* Step Header */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] uppercase tracking-refined text-champagne font-sans font-medium block">
                            {st.subtitle}
                          </span>
                          {isActive && (
                            <span className="text-[11px] font-mono text-champagne/80 bg-white/5 px-2 py-0.5 rounded-full border border-champagne/20">
                              {st.time}
                            </span>
                          )}
                        </div>

                        <h3
                          className={`font-serif text-base sm:text-lg transition-colors mt-0.5 ${
                            isActive ? 'text-canvas font-medium' : 'text-canvas/85 font-normal'
                          }`}
                        >
                          {st.title}
                        </h3>

                        {/* Smooth Expandable Body via CSS Grid Rows */}
                        <div
                          className={`grid transition-all duration-400 ease-out ${
                            isActive ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="text-xs sm:text-sm text-canvas/90 font-light leading-relaxed mb-2.5 max-w-[65ch]">
                              {st.copy}
                            </p>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-champagne text-xs font-sans">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                              <span>{st.highlight}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tour the Craft House CTA Button */}
                <div className="pt-1.5 pl-6">
                  <Link
                    href="/atelier"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-ink text-xs uppercase tracking-refined font-semibold rounded-full shadow-md transition-colors cursor-pointer"
                  >
                    <span>Tour the Craft House</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Progress Bar at the Bottom */}
          <div className="hidden lg:block max-w-md mx-auto mt-4">
            <div className="w-full h-1 bg-canvas/10 rounded-full overflow-hidden">
              <div
                ref={stepProgressRef}
                className="h-full bg-champagne transition-all duration-150 ease-out rounded-full"
                style={{ width: `${((activeStep + 1) / 4) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono uppercase tracking-refined text-canvas/80 mt-1">
              <span>01 Raw Selection</span>
              <span>02 Hand Stringing</span>
              <span>03 Mirror &amp; Structure</span>
              <span>04 Seal &amp; Dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
