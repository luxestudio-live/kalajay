'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gem } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  const manifestoText =
    'Every piece is an invitation to slow down. Counted by human fingers, tensioned with patience, and made to turn ordinary moments into quiet celebrations.';

  const words = manifestoText.split(' ');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (textRef.current && containerRef.current) {
        const animElements = textRef.current.querySelectorAll('.manifesto-item');

        // Smooth, progressive illumination that finishes early so all words reach 100% full opacity
        gsap.fromTo(
          animElements,
          { opacity: 0.35, y: 3 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.02,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 0.3,
              // When user scrolls past, ensure all words stay 100% crisp and dark
              onLeave: () => {
                gsap.to(animElements, { opacity: 1, duration: 0.1 });
              },
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-28 bg-canvas relative overflow-hidden border-b border-border-subtle"
    >
      {/* Background Soft Pearl Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[11px] font-sans uppercase tracking-refined font-semibold mb-6 sm:mb-8 shadow-2xs">
          <Gem className="w-3.5 h-3.5 text-gold" />
          <span>The Kalajay Manifesto</span>
        </div>

        <p
          ref={textRef}
          className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ink font-normal leading-[1.24] tracking-tight"
        >
          {/* Opening Champagne Gold Quotation Mark */}
          <span className="manifesto-item inline-block text-gold font-serif text-[1.18em] leading-none align-baseline mr-1.5 sm:mr-2 select-none font-light">
            “
          </span>
          {words.map((word, idx) => (
            <span
              key={idx}
              className="manifesto-item inline-block mr-[0.28em] transition-opacity will-change-[opacity,transform]"
            >
              {word}
            </span>
          ))}
          {/* Closing Champagne Gold Quotation Mark */}
          <span className="manifesto-item inline-block text-gold font-serif text-[1.18em] leading-none align-baseline ml-0.5 select-none font-light">
            ”
          </span>
        </p>

        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4 text-xs font-sans uppercase tracking-monumental text-ink-muted">
          <span className="w-8 h-px bg-gold/50 inline-block" />
          <span>Handcrafted · Pretty · You</span>
          <span className="w-8 h-px bg-gold/50 inline-block" />
        </div>
      </div>
    </section>
  );
}

