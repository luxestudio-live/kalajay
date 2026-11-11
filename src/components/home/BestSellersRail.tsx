'use client';

import React, { useLayoutEffect, useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Check, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRODUCTS, Product } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function formatINR(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function BestSellersRail() {
  const { addToCart } = useCart();
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Curate 8 authentic, verified bestsellers with genuine macro photography
  const bestSellers: Product[] = useMemo(() => {
    const curatedIds = [
      'KJ-ORG-101', // Pearl Vanity Jewellery Box
      'KJ-APC-404', // Crystal Beaded AirPods Case
      'KJ-MAT-510', // Beaded Theme Mat
      'KJ-PUR-201', // Pearl Beaded Mini Tote
      'KJ-MAT-513', // Blush Crystal Coaster Set
      'KJ-PUR-208', // Pink Crystal Butterfly Clutch
      'KJ-MAT-504', // Grey Beaded Table Runner
      'KJ-APC-403', // Pastel Beaded AirPods Case
    ];

    const found = curatedIds
      .map((id) => PRODUCTS.find((p) => p.id === id || p.code === id))
      .filter(
        (p): p is Product =>
          Boolean(p && !p.coverImage.includes('brand.png') && !p.coverImage.includes('kalajay-brand'))
      );

    if (found.length >= 6) return found;

    return PRODUCTS.filter(
      (p) => !p.coverImage.includes('brand.png') && !p.coverImage.includes('kalajay-brand')
    ).slice(0, 8);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const mm = gsap.matchMedia();

    // Desktop Pinned Kinetic Horizontal Scroll on the inner pin wrapper
    mm.add('(min-width: 1024px)', () => {
      if (!pinWrapperRef.current || !trackRef.current) return;

      const track = trackRef.current;
      const getScrollDistance = () => track.scrollWidth - window.innerWidth + 140;

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinWrapperRef.current,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${Math.round(self.progress * 100)}%`;
            }
          },
        },
      });

      return () => {
        tween.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [bestSellers]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section className="relative w-full bg-canvas border-b border-border-subtle overflow-hidden">
      {/* 
        Inner Pin Stage: GSAP pins this inner wrapper.
        The outer <section> is owned purely by React and never reparented,
        preventing NotFoundError / removeChild crashes during client-side navigation.
      */}
      <div
        ref={pinWrapperRef}
        className="bg-canvas relative overflow-hidden flex flex-col justify-between py-3 sm:py-4 lg:py-5 lg:h-screen lg:max-h-[720px] lg:min-h-[500px]"
      >
        {/* Top Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 shrink-0 mb-2 sm:mb-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border-subtle pb-2.5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-canvas-subtle rounded-full border border-gold/40 text-ink text-[11px] font-sans uppercase tracking-refined font-semibold mb-1">
                <Star className="w-3 h-3 text-gold-dark fill-gold-dark/20" />
                <span>Chapter 03 · Best Sellers</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[2rem] text-ink font-normal tracking-tight leading-tight">
                Objects of Affection. <span className="italic font-light text-gold-dark">Patiently Hand-Strung.</span>
              </h2>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-refined font-semibold text-ink hover:text-gold-dark transition-colors group cursor-pointer"
              >
                <span>Browse All 69 Creations</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-gold-dark" />
              </Link>
            </div>
          </div>
        </div>

        {/* Pinned Kinetic Horizontal Track */}
        <div className="lg:overflow-hidden pl-4 sm:pl-6 lg:pl-12 flex-1 flex items-center">
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none no-scrollbar pr-6 py-1 will-change-transform"
          >
            {bestSellers.map((product) => {
              const secondImg = product.images[1] || product.coverImage;
              const isAdded = addedId === product.id;

              return (
                <div
                  key={product.id}
                  className="group shrink-0 w-[210px] sm:w-[230px] lg:w-[245px] snap-start bg-canvas rounded-[18px] overflow-hidden border border-border-subtle hover:border-gold/60 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <Link href={`/products/${product.slug}`} className="block relative">
                    {/* Calibrated Aspect Image Container */}
                    <div className="relative h-[145px] sm:h-[160px] lg:h-[175px] bg-canvas-subtle overflow-hidden rounded-t-[18px]">
                      <img
                        src={product.coverImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                        loading="lazy"
                      />
                      <img
                        src={secondImg}
                        alt={`${product.name} detail`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        loading="lazy"
                      />

                      <span className="absolute top-2 left-2 bg-ink/85 backdrop-blur-sm text-canvas text-[11px] uppercase tracking-refined px-2.5 py-0.5 rounded-full font-sans font-medium">
                        Craft House Signature
                      </span>
                    </div>

                    {/* Metadata: Category, Full Title, Price */}
                    <div className="p-3 pb-1.5">
                      <span className="text-[11px] uppercase tracking-refined text-rosewood block font-sans font-semibold">
                        {product.category}
                      </span>
                      <h3 className="font-serif text-sm text-ink group-hover:text-gold-dark transition-colors mt-0.5 leading-snug line-clamp-1 h-5">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-serif text-sm text-ink font-semibold">
                          {formatINR(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-ink-muted line-through">
                            {formatINR(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Quick Add Button */}
                  <div className="px-3 pb-3 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`w-full py-1.5 px-3 rounded-full text-[11px] font-semibold uppercase tracking-refined transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        isAdded
                          ? 'bg-emerald-800 text-white'
                          : 'bg-ink hover:bg-black text-canvas'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Quick Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kinetic Progress Bar & Status (Desktop only) */}
        <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full shrink-0 pt-2 pb-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-refined text-ink-light pb-1">
            <span>Curated Editions 01 – 08</span>
            <span>Scroll to traverse catalogue →</span>
          </div>
          <div className="w-full h-1 bg-border-subtle rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-gold transition-all duration-150 ease-out rounded-full"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
