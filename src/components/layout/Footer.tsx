'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Heart, Instagram, MessageCircle, Mail, MapPin } from 'lucide-react';
import { BRAND_CONFIG, COLLECTIONS } from '@/data/catalogue';
import { KALAJAY_BUSINESS_PROFILE } from '@/lib/businessProfile';
import { saveFirestoreSubscriber } from '@/lib/firestore';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      try {
        await saveFirestoreSubscriber({
          email: email.trim(),
          source: 'Storefront Footer Gazette',
        });
      } catch (err) {
        console.warn('Newsletter subscription notice:', err);
      }
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#2A1E18] text-[#FAF7F2] pt-16 pb-12 border-t border-[#9E5430]/30 relative overflow-hidden">
      {/* Warm Ambient Radial Auras for Depth & Luminous Luxury */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#9E5430]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#C5A880]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Editorial Invitation Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-[#9E5430]/20">
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block group mb-1" aria-label="Kalajay">
              <img
                src="/logo.png"
                alt="Kalajay"
                className="h-12 sm:h-14 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <span className="text-[11px] uppercase tracking-refined text-[#D49B74] font-sans block font-semibold">
              Editorial Flagship · LuxeStudio Edition
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight tracking-wide text-[#FAF7F2]">
              A little wonder <br />
              <span className="italic font-light text-[#D49B74]">goes a long way.</span>
            </h3>
            <p className="font-sans text-sm text-[#E5DDD3] max-w-md leading-relaxed font-light pt-2">
              Every Kalajay object begins as a loose cluster of glass seed beads, lustrous synthetic pearls, and faceted crystals. Hand-strung, counted, and balanced with patience and devotion by our master women artisans.
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 flex flex-col justify-end">
            <div className="bg-[#1F1511] p-7 sm:p-8 rounded-xl border border-[#9E5430]/30 shadow-2xl relative overflow-hidden max-w-lg lg:ml-auto w-full">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#9E5430]/20 rounded-full blur-2xl pointer-events-none" />
              <span className="text-xs uppercase tracking-editorial text-[#D49B74] font-semibold block mb-1">
                The Kalajay Gazette
              </span>
              <p className="text-sm text-[#E5DDD3] font-light mb-4">
                Receive intimate previews, seasonal bead drops, and private Craft House dispatches.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 bg-white/5 border border-[#9E5430]/50 text-[#FAF7F2] text-xs rounded-sm">
                  <Check className="w-4 h-4 text-[#D49B74]" />
                  <span>Welcome to our inner circle. Your letter is on its way.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 relative z-10">
                  <input
                    type="email"
                    required
                    aria-label="Email address for The Kalajay Gazette newsletter"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#FAF7F2] border border-[#C5A880]/50 text-[#372921] placeholder:text-[#76695F] text-xs focus:outline-none focus:border-[#9E5430] transition-colors rounded-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#9E5430] to-[#874427] hover:from-[#B86B45] hover:to-[#9E5430] text-[#FAF7F2] text-xs tracking-editorial uppercase font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-sm shadow-md shadow-[#9E5430]/25"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Middle Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-16 border-b border-[#9E5430]/20 text-xs text-[#D8CEBF] font-sans">
          {/* Col 1: Curated Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-monumental text-[#FAF7F2] font-semibold mb-4 text-[#D49B74]">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {COLLECTIONS.slice(0, 6).map(c => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} className="hover:text-[#FAF7F2] hover:underline transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-[#D49B74] hover:text-[#FAF7F2] hover:underline inline-flex items-center gap-1 font-medium">
                  <span>View All 69 Pieces</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: The Craft House */}
          <div>
            <h4 className="text-xs uppercase tracking-monumental text-[#FAF7F2] font-semibold mb-4 text-[#D49B74]">
              The Craft House
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/story" className="hover:text-[#FAF7F2] transition-colors">
                  Our Story & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/atelier" className="hover:text-[#FAF7F2] transition-colors">
                  The Craft House & Artisans
                </Link>
              </li>
              <li>
                <Link href="/customise" className="hover:text-[#FAF7F2] transition-colors text-[#FAF7F2]">
                  Create Your Own (Custom)
                </Link>
              </li>
              <li>
                <Link href="/gifting" className="hover:text-[#FAF7F2] transition-colors">
                  Gifting & Celebrations
                </Link>
              </li>
              <li>
                <Link href="/corporate-gifting" className="hover:text-[#FAF7F2] transition-colors">
                  Wedding & Corporate Favours
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="text-xs uppercase tracking-monumental text-[#FAF7F2] font-semibold mb-4 text-[#D49B74]">
              Care & Service
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shipping-returns" className="hover:text-[#F7F3EC] transition-colors">
                  Shipping & Pan-India Dispatch
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#F7F3EC] transition-colors text-[#DED3C5]">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns#returns" className="hover:text-[#F7F3EC] transition-colors">
                  Returns & Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#F7F3EC] transition-colors">
                  Saved Pieces (Wishlist)
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#F7F3EC] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-faq-concierge'));
                    }
                  }}
                  className="hover:text-[#F7F3EC] transition-colors text-left flex items-center gap-1.5 cursor-pointer text-[#DED3C5]"
                >
                  <span>Instant FAQ Concierge</span>
                  <span className="text-[9px] uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.2 rounded-xs border border-[#D4AF37]/30 font-mono font-medium">
                    Bot
                  </span>
                </button>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F7F3EC] transition-colors">
                  Privacy Policy (DPDP 2023)
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-dpdp-preferences'));
                    }
                  }}
                  className="hover:text-[#F7F3EC] transition-colors text-left flex items-center gap-1.5 cursor-pointer text-[#DED3C5]"
                >
                  <span>Data Privacy Preferences</span>
                  <span className="text-[9px] uppercase tracking-wider bg-[#9E5430]/30 text-[#D4AF37] px-1.5 py-0.2 rounded-xs border border-[#D4AF37]/30">
                    DPDP
                  </span>
                </button>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#F7F3EC] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F7F3EC] transition-colors">
                  Craft House Inquiries & Visits
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Craft House Locations */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-monumental text-[#F7F3EC] font-medium mb-4">
              Craft Houses & Coordinates
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#9E5430] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#F7F3EC] block">Artisanal Weaving Looms</span>
                  <span className="text-[#DED3C5]">Hand-stringing, needlework & bead loom collective</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#9E5430] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#F7F3EC] block">Flagship Curation & Dispatch</span>
                  <span className="text-[#DED3C5]">Quality audit, custom packaging & pan-India shipping</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 pt-2">
                <MessageCircle className="w-4 h-4 text-[#9E5430] shrink-0" />
                <a
                  href={BRAND_CONFIG.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F7F3EC] hover:underline"
                >
                  WhatsApp: {BRAND_CONFIG.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#9E5430] shrink-0" />
                <a href={`mailto:${BRAND_CONFIG.contact.email}`} className="hover:underline text-[#F7F3EC]">
                  {BRAND_CONFIG.contact.email}
                </a>
              </div>
              <div className="pt-1 text-xs text-[#DED3C5]">
                GSTIN: <span className="font-mono text-[#F7F3EC]">{KALAJAY_BUSINESS_PROFILE.gstin}</span> · PAN: <span className="font-mono text-[#F7F3EC]">{KALAJAY_BUSINESS_PROFILE.pan}</span> · Made in India
              </div>
            </div>
          </div>
        </div>

        {/* Monumental Sculptural Brand Wordmark Spread (Official Logo Wordmark) */}
        <div className="py-10 sm:py-16 text-center select-none flex justify-center items-center w-full overflow-hidden" aria-hidden="true" role="presentation">
          <img
            src="/loader/wordmark.png"
            alt="Kalajay"
            className="w-[82vw] max-w-5xl h-auto object-contain brightness-0 invert opacity-[0.08] pointer-events-none select-none transition-opacity duration-700"
          />
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D8CEBF] font-sans gap-4 border-t border-[#9E5430]/20">
          <div className="space-y-0.5">
            <div>
              © {new Date().getFullYear()} {KALAJAY_BUSINESS_PROFILE.legalEntityName}. All rights reserved.
            </div>
            <div className="text-[11px] text-[#D8CEBF]/75">
              Official GSTIN: {KALAJAY_BUSINESS_PROFILE.gstin} · DPDP Act, 2023 Technical Safeguards · Consumer Protection (E-Commerce) Rules, 2020 Framework
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Handmade with</span>
            <Heart className="w-3 h-3 text-[#9E5430] fill-[#9E5430] inline" />
            <span>by 21 women artisans across India</span>
          </div>
          <div className="text-right">
            <span className="text-[#D8CEBF]">Bespoke Creative Direction by </span>
            <a
              href="https://theluxestudio.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FAF7F2] hover:text-[#D49B74] hover:underline font-medium transition-colors"
            >
              LuxeStudio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

