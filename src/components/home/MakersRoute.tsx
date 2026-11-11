'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Heart, ArrowRight } from 'lucide-react';
import { ARTISAN_STORIES } from '@/data/extras';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function MakersRoute() {
  const containerRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<SVGPathElement>(null);
  const countersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Draw the Bihar-to-Mumbai route line on scroll
      if (routeLineRef.current) {
        const path = routeLineRef.current;
        const length = path.getTotalLength();

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            end: 'center center',
            scrub: 1,
          },
        });
      }

      // Animate statistical counters
      if (countersRef.current) {
        const counters = countersRef.current.querySelectorAll('.counter-val');
        counters.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target') || '0', 10);
          gsap.fromTo(
            el,
            { textContent: '0' },
            {
              textContent: target,
              duration: 1.8,
              snap: { textContent: 1 },
              ease: 'power2.out',
              scrollTrigger: {
                trigger: countersRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-32 bg-canvas relative overflow-hidden border-b border-border-subtle"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
            <MapPin className="w-3.5 h-3.5 text-rosewood" />
            <span>Chapter 07 · The Makers & The Route</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal tracking-tight">
            The Women Behind the Shimmer. <br />
            <span className="font-light text-rosewood">Crafted with Devotion, One Bead at a Time.</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted font-light mt-4 leading-relaxed max-w-[65ch]">
            Kalajay is an artisanal sisterhood. Our production collective provides sustainable living wages, creative autonomy, and dignified livelihoods to 21 women makers across India.
          </p>
        </div>

        {/* Statistical Animated Counters Strip */}
        <div
          ref={countersRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 bg-canvas-subtle/70 rounded-image border border-border-gold mb-16 shadow-xs"
        >
          <div className="text-center sm:text-left border-r border-border-subtle/80 last:border-r-0 pr-4">
            <span className="font-serif text-4xl sm:text-5xl text-plum block">
              <span className="counter-val" data-target="21">
                21
              </span>
            </span>
            <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold mt-1 block">
              Women Artisans
            </span>
            <span className="text-xs text-ink-muted font-light mt-0.5 block">Independent makers</span>
          </div>

          <div className="text-center sm:text-left border-r border-border-subtle/80 last:border-r-0 pr-4">
            <span className="font-serif text-4xl sm:text-5xl text-plum block">
              <span className="counter-val" data-target="2">
                2
              </span>
            </span>
            <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold mt-1 block">
              Craft House Coordinates
            </span>
            <span className="text-xs text-ink-muted font-light mt-0.5 block">Dedicated Studios</span>
          </div>

          <div className="text-center sm:text-left border-r border-border-subtle/80 last:border-r-0 pr-4">
            <span className="font-serif text-4xl sm:text-5xl text-plum block">
              <span className="counter-val" data-target="100">
                100
              </span>
              %
            </span>
            <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold mt-1 block">
              Hand-Strung
            </span>
            <span className="text-xs text-ink-muted font-light mt-0.5 block">Zero factory moulds</span>
          </div>

          <div className="text-center sm:text-left pr-4">
            <span className="font-serif text-4xl sm:text-5xl text-plum block">
              <span className="counter-val" data-target="14">
                14
              </span>
              +
            </span>
            <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold mt-1 block">
              Hours Per Heirloom
            </span>
            <span className="text-xs text-ink-muted font-light mt-0.5 block">Patient finger tension</span>
          </div>
        </div>

        {/* Bihar to Mumbai Illustrated Route Journey */}
        <div className="mb-16 p-8 sm:p-12 bg-canvas-dark text-canvas rounded-image border border-canvas/20 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Origin: Bihar */}
            <div className="md:col-span-5 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-refined bg-canvas/15 px-3 py-1 rounded-full text-champagne font-semibold font-sans">
                <MapPin className="w-3.5 h-3.5 text-rosewood" />
                <span>Origin 01 · Bihar Craft House</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-canvas">
                Design & Loom Beadwork
              </h3>
              <p className="text-xs sm:text-sm text-canvas/75 font-light leading-relaxed">
                Where 21 master artisans manually hand-string every single seed bead and stainless wire lattice. Zero machinery—every loop is tensioned by trained fingertips.
              </p>
            </div>

            {/* Central Animated Route Line */}
            <div className="md:col-span-2 flex flex-col items-center justify-center py-4">
              <svg className="w-full h-16 sm:h-20 overflow-visible" viewBox="0 0 160 40" fill="none">
                <path
                  ref={routeLineRef}
                  d="M 10,20 Q 80,-10 150,20"
                  stroke="#9E5430"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx="10" cy="20" r="4.5" fill="#9E5430" />
                <circle cx="150" cy="20" r="4.5" fill="#372921" />
              </svg>
              <span className="text-xs uppercase tracking-monumental text-champagne font-sans mt-1 font-medium">
                Artisan Transit
              </span>
            </div>

            {/* Destination: Mumbai */}
            <div className="md:col-span-5 space-y-3 md:text-right">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-refined bg-canvas/15 px-3 py-1 rounded-full text-champagne font-semibold font-sans">
                <MapPin className="w-3.5 h-3.5 text-champagne" />
                <span>Origin 02 · Mumbai Studio</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-canvas">
                Curation, Wax Seals & Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-canvas/75 font-light leading-relaxed">
                Quality audit, interior velvet mirror fitting, handwritten wax-sealed letters, and insured doorstep dispatch across all Indian pin codes.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Artisan Stories Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTISAN_STORIES.map((artisan, idx) => (
            <div
              key={artisan.name}
              className="bg-canvas-subtle/50 p-6 sm:p-8 rounded-image border border-border-gold shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-2">
                  Artisan Maker 0{idx + 1}
                </span>
                <h3 className="font-serif text-2xl text-plum mb-1">
                  {artisan.name}
                </h3>
                <p className="text-xs text-ink-muted font-sans mb-4">
                  {artisan.location} · {artisan.experience}
                </p>
                <div className="text-2xl text-champagne font-serif mb-1 leading-none">“</div>
                <p className="text-xs sm:text-sm text-ink-muted font-light italic leading-relaxed">
                  {artisan.quote}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border-subtle/80 flex items-center justify-between text-[11px] text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rosewood fill-rosewood" />
                  <span>Master Bead Weaver</span>
                </span>
                <span className="font-serif italic text-rosewood font-medium">Kalajay Craft House</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

