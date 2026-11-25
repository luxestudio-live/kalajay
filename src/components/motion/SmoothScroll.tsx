'use client';

import React, { useEffect, createContext, useContext, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({ lenis: null });

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Skip Lenis on mobile/coarse-pointer devices to preserve native hardware-accelerated touch scroll
    const isTouchOrMobile = window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches;
    if (isTouchOrMobile) return;

    // Initialize Lenis smooth scroll for desktop wheel navigation
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo.out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      infinite: false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);
    if (typeof window !== 'undefined') {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };
  }, []);

  // Reset scroll position on route change and refresh ScrollTrigger on desktop only
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    const isTouchOrMobile = typeof window !== 'undefined' && (window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches);
    if (isTouchOrMobile) return;

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
