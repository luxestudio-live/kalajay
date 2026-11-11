'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TheThread() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGCircleElement>(null);

  // Strictly active on narrative pages (Home and Story)
  const isNarrative = pathname === '/' || pathname === '/story';

  useEffect(() => {
    if (!isNarrative) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (pathRef.current && containerRef.current) {
        const path = pathRef.current;
        const length = path.getTotalLength ? path.getTotalLength() : 4000;

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        // Continuous drawing of the thread scrubbed by page scroll
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
          },
        });

        // Moving pearl bead traveling along the thread
        if (beadRef.current) {
          gsap.fromTo(
            beadRef.current,
            { top: '0%' },
            {
              top: '100%',
              ease: 'none',
              scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.8,
              },
            }
          );
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isNarrative]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none fixed inset-y-0 left-0 w-8 sm:w-12 z-20 overflow-hidden select-none transition-opacity duration-300 ${
        isNarrative ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 
        The Thread runs exclusively in the far left gutter / margin (x: 24px).
        It NEVER cuts across the center or covers text content.
      */}
      <svg
        className="w-full h-full opacity-40"
        preserveAspectRatio="none"
        viewBox="0 0 48 1000"
        fill="none"
      >
        {/* Subtle background guide hairline */}
        <line
          x1="24"
          y1="0"
          x2="24"
          y2="1000"
          stroke="rgba(222, 211, 197, 0.6)"
          strokeWidth="1"
        />

        {/* The Animated Thread — scrubbed on scroll */}
        <path
          ref={pathRef}
          d="M 24,0 L 24,1000"
          stroke="#9E5430"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          strokeLinecap="round"
        />

        {/* Milestone Pearl Anchors strictly inside the left gutter */}
        <circle cx="24" cy="40" r="3" fill="#F7F3EC" stroke="#9E5430" strokeWidth="1.5" />
        <circle cx="24" cy="200" r="3" fill="#F7F3EC" stroke="#9E5430" strokeWidth="1.5" />
        <circle cx="24" cy="400" r="3" fill="#F7F3EC" stroke="#9E5430" strokeWidth="1.5" />
        <circle cx="24" cy="600" r="3" fill="#F7F3EC" stroke="#9E5430" strokeWidth="1.5" />
        <circle cx="24" cy="800" r="3" fill="#F7F3EC" stroke="#9E5430" strokeWidth="1.5" />
        <circle cx="24" cy="980" r="3" fill="#9E5430" stroke="#F7F3EC" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
