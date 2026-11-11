'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gift,
  ArrowRight,
  Check,
  Calendar,
  Package,
  Heart,
  MessageCircle,
  Building,
  HeartHandshake,
  CheckCircle2,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { GIFTING_PACKAGES } from '@/data/extras';
import { useCart } from '@/context/CartContext';

export default function GiftingPage() {
  const { formatINR } = useCart();

  // Hamper Builder state
  const [occasion, setOccasion] = useState('Wedding Favours');
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'Pearl Vanity Box',
    'Pearl Beaded Coasters (Set of 2)',
  ]);
  const [sealColor, setSealColor] = useState('Deep Rosewood');
  const [hamperQty, setHamperQty] = useState(50);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientDate, setClientDate] = useState('');

  const itemOptions = [
    { name: 'Pearl Vanity Box', price: 999, category: 'Organiser' },
    { name: 'Crystal Butterfly Clutch', price: 1299, category: 'Purses' },
    { name: 'Pearl Beaded Coasters (Set of 2)', price: 449, category: 'Table' },
    { name: 'Handcrafted Tealight Lantern', price: 499, category: 'Festive' },
    { name: 'Crochet Floral Bag Charm', price: 299, category: 'Accessories' },
    { name: 'Crystal Tissue Box Dispenser', price: 899, category: 'Desk' },
  ];

  const sealOptions = [
    { name: 'Heritage Terracotta', hex: '#9E5430' },
    { name: 'Soft Ivory', hex: '#F7F3EC' },
    { name: 'Dark Cacao', hex: '#372921' },
    { name: 'Warm Champagne', hex: '#F0E9DF' },
  ];

  const toggleItem = (name: string) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  // Hamper price calculation with volume tiers
  const baseHamperCost = selectedItems.reduce((acc, itemName) => {
    const found = itemOptions.find((i) => i.name === itemName);
    return acc + (found ? found.price : 0);
  }, 150); // ₹150 for rigid luxury gift box, cotton pouch & wax seal

  // Volume discount: 25+ = 10%, 50+ = 15%, 100+ = 20%
  const discountRate = hamperQty >= 100 ? 0.2 : hamperQty >= 50 ? 0.15 : hamperQty >= 25 ? 0.1 : 0;
  const discountedUnitCost = Math.round(baseHamperCost * (1 - discountRate));
  const totalHamperCost = discountedUnitCost * hamperQty;

  const waHamperText = `Hi Kalajay! I built a custom gifting hamper on your flagship studio:\n\n• Occasion: ${occasion}\n• Curated Items: ${selectedItems.join(', ')}\n• Wax Seal: ${sealColor}\n• Quantity: ${hamperQty} hampers\n• Estimated Unit Cost: ${formatINR(discountedUnitCost)} (${discountRate * 100}% volume tier applied)\n• Estimated Total: ${formatINR(totalHamperCost)}\n• Event Date: ${clientDate || 'Upcoming'}\n• Client: ${clientName || 'Private Client'}\n\nCould you please review and share the formal invoice / sample timeline?`;
  const waHamperUrl = `https://wa.me/919740540847?text=${encodeURIComponent(waHamperText)}`;

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
            <Gift className="w-3.5 h-3.5 text-gold" />
            <span>Gifts & Celebrations · Flagship Curation</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-ink font-normal tracking-tight leading-[1.05]">
            The Art of Thoughtful Giving
          </h1>
          <p className="mt-6 text-sm sm:text-base text-ink-muted font-light leading-relaxed max-w-2xl mx-auto">
            From intimate birthday keepsakes to 500-piece bespoke bridal favours. We coordinate custom palette matching, handwritten calligraphy notes, and insured doorstep delivery across India.
          </p>
        </div>
      </div>

      {/* 4 Dedicated Scroll Chapters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 space-y-24">
        {/* Chapter 1: Wedding Favours */}
        <section id="wedding" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-image overflow-hidden bg-canvas-subtle border border-border-gold shadow-xl">
            <img
              src="https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp"
              alt="Bridal and Mehendi Favours"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-plum/90 backdrop-blur-sm text-champagne text-[11px] uppercase tracking-refined px-3 py-1 rounded-full font-medium">
              Chapter 01 · Matrimonial
            </div>
          </div>
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2 text-rosewood">
              <HeartHandshake className="w-5 h-5" />
              <span className="text-[11px] uppercase tracking-refined font-semibold">Wedding & Bridal Favours</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-plum leading-snug">
              Tokens of Gratitude for Your Most Sacred Milestone.
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
              Elevate your wedding festivities with keepsakes matched precisely to your bridal lehenga and invitation palette. From pearl coin bags and crystal clutches to floral coasters, our pieces serve as unforgettable heirlooms for your guests.
            </p>
            <div className="space-y-2 text-xs text-ink-muted pt-2 border-t border-border-subtle">
              <p>• Custom palette matching to wedding invitations</p>
              <p>• Personalized couple monogram hot-foil tags</p>
              <p>• Minimum 25 units with tiered volume pricing</p>
            </div>
            <div className="pt-2">
              <a
                href="#builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-refined font-semibold rounded-full shadow-md transition-colors"
              >
                <span>Build Wedding Hamper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Chapter 2: Corporate Gifting */}
        <section id="corporate" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5 lg:order-1">
            <div className="flex items-center gap-2 text-rosewood">
              <Building className="w-5 h-5" />
              <span className="text-[11px] uppercase tracking-refined font-semibold">Corporate & Executive Curation</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-plum leading-snug">
              Tactile Appreciation for Teams & Prestigious Clients.
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
              Move past generic plastic hampers. Offer clients and team members handcrafted desk sculptures—pearl-beaded vanity trays, crystal tissue dispensers, and coaster sets that celebrate patient human craft.
            </p>
            <div className="space-y-2 text-xs text-ink-muted pt-2 border-t border-border-subtle">
              <p>• Official GST Invoicing & Corporate Purchase Orders</p>
              <p>• Multi-Drop Doorstep Dispatch across major Indian metros</p>
              <p>• Debossed corporate letterhead cards and luxury packaging</p>
            </div>
            <div className="pt-2">
              <Link
                href="/corporate-gifting"
                className="inline-flex items-center gap-2 px-6 py-3 bg-canvas border border-border-strong text-plum hover:border-rosewood hover:text-rosewood text-xs uppercase tracking-refined font-medium rounded-full transition-colors"
              >
                <span>View Corporate Guidelines</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-image overflow-hidden bg-canvas-subtle border border-border-gold shadow-xl lg:order-2">
            <img
              src="https://www.kalajay.in/media/products/b1bae023973762e04b7bd33024aec63f9ee9b6d6d97aac39f51a0a78d9c4df1b.webp"
              alt="Corporate Handcrafted Desk Sculptures"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-plum/90 backdrop-blur-sm text-champagne text-[11px] uppercase tracking-refined px-3 py-1 rounded-full font-medium">
              Chapter 02 · Institutional
            </div>
          </div>
        </section>

        {/* Chapter 3: Festive Hampers */}
        <section id="festive" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-image overflow-hidden bg-canvas-subtle border border-border-gold shadow-xl">
            <img
              src="https://www.kalajay.in/media/products/05c487e5d0ba14e30995c085eb1718b4d752a4e1e93bff6dce835a1e98fcaf42.webp"
              alt="Festive Tealight Lanterns and Hampers"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-plum/90 backdrop-blur-sm text-champagne text-[11px] uppercase tracking-refined px-3 py-1 rounded-full font-medium">
              Chapter 03 · Celebrations
            </div>
          </div>
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2 text-rosewood">
              <Calendar className="w-5 h-5" />
              <span className="text-[11px] uppercase tracking-refined font-semibold">Festive Milestones</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-plum leading-snug">
              Prismatic Candlelight & Warm Seasonal Ceremony.
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
              Celebrate Diwali, Rakhi, and seasonal gatherings with luminous light. Our hand-beaded tealight lanterns reflect warm candle glow across dining tables, paired with organic soy tealights and jewel-tone mats.
            </p>
            <div className="space-y-2 text-xs text-ink-muted pt-2 border-t border-border-subtle">
              <p>• Includes paired organic soy wax tea lights</p>
              <p>• Wax-sealed greeting envelope with gold foil lettering</p>
              <p>• Curated gift sets starting from ₹499</p>
            </div>
            <div className="pt-2">
              <a
                href="#builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-refined font-semibold rounded-full shadow-md transition-colors"
              >
                <span>Curate Festive Set</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Chapter 4 & Interactive Hamper Builder */}
        <section id="builder" className="pt-12 border-t border-border-subtle">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
              <Palette className="w-3.5 h-3.5 text-gold" />
              <span>Interactive Craft House Studio</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-normal tracking-tight">
              Curate Your Custom Hamper
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted font-light mt-3 leading-relaxed">
              Mix and match pieces, select custom wax seals, view instant volume pricing, and transmit a structured order request straight to our master makers.
            </p>
          </div>

          {/* Builder Interface Two-Column Spread */}
          <div className="bg-canvas-subtle p-6 sm:p-10 lg:p-12 rounded-image border border-border-gold shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Configurator Controls (Span 7) */}
              <div className="lg:col-span-7 space-y-8">
                {/* Step 1: Occasion */}
                <div>
                  <label className="text-[11px] uppercase tracking-refined font-bold text-plum block mb-3">
                    01 · Select Occasion
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Wedding Favours', 'Corporate Gifting', 'Diwali & Festive', 'Milestone Birthday'].map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setOccasion(occ)}
                        className={`p-3 rounded-image text-xs text-center border transition-all cursor-pointer ${
                          occasion === occ
                            ? 'bg-plum text-canvas border-plum font-medium shadow-xs'
                            : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Pick Pieces to Include */}
                <div>
                  <label className="text-[11px] uppercase tracking-refined font-bold text-plum block mb-3">
                    02 · Select Handcrafted Pieces to Include in Box
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {itemOptions.map((item) => {
                      const isSelected = selectedItems.includes(item.name);
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => toggleItem(item.name)}
                          className={`p-3.5 rounded-image text-left border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-canvas border-rosewood ring-1 ring-rosewood shadow-xs'
                              : 'bg-canvas/60 border-border-subtle hover:border-border-strong'
                          }`}
                        >
                          <div>
                            <span className="font-serif text-sm text-plum block">{item.name}</span>
                            <span className="text-[11px] text-rosewood font-medium">
                              +{formatINR(item.price)}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'bg-rosewood text-canvas border-rosewood' : 'border-border-medium'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Wax Seal Finish */}
                <div>
                  <label className="text-[11px] uppercase tracking-refined font-bold text-plum block mb-3">
                    03 · Select Wax Seal & Ribbon Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {sealOptions.map((seal) => (
                      <button
                        key={seal.name}
                        type="button"
                        onClick={() => setSealColor(seal.name)}
                        className={`px-3.5 py-2 rounded-full border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          sealColor === seal.name
                            ? 'bg-canvas border-rosewood ring-1 ring-rosewood'
                            : 'bg-canvas/60 border-border-subtle'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: seal.hex }}
                        />
                        <span className="text-plum font-medium">{seal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Quantity Tier */}
                <div>
                  <label className="text-[11px] uppercase tracking-refined font-bold text-plum block mb-3">
                    04 · Select Estimated Quantity (Volume Tiers Applied)
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[15, 25, 50, 100, 250].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setHamperQty(qty)}
                        className={`px-4 py-2 rounded-full border text-xs transition-all cursor-pointer ${
                          hamperQty === qty
                            ? 'bg-plum text-canvas border-plum font-semibold'
                            : 'bg-canvas text-ink border-border-subtle'
                        }`}
                      >
                        {qty} Units
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Live Summary Card (Span 5) */}
              <div className="lg:col-span-5 bg-canvas p-6 sm:p-8 rounded-image border border-border-gold shadow-md flex flex-col justify-between space-y-6">
                <div>
                  <div className="border-b border-border-subtle pb-4">
                    <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-1">
                      Hamper Specification
                    </span>
                    <h3 className="font-serif text-2xl text-plum">
                      {occasion}
                    </h3>
                    <p className="text-xs text-ink-muted mt-1">
                      Packed in rigid matte keepsake box with wax seal
                    </p>
                  </div>

                  <div className="py-4 space-y-3 text-xs text-ink">
                    <div>
                      <span className="text-ink-muted block text-[11px]">Selected Pieces:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedItems.map((item) => (
                          <li key={item} className="flex items-center gap-1.5 text-plum font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rosewood" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between py-1 border-t border-border-subtle/60">
                      <span className="text-ink-muted">Wax Seal Accent:</span>
                      <span className="font-medium text-plum">{sealColor}</span>
                    </div>

                    <div className="flex justify-between py-1 border-t border-border-subtle/60">
                      <span className="text-ink-muted">Volume Discount:</span>
                      <span className="font-semibold text-emerald-800">
                        {discountRate > 0 ? `${discountRate * 100}% Applied` : 'Standard Rate'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-t border-border-subtle/60">
                      <span className="text-ink-muted">Estimated Per Hamper:</span>
                      <span className="font-serif text-lg font-semibold text-plum">
                        {formatINR(discountedUnitCost)}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-t border-border-subtle text-sm font-semibold text-plum">
                      <span>Total ({hamperQty} Hampers):</span>
                      <span className="font-serif text-2xl text-rosewood">{formatINR(totalHamperCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Structured WhatsApp Button */}
                <div className="space-y-3 pt-2">
                  <a
                    href={waHamperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-monumental font-semibold rounded-full flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span>Enquire via WhatsApp</span>
                  </a>
                  <p className="text-center text-[11px] text-ink-muted">
                    Instant confirmation with our Mumbai dispatch coordinator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
