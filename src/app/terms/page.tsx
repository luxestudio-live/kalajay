'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Lock } from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function TermsPage() {
  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-3">
            Legal & Consumer Protocols
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-plum font-normal tracking-tight">
            Terms of Service & Privacy
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-xl mx-auto">
            Governing the use of Kalajay’s digital flagship, bespoke custom order agreements, and data privacy safeguards.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-12 text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal">1. Handcrafted Nature of Goods</h2>
          <p>
            All products displayed on Kalajay (kalajay.in) are handcrafted individually by women artisans across our dedicated craft studios. As a result of patient manual assembly, subtle nuances in bead tension, facet reflections, and minor dimensions are organic characteristics of authentic human craft rather than commercial defects.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal">2. Pricing & Commercial Transparency</h2>
          <p>
            All prices listed on the digital storefront are denominated in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST). Kalajay operates under registered GSTIN: <strong className="text-plum font-mono">{BRAND_CONFIG.contact.gst}</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal">3. Bespoke & Custom Orders</h2>
          <p>
            Custom orders created through the &quot;Create Your Own&quot; studio or approved via WhatsApp are individually hand-crafted to your requested specifications. Once custom bead stringing commences on our looms, custom orders cannot be cancelled or altered without prior consent from the Craft House manager.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal">4. Consumer Privacy & Communications</h2>
          <p>
            We collect personal contact information (name, delivery address, phone number, email) solely for fulfilling orders, dispatching real-time courier tracking updates, and providing direct WhatsApp customer support. We never sell, rent, or lease customer data to third-party marketing brokers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal">5. Intellectual Property & Original Direction</h2>
          <p>
            The Kalajay trademark, original product designs, editorial photography, and digital flagship presentation are the exclusive intellectual property of Kalajay Handcrafted. Original creative direction and luxury agency development executed by LuxeStudio.
          </p>
        </section>

        <div className="pt-8 border-t border-border-subtle text-xs text-ink-light flex items-center justify-between">
          <span>Last revised: November 2026</span>
          <Link href="/contact" className="text-rosewood font-medium hover:underline">
            Questions? Contact the Studio →
          </Link>
        </div>
      </div>
    </div>
  );
}

