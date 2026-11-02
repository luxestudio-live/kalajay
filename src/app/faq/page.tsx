'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, MessageCircle, HelpCircle } from 'lucide-react';
import { FAQS } from '@/data/extras';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function FAQPage() {
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]);

  const toggleFAQ = (index: number) => {
    setOpenIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-3">
            Customer Care & Guidance
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-plum font-normal tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-xl mx-auto">
            Everything you need to know about our handmade-to-order process, dispatch schedules, custom palettes, and transit guarantees.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={faq.q}
                className="bg-canvas rounded-sm border border-border-subtle overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-canvas-subtle/40 transition-colors cursor-pointer"
                >
                  <span className="font-serif text-lg sm:text-xl text-plum font-normal">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-rosewood shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-light shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-ink-muted font-light leading-relaxed border-t border-border-subtle/60 pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Direct WhatsApp Callout */}
        <div className="mt-16 p-8 bg-canvas-subtle rounded-sm border border-border-medium text-center space-y-4">
          <HelpCircle className="w-8 h-8 mx-auto text-rosewood" />
          <h3 className="font-serif text-2xl text-plum">Still Have a Question?</h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Our atelier liaisons in Mumbai are always happy to answer questions or share live video previews of finished pieces.
          </p>
          <div className="pt-2">
            <a
              href={BRAND_CONFIG.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Message Us on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

