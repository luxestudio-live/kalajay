'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import SearchModal from '../ui/SearchModal';

import SmoothScroll from '../motion/SmoothScroll';
import TheThread from '../motion/TheThread';
import CustomCursor from '../ui/CustomCursor';
import Preloader from '../ui/Preloader';
import PageTransitionCurtain from '../ui/PageTransitionCurtain';
import PWAInstallPrompt from '../ui/PWAInstallPrompt';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <SmoothScroll>
      <Preloader />
      <PageTransitionCurtain />
      <CustomCursor />
      <TheThread />

      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-1 min-h-[calc(100vh-250px)] relative z-10">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <PWAInstallPrompt />

      {/* Floating Artisan WhatsApp Concierge */}
      <a
        href="https://wa.me/919740540847?text=Hello%20Kalajay%20Craft%20House%2C%20I%20am%20exploring%20your%20handcrafted%20pieces."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] hover:shadow-[0_10px_35px_rgba(37,211,102,0.45)] hover:scale-108 active:scale-95 transition-all duration-300 flex items-center justify-center p-2.5 border border-[#DED3C5] cursor-pointer group"
        aria-label="Chat with Kalajay on WhatsApp"
        title="Chat with Kalajay on WhatsApp (+91 97405 40847)"
      >
        <img
          src="/whatsapp.png"
          alt="WhatsApp Concierge"
          className="w-full h-full object-contain transition-transform group-hover:scale-105"
        />
      </a>
    </SmoothScroll>
  );
}

