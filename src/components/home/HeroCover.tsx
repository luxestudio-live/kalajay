'use client';

import React, { useLayoutEffect, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function HeroCover() {
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const textStageRef = useRef<HTMLDivElement>(null);
  const visualStageRef = useRef<HTMLDivElement>(null);
  const leftPieceRef = useRef<HTMLDivElement>(null);
  const centerPieceRef = useRef<HTMLDivElement>(null);
  const rightPieceRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useIsomorphicLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const mm = gsap.matchMedia();

    // Desktop (min-width: 1024px): Pinned Hero with Automatic Card Spread on Scroll
    mm.add('(min-width: 1024px)', () => {
      if (
        !pinWrapperRef.current ||
        !leftPieceRef.current ||
        !rightPieceRef.current ||
        !centerPieceRef.current ||
        !ctaRef.current
      )
        return;

      // 1. Initial Resting State: Side cards peek out symmetrically
      gsap.set(leftPieceRef.current, {
        xPercent: -44,
        rotation: -2.5,
        scale: 0.96,
        opacity: 0.95,
        force3D: true,
      });
      gsap.set(rightPieceRef.current, {
        xPercent: 44,
        rotation: 2.5,
        scale: 0.96,
        opacity: 0.95,
        force3D: true,
      });
      gsap.set(centerPieceRef.current, {
        xPercent: 0,
        y: 0,
        scale: 1,
        zIndex: 20,
        force3D: true,
      });
      gsap.set(ctaRef.current, { y: 0, opacity: 1 });

      // 2. Automatic Fan-Out Timeline (brisk and fluid, spreads smoothly once triggered)
      const fanOutTl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out', duration: 0.75 },
      });

      fanOutTl.to(
        leftPieceRef.current,
        {
          xPercent: -122,
          rotation: -3.5,
          scale: 1,
          opacity: 1,
        },
        0
      );

      fanOutTl.to(
        rightPieceRef.current,
        {
          xPercent: 122,
          rotation: 3.5,
          scale: 1,
          opacity: 1,
        },
        0
      );

      fanOutTl.to(
        centerPieceRef.current,
        {
          scale: 1.05,
          y: -6,
          boxShadow: '0 25px 50px -12px rgba(20, 19, 18, 0.22)',
        },
        0
      );

      // 3. Pinned Scroll Trigger: Quick, subtle slowdown (~200px) instead of a prolonged hard stop
      // Gives the tactile "slow down" feel for a brief moment, then immediately continues scrolling
      const pinTrigger = ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        start: 'top top',
        end: '+=22%',
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress > 0.05 || window.scrollY > 15) {
            fanOutTl.play();
          } else if (self.progress <= 0.02 && window.scrollY <= 8) {
            fanOutTl.reverse();
          }
        },
        onLeaveBack: () => {
          fanOutTl.reverse();
        },
      });

      // Window scroll listener for immediate response on mousewheel / trackpad touch
      const handleScroll = () => {
        if (window.scrollY > 15) {
          fanOutTl.play();
        } else if (window.scrollY <= 8) {
          fanOutTl.reverse();
        }
      };

      if (window.scrollY > 15) {
        fanOutTl.progress(1);
      }

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        pinTrigger.kill();
        fanOutTl.kill();
      };
    });

    // Mobile & Tablet (max-width: 1023px): Pinned touch experience with automatic card spread
    mm.add('(max-width: 1023px)', () => {
      if (
        !pinWrapperRef.current ||
        !leftPieceRef.current ||
        !rightPieceRef.current ||
        !centerPieceRef.current ||
        !ctaRef.current
      )
        return;

      const isMobilePhone = window.innerWidth < 640;
      const initialShift = isMobilePhone ? 22 : 36;
      const fanShift = isMobilePhone ? 62 : 88;

      gsap.set(leftPieceRef.current, {
        xPercent: -initialShift,
        rotation: -2,
        scale: 0.96,
        opacity: 0.95,
        force3D: true,
      });
      gsap.set(rightPieceRef.current, {
        xPercent: initialShift,
        rotation: 2,
        scale: 0.96,
        opacity: 0.95,
        force3D: true,
      });
      gsap.set(centerPieceRef.current, {
        xPercent: 0,
        y: 0,
        scale: 1,
        zIndex: 20,
        force3D: true,
      });
      gsap.set(ctaRef.current, { opacity: 1, y: 0 });

      const mobileFanOutTl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out', duration: 0.65 },
      });

      mobileFanOutTl.to(
        leftPieceRef.current,
        {
          xPercent: -fanShift,
          rotation: -2.5,
          scale: 1,
          opacity: 1,
        },
        0
      );

      mobileFanOutTl.to(
        rightPieceRef.current,
        {
          xPercent: fanShift,
          rotation: 2.5,
          scale: 1,
          opacity: 1,
        },
        0
      );

      mobileFanOutTl.to(
        centerPieceRef.current,
        {
          scale: 1.03,
          y: -4,
        },
        0
      );

      const mobilePinTrigger = ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        start: 'top top',
        end: '+=18%',
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress > 0.05 || window.scrollY > 12) {
            mobileFanOutTl.play();
          } else if (self.progress <= 0.02 && window.scrollY <= 6) {
            mobileFanOutTl.reverse();
          }
        },
        onLeaveBack: () => {
          mobileFanOutTl.reverse();
        },
      });

      const handleMobileScroll = () => {
        if (window.scrollY > 12) {
          mobileFanOutTl.play();
        } else if (window.scrollY <= 6) {
          mobileFanOutTl.reverse();
        }
      };

      if (window.scrollY > 12) {
        mobileFanOutTl.progress(1);
      }

      window.addEventListener('scroll', handleMobileScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleMobileScroll);
        mobilePinTrigger.kill();
        mobileFanOutTl.kill();
      };
    });

    // Headline smooth masked entrance
    if (headlineRef.current) {
      const lines = headlineRef.current.querySelectorAll('.headline-line');
      gsap.fromTo(
        lines,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section className="relative w-full bg-canvas border-b border-border-subtle overflow-hidden">
      {/* 
        Inner Pin Stage: GSAP pins this inner wrapper.
        The outer <section> is owned purely by React and never reparented, 
        preventing React NotFoundError / removeChild errors during route transitions.
      */}
      <div
        ref={pinWrapperRef}
        className="relative min-h-[90svh] max-h-[820px] lg:h-[92svh] lg:max-h-[840px] bg-canvas flex flex-col justify-between overflow-hidden pt-2 sm:pt-3 pb-3 sm:pb-4"
      >
        {/* Background Tactile Texture & Radiant Auras */}
        <div className="absolute inset-0 bg-tactile-grain opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Editorial Metadata Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 shrink-0">
          <div className="flex items-center justify-between border-b border-border-subtle/80 pb-1.5 text-[11px] font-sans uppercase tracking-refined text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
              <span className="font-medium text-ink">KALAJAY DIGITAL FLAGSHIP</span>
              <span className="hidden md:inline opacity-40">·</span>
              <span className="hidden md:inline">VOL. 02</span>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <span>21 WOMEN ARTISANS</span>
              <span className="opacity-40">·</span>
              <span>LIMITED CRAFT HOUSE RUN</span>
            </div>
            <div className="text-ink font-medium">
              100% HAND-STRUNG
            </div>
          </div>
        </div>

        {/* Main Viewport Stage: Text + 3-Piece Visual Presentation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center items-center relative z-10 py-1">
          {/* Zone 1: Magazine Headline & Subtitle */}
          <div ref={textStageRef} className="text-center relative select-none will-change-transform max-w-2xl mx-auto shrink-0 mb-2 sm:mb-3">
            <h1
              ref={headlineRef}
              className="font-serif text-[7.5vw] sm:text-[4.5vw] lg:text-[2.8vw] leading-[1.04] tracking-tight text-ink font-normal uppercase"
            >
              <span className="block overflow-hidden pb-0.5">
                <span className="headline-line inline-block">Handcrafted with love,</span>
              </span>
              <span className="block overflow-hidden">
                <span className="headline-line inline-block italic font-light text-ink-muted lowercase">
                  one at a time.
                </span>
              </span>
            </h1>

            <p className="mt-2 max-w-md mx-auto font-sans text-xs sm:text-[13px] text-ink-muted leading-relaxed font-light px-4">
              A world of little wonders. Hand-strung jewellery boxes, luminous evening clutches, and tactile daily charms.
            </p>
          </div>

          {/* Zone 2: Pinned Kinetic 3-Piece Stage (Calibrated to fit cleanly with zero text overlap) */}
          <div
            ref={visualStageRef}
            className="relative mt-4 sm:mt-7 lg:mt-8 max-w-4xl mx-auto w-full h-[230px] sm:h-[280px] lg:h-[305px] flex items-center justify-center will-change-transform"
          >
            {/* Piece 1: Left - Pearl Beaded Mini Tote */}
            <div
              ref={leftPieceRef}
              className="absolute w-[134px] sm:w-[185px] lg:w-[210px] aspect-[4/5] rounded-[18px] sm:rounded-[20px] overflow-hidden bg-canvas-subtle border border-border-medium shadow-md will-change-transform flex flex-col justify-between group z-10 select-none"
            >
              <Link href="/shop" className="absolute inset-0 z-20" aria-label="Inspect Pearl Beaded Mini Tote" />
              <img
                src="https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp"
                alt="Handcrafted Pearl Beaded Mini Tote Bag"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent pointer-events-none" />
              
              <div className="relative p-2 sm:p-2.5">
                <span className="inline-block text-[11px] uppercase tracking-refined bg-ink/90 backdrop-blur-md px-2 py-0.5 rounded-full text-champagne font-sans border border-champagne/30 font-medium">
                  Tote
                </span>
              </div>

              <div className="relative p-2 sm:p-2.5 text-canvas">
                <h2 className="font-serif text-xs sm:text-sm text-canvas font-normal leading-tight">
                  Pearl<br className="sm:hidden" /> Tote
                </h2>
                <span className="text-xs text-champagne font-serif font-medium block mt-0.5">₹1,199</span>
              </div>
            </div>

            {/* Piece 2: Center - Signature Pearl Vanity Box (Commanding Centerpiece) */}
            <div
              ref={centerPieceRef}
              className="relative w-[168px] sm:w-[205px] lg:w-[230px] aspect-[4/5] rounded-[20px] sm:rounded-[22px] overflow-hidden bg-canvas border-2 border-gold/70 shadow-xl will-change-transform flex flex-col justify-between group z-20 select-none"
            >
              <img
                src="https://www.kalajay.in/v2/p3-2.jpg"
                alt="Pearl Beaded Vanity Box with interior mirror"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent pointer-events-none" />
              
              <div className="relative p-2 sm:p-3 flex justify-between items-start gap-1">
                <span className="inline-block text-[11px] uppercase tracking-refined bg-ink/90 backdrop-blur-md px-2 sm:px-2.5 py-0.5 rounded-full text-champagne font-sans border border-champagne/30 font-medium shadow-sm">
                  Craft House Heirloom
                </span>
                <span className="font-serif text-xs sm:text-sm font-semibold text-champagne bg-ink/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-champagne/30">
                  ₹1,449
                </span>
              </div>

              <div className="relative p-2 sm:p-3 text-canvas flex flex-col gap-1">
                <h2 className="font-serif text-xs sm:text-base lg:text-lg text-canvas font-medium leading-tight">
                  Pearl Vanity Box
                </h2>
                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-xs text-canvas/90 font-light">
                    1,400+ pearls
                  </p>
                  <Link
                    href="/shop"
                    className="shrink-0 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-champagne hover:bg-champagne-light text-ink text-[11px] font-semibold uppercase tracking-refined rounded-full flex items-center gap-1 shadow-md transition-all"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Piece 3: Right - Pink Crystal Butterfly Clutch */}
            <div
              ref={rightPieceRef}
              className="absolute w-[134px] sm:w-[185px] lg:w-[210px] aspect-[4/5] rounded-[18px] sm:rounded-[20px] overflow-hidden bg-canvas-subtle border border-border-medium shadow-md will-change-transform flex flex-col justify-between group z-10 select-none text-right"
            >
              <Link href="/shop" className="absolute inset-0 z-20" aria-label="Inspect Rose Pink Crystal Butterfly Evening Clutch" />
              <img
                src="https://www.kalajay.in/media/products/07d7dce169019ce6e08e80a9d10984dc7edcc0b529f69738b5c51fb2b43e0e5a.webp"
                alt="Rose Pink Crystal Butterfly Evening Clutch"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent pointer-events-none" />
              
              <div className="relative p-2 sm:p-2.5 flex justify-end">
                <span className="inline-block text-[11px] uppercase tracking-refined bg-ink/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-champagne font-sans border border-champagne/30 font-medium">
                  Clutch
                </span>
              </div>

              <div className="relative p-2 sm:p-2.5 text-canvas text-right">
                <h2 className="font-serif text-xs sm:text-sm text-canvas font-normal leading-tight">
                  Crystal<br className="sm:hidden" /> Clutch
                </h2>
                <span className="text-xs text-champagne font-serif font-medium block mt-0.5">₹1,299</span>
              </div>
            </div>
          </div>

        {/* Zone 3: CTA Cluster below the pieces - increased luxury breathing room */}
        <div ref={ctaRef} className="mt-6 sm:mt-8 lg:mt-9 flex items-center justify-center gap-3.5 relative z-30 shrink-0">
          <Link
            href="/shop"
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-ink hover:bg-black text-canvas text-xs uppercase tracking-editorial font-semibold rounded-full transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>View the Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/customise"
            className="px-5 sm:px-7 py-2.5 sm:py-3 bg-canvas hover:bg-canvas-subtle border border-border-strong text-ink hover:text-gold-dark text-xs uppercase tracking-editorial font-medium rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-gold-dark" />
            <span>Custom Orders</span>
          </Link>
        </div>
      </div>

      {/* Bottom Milestone Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 shrink-0">
        <div className="flex items-center justify-between border-t border-border-subtle/80 pt-2 text-xs font-sans text-ink-muted">
          <span className="font-serif italic text-xs text-ink-muted">
            &ldquo;No machines. Just hands, beads, and patience.&rdquo;
          </span>
          <span className="hidden sm:inline uppercase tracking-refined text-ink-light font-mono text-xs">
            Scroll to unravel the thread ↓
          </span>
        </div>
      </div>
    </div>
  </section>
  );
}
