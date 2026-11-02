'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Gift, ArrowRight, HeartHandshake, Building, Calendar, Palette } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GiftingTeaser() {
  const containerRef = useRef<HTMLDivElement>(null);

  const giftingCards = [
    {
      title: 'Wedding & Bridal Favours',
      category: 'Matrimonial Keepsakes',
      desc: 'Bespoke pearl coin bags, crystal clutches, and floral coasters matched precisely to your bridal lehenga and invitation palette.',
      highlight: 'From 25 to 500+ pieces',
      image: 'https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp',
      icon: HeartHandshake,
      link: '/gifting#wedding',
    },
    {
      title: 'Corporate & Client Gifting',
      category: 'Executive Craft',
      desc: 'Move past generic hampers. Offer clients and teams handcrafted pearl desk organisers and crystal card holders that celebrate lasting human value.',
      highlight: 'GST Invoicing · Pan-India Multi-Drop',
      image: 'https://www.kalajay.in/media/products/b1bae023973762e04b7bd33024aec63f9ee9b6d6d97aac39f51a0a78d9c4df1b.webp',
      icon: Building,
      link: '/corporate-gifting',
    },
    {
      title: 'Festive & Milestone Hampers',
      category: 'Celebration Sets',
      desc: 'Hand-beaded tealight lanterns that cast prismatic crystal glow across dining tables, paired with blush coasters and wax-sealed notes.',
      highlight: 'Seasonal Curations · Gift Boxed',
      image: 'https://www.kalajay.in/media/products/05c487e5d0ba14e30995c085eb1718b4d752a4e1e93bff6dce835a1e98fcaf42.webp',
      icon: Calendar,
      link: '/gifting#festive',
    },
    {
      title: 'Bespoke Custom Keepsakes',
      category: 'Interactive Studio',
      desc: 'Custom-designed initials, custom colorways, and bespoke dimensions created 1-on-1 with our master artisans.',
      highlight: 'Interactive Hamper Builder',
      image: 'https://www.kalajay.in/media/products/82de6afd08ff448280211f0bfcc8dde73ecbfa427b97749596ad38de44c9d763.webp',
      icon: Palette,
      link: '/customise',
    },
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = containerRef.current?.querySelectorAll('.gifting-card');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 25, opacity: 0.8 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
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
      className="py-16 sm:py-24 bg-canvas-subtle/60 relative overflow-hidden border-b border-border-subtle"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Sticky Editorial Heading & Narrative */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[11px] font-sans uppercase tracking-refined font-semibold">
              <Gift className="w-3.5 h-3.5 text-gold" />
              <span>Chapter 06 · The Art of Giving</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-normal tracking-tight leading-[1.12]">
              Curated Hampers. <br />
              <span className="font-light text-rosewood">Unforgettable Celebrations.</span>
            </h2>

            <p className="text-sm text-ink-muted font-light leading-relaxed">
              Every Kalajay gift is packed in rigid keepsake boxes with handwritten wax-sealed letters, sustaining 21 independent women makers across India.
            </p>

            <div className="pt-2 space-y-3">
              <Link
                href="/gifting"
                className="inline-flex items-center gap-2 px-7 py-3 bg-ink hover:bg-black text-canvas text-xs uppercase tracking-monumental font-semibold rounded-full shadow-md transition-colors cursor-pointer"
              >
                <span>Open Hamper Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <p className="text-xs text-ink-muted">
                Or WhatsApp us directly at <span className="font-semibold text-ink">+91 97405 40847</span>
              </p>
            </div>
          </div>

          {/* Right Column: Clean, Non-Overlapping Spaced Cards */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {giftingCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="gifting-card bg-canvas p-6 sm:p-7 rounded-[22px] border border-border-gold shadow-xs hover:shadow-lg hover:border-gold/80 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-center">
                    {/* Visual Preview */}
                    <div className="sm:col-span-5 aspect-[4/3] rounded-[16px] overflow-hidden bg-canvas-subtle border border-border-subtle group">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Card Content */}
                    <div className="sm:col-span-7 space-y-2.5">
                      <div className="flex items-center gap-2 text-rosewood">
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] uppercase tracking-refined font-semibold font-sans">
                          {card.category}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl text-plum font-normal leading-snug">
                        {card.title}
                      </h3>

                      <p className="text-xs sm:text-[13px] text-ink-muted font-light leading-relaxed">
                        {card.desc}
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-border-subtle/60">
                        <span className="text-xs font-sans font-medium text-rosewood bg-blush/60 px-3 py-1 rounded-full">
                          {card.highlight}
                        </span>
                        <Link
                          href={card.link}
                          className="text-xs font-semibold text-plum hover:text-rosewood uppercase tracking-refined inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
