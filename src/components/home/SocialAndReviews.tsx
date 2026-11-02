'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Instagram, Star, ArrowRight, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SocialAndReviews() {
  const [activeReview, setActiveReview] = useState(0);

  const glimpsePhotos = [
    {
      src: 'https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp',
      alt: 'Macro beadwork closeup',
      tag: '@kalajay_store',
    },
    {
      src: 'https://www.kalajay.in/v2/p3-2.jpg',
      alt: 'Pearl vanity box on dressing table',
      tag: '#kalajayatelier',
    },
    {
      src: 'https://www.kalajay.in/media/products/b57e3efd6e2f7c2f0bcac6be9aaf5e1b506ff561e72739f1c3041d6fbf4afe8b.webp',
      alt: 'Bluebell diamond crystal bag under light',
      tag: '#handmadeaccessories',
    },
    {
      src: 'https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp',
      alt: 'Pearl beaded mini tote flat lay',
      tag: '@kalajay_store',
    },
    {
      src: 'https://www.kalajay.in/media/products/07d7dce169019ce6e08e80a9d10984dc7edcc0b529f69738b5c51fb2b43e0e5a.webp',
      alt: 'Crystal butterfly evening clutch with hands',
      tag: '#weddingfavours',
    },
    {
      src: 'https://www.kalajay.in/media/products/05c487e5d0ba14e30995c085eb1718b4d752a4e1e93bff6dce835a1e98fcaf42.webp',
      alt: 'Candlelight glowing through beaded lantern',
      tag: '#festivehampers',
    },
  ];

  const reviews = [
    {
      name: 'Radhika M.',
      city: 'Mumbai',
      occasion: 'Bridal Vanity Box',
      quote:
        'The pearl jewellery box is even more breathtaking in person. You can truly feel the weight of the hand-woven pearls and the mirror inside is crystal clear. It has become the centerpiece of my morning vanity.',
      rating: 5,
    },
    {
      name: 'Ananya S.',
      city: 'Bengaluru',
      occasion: '50 Wedding Favours',
      quote:
        'We ordered 50 custom-color coin bags for my sister’s Mehendi ceremony. Kalajay matched our sage green palette perfectly and every guest was stunned by the wax seal packaging. Unforgettable craft.',
      rating: 5,
    },
    {
      name: 'Tara V.',
      city: 'Delhi NCR',
      occasion: 'Crystal Butterfly Clutch',
      quote:
        'I carried the crystal clutch to a cocktail reception and received endless compliments throughout the night. It catches candle-light like a cut gem. Knowing it was strung by women artisans makes it priceless.',
      rating: 5,
    },
    {
      name: 'Pooja K.',
      city: 'Kolkata',
      occasion: 'AirPod Pearl Jewel Case',
      quote:
        'A delightful little object of pure joy. I clip it to my tote everyday and it never fails to make me smile. The craftsmanship is extraordinarily sturdy.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 sm:py-32 bg-canvas relative overflow-hidden border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
            <Instagram className="w-3.5 h-3.5" />
            <span>Chapter 08 · Atelier Glimpses & Affection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal tracking-tight">
            Little Wonders in the Wild. <br />
            <span className="font-light text-rosewood">Cherished by Our Inner Circle.</span>
          </h2>
        </div>

        {/* Instagram Glimpse Strip (6 Photographic Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-20">
          {glimpsePhotos.map((photo, idx) => (
            <a
              key={idx}
              href="https://www.instagram.com/kalajay_store/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-image overflow-hidden bg-canvas-subtle border border-border-gold shadow-xs block"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-plum/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-canvas p-2 text-center">
                <span className="text-xs font-sans font-medium tracking-editorial text-champagne">
                  {photo.tag}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Customer Reviews Interactive Testimonial Carousel */}
        <div className="max-w-3xl mx-auto bg-canvas-subtle p-8 sm:p-12 rounded-image border border-border-gold shadow-md relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-1 text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>
            <span className="text-[11px] uppercase tracking-refined font-sans font-semibold text-rosewood">
              {reviews[activeReview].occasion}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-serif text-plum font-normal leading-snug mb-6 min-h-[110px]">
            “{reviews[activeReview].quote}”
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs">
            <div>
              <span className="font-serif text-base text-plum font-semibold block">
                {reviews[activeReview].name}
              </span>
              <span className="text-ink-muted text-[11px]">
                {reviews[activeReview].city} · Verified Collector
              </span>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveReview((prev) => (prev > 0 ? prev - 1 : reviews.length - 1))}
                aria-label="Previous review"
                className="w-8 h-8 rounded-full border border-border-medium hover:border-plum text-plum flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveReview((prev) => (prev < reviews.length - 1 ? prev + 1 : 0))}
                aria-label="Next review"
                className="w-8 h-8 rounded-full border border-border-medium hover:border-plum text-plum flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Closing Action Frame */}
        <div className="mt-20 text-center space-y-6">
          <h3 className="font-serif text-3xl sm:text-5xl text-plum uppercase tracking-tight">
            A Little Wonder <br />
            <span className="italic font-light text-rosewood lowercase">
              goes a long way.
            </span>
          </h3>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
            Ready to bring tactile beauty, colour, and quiet ceremony to your daily wardrobe or home sanctuary?
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-monumental font-semibold rounded-full shadow-md transition-all"
            >
              <span>Explore All 69 Creations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

