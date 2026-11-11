'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Palette, Check } from 'lucide-react';
import { CUSTOMISER_CONFIG } from '@/data/extras';
import { useCart } from '@/context/CartContext';

export default function CustomiseTeaser() {
  const [selectedKey, setSelectedKey] = useState<string>('beaded-sling');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [selectedAccentIndex, setSelectedAccentIndex] = useState(0);
  const { formatINR } = useCart();

  const config = CUSTOMISER_CONFIG[selectedKey];
  const activePalette = config.paletteOptions[selectedPaletteIndex];
  const activeAccent = config.accentOptions[selectedAccentIndex];

  return (
    <section className="py-20 sm:py-28 bg-canvas relative overflow-hidden border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush/60 rounded-full border border-blush text-rosewood text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
            <Palette className="w-3 h-3 text-rosewood" />
            <span>Chapter 07 · Beautifully Yours</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal tracking-tight">
            Designed by You. <br />
            <span className="italic font-light text-rosewood">Woven by Our Craft House.</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted font-light mt-4 leading-relaxed">
            Have a specific colourway for an upcoming wedding or bridal party? Test our interactive customisation studio to choose beads, hardware accents, and personal monogram tags.
          </p>
        </div>

        {/* Interactive Customiser Box */}
        <div className="bg-canvas-subtle p-6 sm:p-10 rounded-sm border border-border-medium shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-7">
              {/* Step 1: Silhouette Choice */}
              <div>
                <label className="text-[11px] uppercase tracking-refined text-ink-muted block font-sans font-bold mb-3">
                  01 · Select Product Silhouette
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {Object.entries(CUSTOMISER_CONFIG).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedKey(key);
                        setSelectedPaletteIndex(0);
                        setSelectedAccentIndex(0);
                      }}
                      className={`p-3 rounded-sm text-left text-xs font-sans transition-all border cursor-pointer ${
                        selectedKey === key
                          ? 'bg-plum text-canvas border-plum shadow-md'
                          : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
                      }`}
                    >
                      <span className="font-medium block truncate">{val.productType}</span>
                      <span className={`text-[11px] mt-0.5 block ${selectedKey === key ? 'text-champagne' : 'text-rosewood font-semibold'}`}>
                        From {formatINR(val.basePrice)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Bead Palette */}
              <div>
                <label className="text-[11px] uppercase tracking-refined text-ink-muted block font-sans font-bold mb-3">
                  02 · Select Curated Bead Colorway
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {config.paletteOptions.map((pal, idx) => (
                    <button
                      key={pal.name}
                      type="button"
                      onClick={() => setSelectedPaletteIndex(idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs border transition-all cursor-pointer ${
                        selectedPaletteIndex === idx
                          ? 'bg-canvas border-rosewood shadow-sm ring-1 ring-rosewood'
                          : 'bg-canvas/60 border-border-subtle hover:border-border-strong'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-border-medium shrink-0"
                        style={{ backgroundColor: pal.hex }}
                      />
                      <span className="font-medium text-plum">{pal.name}</span>
                      {selectedPaletteIndex === idx && <Check className="w-3.5 h-3.5 text-rosewood" />}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-ink-light italic mt-2">
                  Selected palette: {activePalette.desc}
                </p>
              </div>

              {/* Step 3: Hardware Accent */}
              <div>
                <label className="text-[11px] uppercase tracking-refined text-ink-muted block font-sans font-bold mb-3">
                  03 · Hardware & Finish
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {config.accentOptions.map((acc, idx) => (
                    <button
                      key={acc.name}
                      type="button"
                      onClick={() => setSelectedAccentIndex(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs border transition-all cursor-pointer ${
                        selectedAccentIndex === idx
                          ? 'bg-canvas border-rosewood shadow-sm ring-1 ring-rosewood'
                          : 'bg-canvas/60 border-border-subtle hover:border-border-strong'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-border-medium"
                        style={{ backgroundColor: acc.hex }}
                      />
                      <span className="text-plum">{acc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Spec Card Preview */}
            <div className="lg:col-span-5 bg-canvas p-6 sm:p-8 rounded-sm border border-border-medium shadow-md space-y-5">
              <div className="border-b border-border-subtle pb-4">
                <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-1">
                  Custom Specification Sheet
                </span>
                <h3 className="font-serif text-2xl text-plum">
                  {config.productType}
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Handmade to order in our craft house
                </p>
              </div>

              <div className="space-y-3 text-xs text-ink">
                <div className="flex justify-between py-1 border-b border-border-subtle/60">
                  <span className="text-ink-muted">Colorway:</span>
                  <span className="font-medium text-plum">{activePalette.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-subtle/60">
                  <span className="text-ink-muted">Hardware Accent:</span>
                  <span className="font-medium text-plum">{activeAccent.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-subtle/60">
                  <span className="text-ink-muted">Artisan Lead Time:</span>
                  <span className="font-medium text-plum">{config.turnaroundDays} to 7 Days</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-semibold text-plum border-t border-border-subtle">
                  <span>Custom Piece Estimate:</span>
                  <span className="font-serif text-xl text-rosewood">{formatINR(config.basePrice)}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/customise"
                  className="w-full py-3.5 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-medium rounded-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Open Full Custom Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-[11px] text-ink-muted">
                  Includes personalized initials, gift packaging & WhatsApp artist approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

