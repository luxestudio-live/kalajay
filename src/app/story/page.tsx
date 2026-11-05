'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, MapPin, Scissors, Gem, Award, MessageCircle, CircleDot } from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function StoryPage() {
  return (
    <div className="bg-canvas min-h-screen pb-28 selection:bg-blush selection:text-plum">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative overflow-hidden bg-canvas-subtle/70 border-b border-border-subtle pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-[radial-gradient(#8C3B4A_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur border border-gold/30 rounded-full text-[11px] uppercase tracking-monumental text-rosewood font-sans font-semibold">
            <Gem className="w-3 h-3 text-gold" />
            <span>Craft House Chronicle · The Kalajay Story</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-plum font-normal tracking-tight leading-[1.03]">
            A single bead. <br className="hidden sm:inline" />
            A strand of yarn. <br />
            <span className="italic font-light text-rosewood">Something beautiful.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-ink-muted font-light leading-relaxed">
            How a quiet reverence for handmade craft blossomed into an independent collective of 21 women artisans transforming glass, pearl, and thread into everyday treasures.
          </p>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs uppercase tracking-editorial text-ink-light font-mono">
            <span>Est. 2023</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>21 Women Makers</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Handcrafted in India</span>
          </div>
        </div>
      </section>

      {/* 2. CORE MANIFESTO TRIAD: Handcrafted · Pretty · You */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-border-subtle">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] uppercase tracking-monumental text-rosewood font-bold">
            The Kalajay Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-plum">
            The Triad of Intent
          </h2>
          <p className="text-sm text-ink-muted font-light">
            Every creation that departs our studio carries this quiet trinity of principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 01 Handcrafted */}
          <div className="relative p-8 rounded-[28px] bg-canvas-subtle border border-border-subtle hover:border-gold/50 transition-all duration-300 space-y-4">
            <span className="text-3xl font-serif text-gold/60 font-light block">01</span>
            <h3 className="font-serif text-2xl text-plum">Handcrafted</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
              Never an assembly line, never machine-molded shortcuts. Every bead is calibrated by touch and double-knotted with high-tensile wire so your piece retains its structure for generations.
            </p>
            <div className="pt-2 text-[11px] uppercase tracking-editorial text-rosewood font-semibold flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5" />
              <span>100% Hand-strung &amp; woven</span>
            </div>
          </div>

          {/* 02 Pretty */}
          <div className="relative p-8 rounded-[28px] bg-canvas-subtle border border-border-subtle hover:border-gold/50 transition-all duration-300 space-y-4">
            <span className="text-3xl font-serif text-gold/60 font-light block">02</span>
            <h3 className="font-serif text-2xl text-plum">Pretty</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
              We unashamedly celebrate delicate, feminine joy. Faceted crystal glass that captures sunbeams on your vanity table, soft blush silks, and luminous pearl luster that elevates any outfit.
            </p>
            <div className="pt-2 text-[11px] uppercase tracking-editorial text-rosewood font-semibold flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-gold" />
              <span>Refined Light &amp; Luster</span>
            </div>
          </div>

          {/* 03 You */}
          <div className="relative p-8 rounded-[28px] bg-canvas-subtle border border-border-subtle hover:border-gold/50 transition-all duration-300 space-y-4">
            <span className="text-3xl font-serif text-gold/60 font-light block">03</span>
            <h3 className="font-serif text-2xl text-plum">You</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
              Made to order for your rituals. Whether a miniature coin pouch for an intimate dinner, bridal party favors personalized with monograms, or an unhurried gift for someone dear.
            </p>
            <div className="pt-2 text-[11px] uppercase tracking-editorial text-rosewood font-semibold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span>Customised for your sanctuary</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN EDITORIAL NARRATIVE WITH THE CONTINUOUS THREAD */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Subtle decorative thread guide down the narrative */}
        <div className="hidden md:block absolute left-8 top-28 bottom-28 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />

        <div className="space-y-24">
          {/* Chapter I: Genesis */}
          <article className="relative md:pl-16 space-y-6">
            <div className="hidden md:flex absolute -left-2 top-0 w-5 h-5 rounded-full bg-canvas border-2 border-gold items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rosewood" />
            </div>

            <span className="text-xs uppercase tracking-monumental text-rosewood font-bold block">
              Chapter I · The Genesis
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl text-plum leading-[1.12]">
              In an era of relentless speed, we chose the unhurried grace of the human hand.
            </h2>

            {/* Editorial Pull Quote */}
            <div className="my-8 p-8 sm:p-10 rounded-[28px] bg-blush/20 border border-gold/40 relative shadow-sm">
              <span className="font-serif text-6xl text-rosewood/30 absolute top-3 left-6 select-none">&ldquo;</span>
              <p className="font-serif italic text-xl sm:text-2xl text-plum relative z-10 leading-relaxed pl-6">
                The name Kalajay unites two Sanskrit roots: Kala (art, sacred time, and creative intuition) and Jay (triumph and enduring spirit). It is our testament that beauty made slowly always outlasts the disposable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm sm:text-base text-ink-muted font-light leading-relaxed">
              <p>
                Kalajay was born from a very personal yearning: the objects we touch everyday—our keys, our jewellery boxes, our evening clutches—deserve to have a soul. When you run your fingers across a hand-strung vanity box, you feel the tension calibrated by an artisan who sat with it for 14 hours.
              </p>
              <p>
                There is no conveyor belt in our craft house. Every single piece begins with loose spools of stainless monofilament wire and thousands of faceted crystal beads, woven one intersection at a time until a strong architectural form emerges.
              </p>
            </div>

            <div className="aspect-[16/9] rounded-[28px] overflow-hidden border border-border-subtle shadow-lg bg-canvas-subtle mt-8">
              <img
                src="https://www.kalajay.in/v2/p3-2.jpg"
                alt="Handcrafted Pearl Vanity Box by Kalajay"
                className="w-full h-full object-cover"
              />
            </div>
          </article>

          {/* Chapter II: Sisterhood & The 21 Makers */}
          <article className="relative md:pl-16 space-y-6">
            <div className="hidden md:flex absolute -left-2 top-0 w-5 h-5 rounded-full bg-canvas border-2 border-gold items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rosewood" />
            </div>

            <span className="text-xs uppercase tracking-monumental text-rosewood font-bold block">
              Chapter II · The Sisterhood
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl text-plum leading-[1.12]">
              21 women. Two craft houses. One shared journey of financial dignity and pride.
            </h2>

            <p className="text-sm sm:text-base text-ink-muted font-light leading-relaxed">
              Kalajay is built almost entirely by women. In regional India, skilled craftsmanship has historically been relegated to unorganized cottage work without fair valuation. We restructured this paradigm: our makers receive fair above-market living wages, flexible home craft hours, and direct attribution for the masterpieces they create.
            </p>

            {/* Artisan Spotlight Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
              <div className="p-8 rounded-[28px] bg-canvas-subtle border border-border-subtle space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gold/40">
                    <img 
                      src="https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp" 
                      alt="Artisan hands weaving beaded tote" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-plum font-medium">Reena Devi</h4>
                    <p className="text-xs text-rosewood">Master Loom Weaver · Bihar Craft House</p>
                  </div>
                </div>
                <blockquote className="text-xs sm:text-sm text-ink-muted italic font-light leading-relaxed">
                  &ldquo;When I weave a bridal box, I know it will sit on someone’s dresser for ten years. My hands give it strength. Kalajay gave me the independence to educate both my daughters.&rdquo;
                </blockquote>
              </div>

              <div className="p-8 rounded-[28px] bg-canvas-subtle border border-border-subtle space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gold/40">
                    <img 
                      src="https://www.kalajay.in/v2/p4-2.jpg" 
                      alt="Artisan finishing velvet lining" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-plum font-medium">Pooja Sharma</h4>
                    <p className="text-xs text-rosewood">Curation &amp; Quality Lead · Mumbai Studio</p>
                  </div>
                </div>
                <blockquote className="text-xs sm:text-sm text-ink-muted italic font-light leading-relaxed">
                  &ldquo;Every parcel leaving Mumbai is wrapped as if it’s our own sister’s wedding favour. The wax seal, the cotton dust bag, the personalized card—it’s our love letter to you.&rdquo;
                </blockquote>
              </div>
            </div>
          </article>

          {/* Chapter III: The Route (Bihar to Mumbai) */}
          <article className="relative md:pl-16 space-y-6">
            <div className="hidden md:flex absolute -left-2 top-0 w-5 h-5 rounded-full bg-canvas border-2 border-gold items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rosewood" />
            </div>

            <span className="text-xs uppercase tracking-monumental text-rosewood font-bold block">
              Chapter III · The Route of Craft
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl text-plum leading-[1.12]">
              From Bihar’s looms to Mumbai’s wax-sealed parcels.
            </h2>

            <div className="p-8 rounded-[28px] bg-canvas-subtle border border-border-subtle space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bihar */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full text-xs font-semibold text-rosewood">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>01 · Bihar Craft House</span>
                  </div>
                  <h3 className="font-serif text-2xl text-plum">Origin: Loom Weaving &amp; Structural Tension</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
                    Generations of needlework heritage. Here, our artisans hand-sort thousands of Czech faceted crystals and high-luster faux pearls, stringing them on 0.45mm tensile wire.
                  </p>
                </div>

                {/* Mumbai */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full text-xs font-semibold text-rosewood">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>02 · Mumbai Studio</span>
                  </div>
                  <h3 className="font-serif text-2xl text-plum">Destination: Curation, Finishing &amp; Dispatch</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
                    Every piece undergoes a 12-point inspection: clasp tension, bead alignment, and lining finish. Then wrapped in tissue, enclosed in cotton dust pouches, and sealed with antique gold wax.
                  </p>
                </div>
              </div>

              {/* Transit Stats */}
              <div className="pt-6 border-t border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <span className="font-serif text-3xl text-plum font-normal">14–22 hrs</span>
                  <span className="block text-[11px] uppercase tracking-refined text-ink-light mt-1">Hand-knotting time</span>
                </div>
                <div>
                  <span className="font-serif text-3xl text-plum font-normal">1,400+</span>
                  <span className="block text-[11px] uppercase tracking-refined text-ink-light mt-1">Beads per tote</span>
                </div>
                <div>
                  <span className="font-serif text-3xl text-plum font-normal">100%</span>
                  <span className="block text-[11px] uppercase tracking-refined text-ink-light mt-1">Plastic-free outer wrap</span>
                </div>
                <div>
                  <span className="font-serif text-3xl text-plum font-normal">₹599+</span>
                  <span className="block text-[11px] uppercase tracking-refined text-ink-light mt-1">Free Pan-India Shipping</span>
                </div>
              </div>
            </div>
          </article>

          {/* Chapter IV: Materials & Standards */}
          <article className="relative md:pl-16 space-y-6">
            <div className="hidden md:flex absolute -left-2 top-0 w-5 h-5 rounded-full bg-canvas border-2 border-gold items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rosewood" />
            </div>

            <span className="text-xs uppercase tracking-monumental text-rosewood font-bold block">
              Chapter IV · Materials &amp; Standards
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl text-plum leading-[1.12]">
              Materials chosen to catch light, not to cut corners.
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="p-6 rounded-[28px] bg-canvas border border-border-subtle space-y-3">
                <Gem className="w-6 h-6 text-rosewood" />
                <h4 className="font-serif text-xl text-plum">Czech Faceted Glass</h4>
                <p className="text-xs text-ink-muted leading-relaxed font-light">
                  Light-splitting crystal beads with fire-polished edges that sparkle naturally under morning vanity lamps and evening candlelight.
                </p>
              </div>

              <div className="p-6 rounded-[28px] bg-canvas border border-border-subtle space-y-3">
                <CircleDot className="w-6 h-6 text-gold" />
                <h4 className="font-serif text-xl text-plum">High-Luster Faux Pearls</h4>
                <p className="text-xs text-ink-muted leading-relaxed font-light">
                  Smooth, triple-coated pearlescent beads that resist peeling, water damage, and cosmetic residue from everyday perfume or lotions.
                </p>
              </div>

              <div className="p-6 rounded-[28px] bg-canvas border border-border-subtle space-y-3">
                <Award className="w-6 h-6 text-rosewood" />
                <h4 className="font-serif text-xl text-plum">Structural Wire Rigidity</h4>
                <p className="text-xs text-ink-muted leading-relaxed font-light">
                  Multi-strand stainless steel core wire ensures your bags and boxes do not sag or lose their architectural geometry over time.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 4. CLOSING BESPOKE CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="relative overflow-hidden p-10 sm:p-16 rounded-[32px] bg-plum text-canvas text-center space-y-6 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rosewood/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-monumental text-champagne font-bold block">
              Experience the Craft
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl text-canvas leading-tight">
              Bring a little wonder into your home.
            </h3>
            <p className="text-sm text-canvas/80 font-light leading-relaxed">
              Explore our current ready-to-dispatch catalogue, or speak directly with our studio team on WhatsApp for bespoke bridal favours and custom hamper curations.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-champagne hover:bg-champagne-light text-plum text-xs uppercase tracking-editorial font-semibold rounded-full transition-colors shadow-md"
              >
                <span>Browse the Creations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://wa.me/919740540847?text=Hi%20Kalajay,%20I'd%20love%20to%20discuss%20a%20custom%20order%20or%20bridal%20favours."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/15 text-canvas border border-white/25 text-xs uppercase tracking-editorial font-semibold rounded-full transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Chat with Studio Concierge</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
