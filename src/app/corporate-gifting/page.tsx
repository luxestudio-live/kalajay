'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, ArrowRight, Check, ShieldCheck, MapPin, Building, HeartHandshake } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CorporateGiftingPage() {
  const { formatINR } = useCart();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-3">
            Institutional & Ceremonial Keepsakes
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-plum font-normal tracking-tight leading-[1.05]">
            Wedding & Corporate Favours
          </h1>
          <p className="mt-6 text-sm sm:text-base text-ink-muted font-light leading-relaxed max-w-2xl mx-auto">
            Give keepsakes that carry genuine human artistry. Customized beadwork, bespoke color palettes, and luxury packaging for milestone weddings and executive client appreciation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">
        {/* Two Offerings Columns */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Bridal & Wedding */}
          <div className="bg-canvas p-8 sm:p-10 rounded-sm border border-border-medium shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-rosewood">
              <HeartHandshake className="w-6 h-6" />
              <span className="text-xs uppercase tracking-monumental font-bold">Matrimonial Celebrations</span>
            </div>
            <h3 className="font-serif text-3xl text-plum">
              Bridal & Mehendi Favours
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
              Elevate your wedding festivities with bespoke keepsakes tailored to your wedding decor palette. From pearl coin bags and crocheted bag charms to floral coasters, our pieces serve as radiant tokens of gratitude for your loved ones.
            </p>
            <ul className="space-y-2 text-xs text-ink">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Exact palette matching to bridal lehenga and invitations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Custom couple monogram tags with hot-foil embossing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Individually boxed with satin ribbons and thank-you notes</span>
              </li>
            </ul>
          </div>

          {/* Corporate Gifting */}
          <div className="bg-canvas p-8 sm:p-10 rounded-sm border border-border-medium shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-rosewood">
              <Building className="w-6 h-6" />
              <span className="text-xs uppercase tracking-monumental font-bold">Executive & Client Care</span>
            </div>
            <h3 className="font-serif text-3xl text-plum">
              Artisanal Corporate Hampers
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
              Move away from mass-produced plastic giveaways. Offer partners, leadership teams, and key accounts handcrafted vanity trays, crystal pen holders, and coaster sets that reflect intentional taste and meaningful human craft.
            </p>
            <ul className="space-y-2 text-xs text-ink">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Formal GST invoicing & bulk corporate payment terms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Pan-India multi-location doorstep direct dispatch</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Dedicated atelier manager and pre-production sample approval</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Volume Tiers Table */}
        <section className="bg-canvas-subtle p-8 sm:p-12 rounded-sm border border-border-medium space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block mb-1">
              Tiered Volume Structures
            </span>
            <h3 className="font-serif text-3xl text-plum">
              Order Quantities & Atelier Timeline
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-canvas rounded-sm border border-border-subtle shadow-xs space-y-3">
              <span className="text-xs font-mono text-rosewood font-bold block">TIER I</span>
              <h4 className="font-serif text-2xl text-plum">25 to 50 Units</h4>
              <p className="text-xs text-ink-light">Boutique weddings, VIP client hampers, bridal party gifts.</p>
              <div className="text-xs text-ink space-y-1 pt-2 border-t border-border-subtle">
                <p>• Lead Time: 2 weeks</p>
                <p>• 10% Volume atelier advantage</p>
                <p>• Free wax-seal gift packaging</p>
              </div>
            </div>

            <div className="p-6 bg-canvas rounded-sm border border-rosewood shadow-md space-y-3 ring-1 ring-rosewood">
              <span className="text-xs font-mono text-rosewood font-bold block">TIER II · MOST POPULAR</span>
              <h4 className="font-serif text-2xl text-plum">50 to 200 Units</h4>
              <p className="text-xs text-ink-light">Grand wedding celebrations, annual corporate milestones.</p>
              <div className="text-xs text-ink space-y-1 pt-2 border-t border-border-subtle">
                <p>• Lead Time: 3 to 4 weeks</p>
                <p>• 15% Volume atelier advantage</p>
                <p>• Complimentary physical sample</p>
              </div>
            </div>

            <div className="p-6 bg-canvas rounded-sm border border-border-subtle shadow-xs space-y-3">
              <span className="text-xs font-mono text-rosewood font-bold block">TIER III</span>
              <h4 className="font-serif text-2xl text-plum">200+ Units</h4>
              <p className="text-xs text-ink-light">Large destination weddings, enterprise festive distributions.</p>
              <div className="text-xs text-ink space-y-1 pt-2 border-t border-border-subtle">
                <p>• Lead Time: 4 to 6 weeks</p>
                <p>• Custom bespoke pricing schedule</p>
                <p>• Multi-city direct courier routing</p>
              </div>
            </div>
          </div>
        </section>

        {/* Direct WhatsApp Callout */}
        <section className="bg-plum text-canvas p-8 sm:p-12 rounded-sm text-center space-y-6">
          <h3 className="font-serif text-3xl sm:text-4xl text-canvas">
            Speak Directly with Our Curation Director
          </h3>
          <p className="text-xs sm:text-sm text-canvas/75 font-light max-w-lg mx-auto leading-relaxed">
            Every celebration has its own character. Let us send you custom swatches, sample photos, and personalized price schedules over WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="https://wa.me/919740540847?text=Hi%20Kalajay!%20I%20am%20enquiring%20about%20a%20wedding/corporate%20bulk%20gifting%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-champagne hover:bg-champagne-light text-plum text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-800" />
              <span>Connect on WhatsApp (+91 97405 40847)</span>
            </a>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-canvas/10 hover:bg-canvas/20 text-canvas border border-canvas/20 text-xs uppercase tracking-editorial font-medium rounded-sm transition-colors"
            >
              <span>Email the Atelier</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

