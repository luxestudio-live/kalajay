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
    </SmoothScroll>
  );
}

