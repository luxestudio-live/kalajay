'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

import SmoothScroll from '../motion/SmoothScroll';
import TheThread from '../motion/TheThread';
import PageTransitionCurtain from '../ui/PageTransitionCurtain';

// Mount Preloader strictly on the client so CSS animations play once and never restart on SSR hydration
const Preloader = dynamic(() => import('../ui/Preloader'), { ssr: false });

// Defer non-critical client overlays from initial main-thread hydration bundle
const CartDrawer = dynamic(() => import('../cart/CartDrawer'), { ssr: false });
const SearchModal = dynamic(() => import('../ui/SearchModal'), { ssr: false });
const PWAInstallPrompt = dynamic(() => import('../ui/PWAInstallPrompt'), { ssr: false });
const DPDPConsentBanner = dynamic(() => import('../ui/DPDPConsentBanner'), { ssr: false });
const FAQConcierge = dynamic(() => import('../ui/FAQConcierge'), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Admin operational console routes are completely isolated from storefront chrome
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] text-[#372921] font-sans antialiased">
        {children}
      </div>
    );
  }

  return (
    <>
      <Preloader />
      <PageTransitionCurtain />
      <SmoothScroll>
        <TheThread />

      {/* Official Kalajay Emblem Watermark at 5% Opacity */}
      <div
        className="fixed inset-0 z-0 pointer-events-none select-none flex items-center justify-center overflow-hidden"
        aria-hidden="true"
        role="presentation"
      >
        <img
          src="/loader/emblem.png"
          alt=""
          className="w-[85vw] max-w-2xl aspect-[430/226] object-contain opacity-[0.05]"
        />
      </div>

      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-1 min-h-[calc(100vh-250px)] relative z-10">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
      <PWAInstallPrompt />
      <DPDPConsentBanner />
      <FAQConcierge />

      {/* Floating Artisan WhatsApp Concierge */}
      <a
        href="https://wa.me/919740540847?text=Hello%20Kalajay%20Craft%20House%2C%20I%20am%20exploring%20your%20handcrafted%20pieces."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] hover:bg-white text-[#9E5430] shadow-[0_8px_30px_rgba(55,41,33,0.18)] hover:shadow-[0_10px_35px_rgba(158,84,48,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center p-2.5 border border-[#DED3C5] cursor-pointer group"
        aria-label="Chat with Kalajay on WhatsApp"
        title="Chat with Kalajay on WhatsApp (+91 97405 40847)"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[#9E5430] transition-transform group-hover:scale-110" />
      </a>
      </SmoothScroll>
    </>
  );
}

