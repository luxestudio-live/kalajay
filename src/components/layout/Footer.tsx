'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Heart, Instagram, MessageCircle, Mail, MapPin } from 'lucide-react';
import { BRAND_CONFIG, COLLECTIONS } from '@/data/catalogue';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#372921] text-[#F7F3EC] pt-16 pb-12 border-t border-[#DED3C5]/20 relative overflow-hidden">
      {/* Subtle Background Radial Aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9E5430]/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#9E5430]/10 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Editorial Invitation Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-[#DED3C5]/15">
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block group mb-1" aria-label="Kalajay">
              <img
                src="/logo.png"
                alt="Kalajay"
                className="h-12 sm:h-14 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <span className="text-[11px] uppercase tracking-refined text-[#DED3C5] font-sans block font-medium">
              Editorial Flagship · LuxeStudio Edition
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight tracking-wide text-[#F7F3EC]">
              A little wonder <br />
              <span className="italic font-light text-[#DED3C5]">goes a long way.</span>
            </h3>
            <p className="font-sans text-sm text-[#DED3C5] max-w-md leading-relaxed font-light pt-2">
              Every Kalajay object begins as a loose cluster of glass seed beads, lustrous synthetic pearls, and faceted crystals. Hand-strung, counted, and balanced with patience and devotion by our master women artisans.
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 flex flex-col justify-end">
            <div className="bg-[#2A1F19] p-7 sm:p-8 rounded-sm border border-[#DED3C5]/20 max-w-lg lg:ml-auto w-full">
              <span className="text-xs uppercase tracking-editorial text-[#DED3C5] font-medium block mb-1">
                The Kalajay Gazette
              </span>
              <p className="text-sm text-[#EAE2D8] font-light mb-4">
                Receive intimate previews, seasonal bead drops, and private Craft House dispatches.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 bg-white/5 border border-[#9E5430]/40 text-[#F7F3EC] text-xs rounded-sm">
                  <Check className="w-4 h-4 text-[#9E5430]" />
                  <span>Welcome to our inner circle. Your letter is on its way.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#FFFCF7] border border-[#DED3C5] text-[#372921] placeholder:text-[#76695F] text-xs focus:outline-none focus:border-[#9E5430] transition-colors rounded-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#9E5430] hover:bg-[#874427] text-white text-xs tracking-editorial uppercase font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-sm shadow-xs"
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-16 border-b border-[#DED3C5]/15 text-xs text-[#DED3C5] font-sans">
          {/* Col 1: Curated Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-monumental text-[#F7F3EC] font-medium mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {COLLECTIONS.slice(0, 6).map(c => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} className="hover:text-[#F7F3EC] hover:underline transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-[#9E5430] hover:text-[#F7F3EC] hover:underline inline-flex items-center gap-1">
                  <span>View All 69 Pieces</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: The Craft House */}
          <div>
            <h4 className="text-xs uppercase tracking-monumental text-[#F7F3EC] font-medium mb-4">
              The Craft House
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/story" className="hover:text-[#F7F3EC] transition-colors">
                  Our Story & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/atelier" className="hover:text-[#F7F3EC] transition-colors">
                  The Craft House & Artisans
                </Link>
              </li>
              <li>
                <Link href="/customise" className="hover:text-[#F7F3EC] transition-colors text-[#F0E9DF]">
                  Create Your Own (Custom)
                </Link>
              </li>
              <li>
                <Link href="/gifting" className="hover:text-[#F7F3EC] transition-colors">
                  Gifting & Celebrations
                </Link>
              </li>
              <li>
                <Link href="/corporate-gifting" className="hover:text-[#F7F3EC] transition-colors">
                  Wedding & Corporate Favours
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="text-xs uppercase tracking-monumental text-[#F7F3EC] font-medium mb-4">
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
                <Link href="/privacy" className="hover:text-[#F7F3EC] transition-colors">
                  Privacy Policy
                </Link>
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
                GST: {BRAND_CONFIG.contact.gst} · Made in India
              </div>
            </div>
          </div>
        </div>

        {/* Monumental Sculptural Wordmark Spread */}
        <div className="py-8 sm:py-12 text-center select-none flex justify-center items-center w-full overflow-hidden" aria-hidden="true" role="presentation">
          <div className="font-serif text-[12vw] sm:text-[13vw] lg:text-[13.5vw] leading-none tracking-[0.05em] sm:tracking-[0.08em] text-[#F7F3EC]/[0.08] font-normal uppercase pointer-events-none transition-transform duration-700 select-none whitespace-nowrap">
            KALAJAY
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#DED3C5] font-sans gap-4 border-t border-[#DED3C5]/15">
          <div>
            © {new Date().getFullYear()} Kalajay Handcrafted. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Handmade with</span>
            <Heart className="w-3 h-3 text-[#9E5430] fill-[#9E5430] inline" />
            <span>by 21 women artisans across India</span>
          </div>
          <div className="text-right">
            <span className="text-[#DED3C5]">Bespoke Creative Direction by </span>
            <a
              href="https://theluxestudio.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F7F3EC] hover:underline font-medium"
            >
              LuxeStudio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

