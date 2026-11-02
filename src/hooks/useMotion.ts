'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * useReveal: Masked reveal hook
 * Slides elements up from a clipped mask or opacity with power3.out easing.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const duration = options?.duration ?? 0.9;
    const delay = options?.delay ?? 0;
    const stagger = options?.stagger ?? 0.08;
    const start = options?.start ?? 'top 85%';

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.reveal-item'),
        {
          opacity: 0,
          y: 36,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: 'play none none none',
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [options?.delay, options?.duration, options?.stagger, options?.start]);

  return ref;
}

/**
 * useParallax: Restrained parallax hook
 * Moves element subtly within 0.9–1.1 speed ratio.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed: number = 0.08) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -30 * speed },
        {
          y: 30 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

