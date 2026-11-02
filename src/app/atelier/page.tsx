'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle, ShieldCheck, Scissors } from 'lucide-react';
import { ARTISAN_STORIES } from '@/data/extras';

export default function AtelierPage() {
  const techniques = [
    {
      title: 'Monofilament Wire Tensioning',
      subtitle: 'The Architectural Backbone',
      desc: 'Unlike soft string bags that sag, Kalajay vanity boxes and structured clutches use high-tensile stainless steel monofilament wire. Each wire pass is hand-calibrated so that glass and pearl beads interlock with structural rigidity without cracking.',
      hours: '6–10 hours per piece'
    },
    {
      title: 'Faceted Crystal Weaving',
      subtitle: 'Prismatic Light Refraction',
      desc: 'Our crystal clutches and tealight lanterns use multi-faceted glass crystals cut at precise angles. When candlelight or sunlight hits the surface, the piece refracts warm geometric flashes across surrounding surfaces.',
      hours: '12–16 hours per piece'
    },
    {
      title: 'Botanical Crochet Needlework',
      subtitle: 'Flora in Pure Cotton Thread',
      desc: 'Handmade with ultra-fine mercerised cotton yarns, our crocheted flower charms and bookmarks are shaped with single-hook precision, creating tactile floral petals that never wilt or shed.',
      hours: '3–5 hours per piece'
    },
    {
      title: 'Mirror & Velvet Fitting',
      subtitle: 'The Intimate Finishing Touches',
      desc: 'Each vanity jewellery box is fitted with a distortion-free interior glass mirror framed by a protective pearl border. The interior base is lined with soft velvet to ensure heirloom rings and necklaces rest without scratches.',
      hours: 'Final hand-finishing'
    }
  ];

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-dark text-canvas py-16 sm:py-24 border-b border-plum-light/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rosewood/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-[11px] uppercase tracking-refined text-champagne font-sans font-semibold block mb-3">
            Atelier Dispatches · The Making
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-canvas font-normal tracking-tight leading-[1.05]">
            Geometry & Patience. <br />
            <span className="italic font-light text-blush">The Handcrafted Discipline.</span>
          </h1>
          <p className="mt-6 text-sm sm:text-base text-canvas/75 font-light leading-relaxed max-w-2xl mx-auto">
            Inside our Bihar bead looms and Mumbai finishing studios. Where raw crystals, lustrous pearls, and tensile wires are shaped into enduring objects of affection.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 space-y-20">
        {/* Section 1: The Two Atelier Geography */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-canvas-subtle rounded-sm border border-border-medium space-y-4">
            <div className="flex items-center gap-2 text-rosewood">
              <MapPin className="w-5 h-5" />
              <span className="text-xs uppercase tracking-monumental font-bold">Atelier I · Bihar</span>
            </div>
            <h3 className="font-serif text-2xl text-plum">
              Loom Weaving & Hand-Stringing
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
              In our Bihar production workshop, 21 master women artisans lead the entire bead-stringing and wire-weaving process. Drawing upon regional traditions of patient needlecraft and textile handiwork, they calculate bead sequences and tension parameters manually without digital automation.
            </p>
            <div className="pt-2 text-[11px] text-ink-light space-y-1">
              <p>• 21 Master Women Artisans</p>
              <p>• Zero Factory Assembly Lines</p>
              <p>• 100% Hand-Knotted Integrity</p>
            </div>
          </div>

          <div className="p-8 bg-canvas-subtle rounded-sm border border-border-medium space-y-4">
            <div className="flex items-center gap-2 text-rosewood">
              <MapPin className="w-5 h-5" />
              <span className="text-xs uppercase tracking-monumental font-bold">Atelier II · Mumbai</span>
            </div>
            <h3 className="font-serif text-2xl text-plum">
              Curation, Finishing & Dispatch
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
              Arriving at our Mumbai studio, every completed creation undergoes a three-point quality audit: wire tension stability, clasp fluidity, and crystal facet purity. Velvet linings and interior mirrors are anchored, followed by gift packaging in breathable cotton pouches with wax seal stamps.
            </p>
            <div className="pt-2 text-[11px] text-ink-light space-y-1">
              <p>• Three-Point Quality Verification</p>
              <p>• Bespoke Calligraphy Gift Cards</p>
              <p>• Safe Pan-India Courier Dispatch</p>
            </div>
          </div>
        </section>

        {/* Section 2: Core Craft Techniques */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-monumental text-rosewood font-sans font-bold block mb-2">
              Technique & Precision
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-plum">
              The Four Pillars of Kalajay Construction
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {techniques.map((tech, idx) => (
              <div
                key={tech.title}
                className="p-6 sm:p-8 bg-canvas rounded-sm border border-border-subtle shadow-xs hover:border-rosewood/40 transition-colors"
              >
                <span className="text-xs font-mono text-champagne font-bold block mb-1">
                  0{idx + 1}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-plum mb-0.5">
                  {tech.title}
                </h3>
                <span className="text-[11px] uppercase tracking-editorial text-rosewood block mb-3 font-medium">
                  {tech.subtitle}
                </span>
                <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed mb-4">
                  {tech.desc}
                </p>
                <div className="text-[11px] text-ink-light border-t border-border-subtle pt-3 flex items-center justify-between">
                  <span>Artisan Dedication:</span>
                  <span className="font-medium text-plum">{tech.hours}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Material Taxonomy Table */}
        <section className="p-8 sm:p-12 bg-canvas-subtle rounded-sm border border-border-medium space-y-6">
          <div className="border-b border-border-subtle pb-4">
            <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block mb-1">
              Materiality & Ethical Sourcing
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-plum">
              What Goes Into Every Creation
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-border-medium text-[10px] uppercase tracking-editorial text-ink-light">
                  <th className="py-3 pr-4">Component</th>
                  <th className="py-3 px-4">Origin / Grade</th>
                  <th className="py-3 pl-4">Tactile & Structural Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-ink-muted">
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-plum">Synthetic Pearls</td>
                  <td className="py-3.5 px-4">Polished High-Density Core</td>
                  <td className="py-3.5 pl-4">Luminous ivory glow, chip-resistant, silky tactile weight.</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-plum">Faceted Crystals</td>
                  <td className="py-3.5 px-4">Prismatic Glass Bicones</td>
                  <td className="py-3.5 pl-4">Light-refracting diamond cuts, evening shimmer.</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-plum">Monofilament Wire</td>
                  <td className="py-3.5 px-4">High-Tensile Stainless Steel</td>
                  <td className="py-3.5 pl-4">Architectural stance, zero sagging, lifelong shape retention.</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-plum">Botanical Cotton Yarn</td>
                  <td className="py-3.5 px-4">100% Mercerised Botanical</td>
                  <td className="py-3.5 pl-4">Silky, breathable crochet texture that softens with touch.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Closing CTA */}
        <div className="text-center space-y-4">
          <h3 className="font-serif text-3xl text-plum">
            Experience the Craft in Your Hands
          </h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Every order is dispatched in protective packaging with direct tracking and our 48-hour transit guarantee.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors"
            >
              <span>Explore All Handcrafted Pieces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

