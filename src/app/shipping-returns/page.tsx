'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, CheckCircle2, XCircle, RefreshCw, MessageCircle, AlertCircle, HelpCircle, ChevronDown, Package } from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function ShippingReturnsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I track my order once it has been dispatched?',
      a: 'As soon as your parcel is packed and handed to our courier partner in Mumbai, we send an automated tracking link directly to your WhatsApp number and email address with live milestone updates.'
    },
    {
      q: 'What if my parcel arrives with visible exterior damage?',
      a: 'Please take a clear photo or short video of the outer box before unboxing, and contact our WhatsApp Concierge within 48 hours. We arrange a 100% complimentary immediate replacement.'
    },
    {
      q: 'Can I request express delivery for an upcoming birthday or wedding?',
      a: 'Yes. If you have an urgent deadline within 48–72 hours, message our studio concierge via WhatsApp prior to or immediately after ordering. We can expedite Craft House production and dispatch via priority air express.'
    },
    {
      q: 'Do you ship internationally outside India?',
      a: 'Currently our website natively handles Pan-India shipments with free shipping above ₹599. For international deliveries (USA, UK, UAE, Australia, Europe), message our concierge for custom DHL express quotations.'
    }
  ];

  return (
    <div className="bg-canvas min-h-screen pb-28 selection:bg-blush selection:text-plum">
      {/* 1. EDITORIAL HEADER */}
      <section className="bg-canvas-subtle/80 border-b border-border-subtle py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-[radial-gradient(#9E5430_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[11px] uppercase tracking-monumental text-rosewood font-sans font-semibold block">
            Craft House Logistics &amp; Peace of Mind
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-plum font-normal tracking-tight">
            Shipping &amp; Return Guarantee
          </h1>
          <p className="mt-4 text-sm sm:text-base text-ink-muted font-light leading-relaxed max-w-2xl mx-auto">
            Transparent dispatch timelines, Pan-India insured delivery, and our clear 48-hour transit protection pledge for every handmade piece.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-ink-light uppercase tracking-editorial">
            <span>Free Pan-India Delivery Above ₹599</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>48-Hour Transit Guarantee</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">
        {/* 2. THE THREE-COLUMN POLICY MATRIX: Eligible · Not Eligible · Resolution */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-monumental text-rosewood font-bold">
              Fair &amp; Transparent Policy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-plum">
              Our 48-Hour Guarantee at a Glance
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted font-light">
              Because every piece is hand-strung to order, here is exactly how we protect your purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Eligible */}
            <div className="p-8 rounded-[28px] bg-emerald-50/50 border border-emerald-200/60 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs uppercase tracking-monumental font-bold">Eligible for Replacement</span>
                </div>
                <h3 className="font-serif text-2xl text-plum">100% Free Remake</h3>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  We take complete responsibility if your piece arrives with any of the following within 48 hours of delivery:
                </p>
                <ul className="space-y-2.5 text-xs text-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>Transit damage, chipped crystals, or crushed box frames.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>Incorrect item, colorway, or variant dispatched.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>Structural clasp, handle, or wire tension fault.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-emerald-200/50 text-[11px] font-medium text-emerald-800">
                ✓ Zero return shipping fee for damaged items
              </div>
            </div>

            {/* Column 2: Not Eligible */}
            <div className="p-8 rounded-[28px] bg-rose-50/40 border border-rose-200/60 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-rose-800">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-xs uppercase tracking-monumental font-bold">Not Eligible</span>
                </div>
                <h3 className="font-serif text-2xl text-plum">Exceptions</h3>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  Due to the handcrafted, made-to-order nature of each piece, we cannot accept returns for:
                </p>
                <ul className="space-y-2.5 text-xs text-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">•</span>
                    <span>Change of mind or arbitrary returns after dispatch.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">•</span>
                    <span>Bespoke custom-monogrammed or customized favors.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">•</span>
                    <span>Natural microscopic bead tone variance inherent in handmade glass.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-rose-200/50 text-[11px] font-medium text-rose-800">
                ⚠ Please review dimensions and photos before ordering
              </div>
            </div>

            {/* Column 3: Resolution Process */}
            <div className="p-8 rounded-[28px] bg-canvas-subtle border border-gold/40 space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-rosewood">
                  <RefreshCw className="w-5 h-5 text-gold" />
                  <span className="text-xs uppercase tracking-monumental font-bold">Fast Resolution</span>
                </div>
                <h3 className="font-serif text-2xl text-plum">24–48 Hr Turnaround</h3>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  How we resolve valid claims swiftly and without friction:
                </p>
                <ul className="space-y-2.5 text-xs text-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-bold mt-0.5">1.</span>
                    <span>Send photo/video to WhatsApp within 48h of unboxing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-bold mt-0.5">2.</span>
                    <span>Our studio concierge approves within 4 working hours.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-bold mt-0.5">3.</span>
                    <span>Priority replacement remake dispatched in 24–48 hours.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-border-subtle text-[11px] font-medium text-rosewood">
                ✓ Full refund issued if replacement cannot be remade
              </div>
            </div>
          </div>

          {/* 1-Click WhatsApp Return Button */}
          <div className="p-6 rounded-[28px] bg-blush/30 border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif text-lg text-plum font-medium">Need to request a replacement or report damaged transit?</h4>
              <p className="text-xs text-ink-muted font-light">
                Click below to start an instant WhatsApp claim with pre-formatted order details.
              </p>
            </div>
            <a
              href="https://wa.me/919740540847?text=Hi%20Kalajay%20Studio,%20I'd%20like%20to%20request%20a%20replacement%20for%20my%20order.%20Order%20ID:%20[Enter%20Order%20ID]%20Item:%20[Item%20Name]%20Issue:%20[Damaged/Wrong%20Item]"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-plum hover:bg-plum/90 text-canvas text-xs uppercase tracking-editorial font-semibold rounded-full transition-all shrink-0 shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>1-Click WhatsApp Return Request</span>
            </a>
          </div>
        </section>

        {/* 3. DISPATCH & DELIVERY JOURNEY TIMELINE */}
        <section className="space-y-8 pt-10 border-t border-border-subtle">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-monumental text-rosewood font-bold">
              From Loom to Doorstep
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-plum">
              The Journey of Your Little Wonder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[24px] bg-canvas-subtle border border-border-subtle space-y-3">
              <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-rosewood font-serif text-base font-semibold">
                01
              </div>
              <h4 className="font-serif text-xl text-plum">Artisan Hand-Stringing</h4>
              <p className="text-xs text-ink-muted font-light leading-relaxed">
                3 to 5 business days. Your creation is individually strung and woven on frames by our master women artisans.
              </p>
            </div>

            <div className="p-6 rounded-[24px] bg-canvas-subtle border border-border-subtle space-y-3">
              <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-rosewood font-serif text-base font-semibold">
                02
              </div>
              <h4 className="font-serif text-xl text-plum">Mumbai QC &amp; Wax-Seal</h4>
              <p className="text-xs text-ink-muted font-light leading-relaxed">
                1 business day. 12-point quality check, lining installation, cotton dust pouch packaging, and antique gold wax stamping.
              </p>
            </div>

            <div className="p-6 rounded-[24px] bg-canvas-subtle border border-border-subtle space-y-3">
              <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-rosewood font-serif text-base font-semibold">
                03
              </div>
              <h4 className="font-serif text-xl text-plum">Express Doorstep Transit</h4>
              <p className="text-xs text-ink-muted font-light leading-relaxed">
                2 to 4 days for Metros, 4 to 7 days for regional pincodes. Insured Pan-India transit with live WhatsApp tracking.
              </p>
            </div>
          </div>

          {/* Pricing Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-[24px] bg-canvas-subtle border border-border-subtle">
              <span className="text-[11px] uppercase tracking-refined text-rosewood font-bold block mb-1">
                Cart Value ₹599 &amp; Above
              </span>
              <h4 className="font-serif text-3xl text-plum font-normal">Free Shipping</h4>
              <p className="text-xs text-ink-light mt-1">
                Complimentary insured courier delivery across all 19,000+ serviceable Indian pin codes.
              </p>
            </div>

            <div className="p-6 rounded-[24px] bg-canvas-subtle border border-border-subtle">
              <span className="text-[11px] uppercase tracking-refined text-ink-light font-bold block mb-1">
                Cart Value Below ₹599
              </span>
              <h4 className="font-serif text-3xl text-plum font-normal">Flat ₹79</h4>
              <p className="text-xs text-ink-light mt-1">
                Nominal subsidized courier fee covering padded protective transit and live tracking.
              </p>
            </div>
          </div>
        </section>

        {/* 4. FREQUENTLY ASKED QUESTIONS */}
        <section className="space-y-6 pt-10 border-t border-border-subtle">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-monumental text-rosewood font-bold">
              Clarifications &amp; Care
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-plum">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-[20px] bg-canvas-subtle border border-border-subtle overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-lg text-plum hover:text-rosewood transition-colors"
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-ink-muted transition-transform duration-200 shrink-0 ${openFaq === idx ? 'rotate-180 text-rosewood' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-ink-muted font-light leading-relaxed border-t border-border-subtle/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. CONTACT CONCIERGE BANNER */}
        <div className="p-10 rounded-[32px] bg-plum text-canvas flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[11px] uppercase tracking-monumental text-champagne font-bold block">
              Direct Studio Support
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-canvas">
              Have a question about your order or tracking?
            </h3>
            <p className="text-xs sm:text-sm text-canvas/75 font-light">
              Our Mumbai studio concierge is available Monday to Saturday, 10 AM to 7 PM IST.
            </p>
          </div>
          <a
            href="https://wa.me/919740540847?text=Hi%20Kalajay,%20I%20have%20a%20question%20about%20shipping%20and%20orders."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-champagne hover:bg-champagne-light text-plum text-xs uppercase tracking-editorial font-semibold rounded-full transition-colors shrink-0 shadow-md"
          >
            <MessageCircle className="w-4 h-4 text-plum" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
