'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, Gem, Heart, Smartphone, Download, User, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { COLLECTIONS } from '@/data/catalogue';

interface NavbarProps {
  onOpenSearch: () => void;
}

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsDropdown, setCollectionsDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCollectionsDropdown(false);
  }, [pathname]);

  return (
    <>
      {/* Top Luxury Marquee Ticker - continuously moves from right to left */}
      <div
        className={`bg-plum text-canvas font-sans text-[11px] sm:text-xs tracking-refined border-b border-plum-light/20 relative z-40 overflow-hidden transition-all duration-300 select-none group ${
          isScrolled ? 'max-h-0 py-0 opacity-0 border-b-0' : 'max-h-12 py-2 opacity-100'
        }`}
        title="Continuous Craft House Ticker (Hover to pause)"
      >
        <div className="animate-marquee-rtl flex items-center">
          {[0, 1, 2, 3].map((copyIndex) => (
            <div
              key={copyIndex}
              className="flex shrink-0 items-center gap-6 sm:gap-8 whitespace-nowrap px-3 sm:px-4"
              aria-hidden={copyIndex > 0}
            >
              <span className="text-canvas/90 font-light">Handcrafted with love, one at a time</span>
              <span className="text-gold/70 text-[10px] select-none">✦</span>
              <span className="text-canvas/90 font-light">Ships Across India</span>
              <span className="text-gold/70 text-[10px] select-none">✦</span>
              <span className="text-champagne font-semibold tracking-wider">Free Delivery above INR 599</span>
              <span className="text-gold/70 text-[10px] select-none">✦</span>
              <span className="text-canvas/90 font-light">The Craft House · Bihar &amp; Mumbai</span>
              <span className="text-gold/70 text-[10px] select-none">✦</span>
              <span className="text-canvas/90 font-light">21 Master Women Artisans</span>
              <span className="text-gold/70 text-[10px] select-none">✦</span>
              <span className="text-canvas/90 font-light">100% Hand-Knotted &amp; Loom-Strung</span>
              <span className="text-gold/70 text-[10px] select-none">✦</span>
              <span className="text-canvas/90 font-light">48-Hour Transit Protection</span>
              <span className="text-gold/70 text-[10px] select-none">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-canvas/90 backdrop-blur-md shadow-sm border-b border-border-subtle py-2 sm:py-3'
            : 'bg-canvas/95 backdrop-blur-sm border-b border-border-subtle/70 py-2.5 sm:py-4 lg:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between">
            {/* Left Desktop Navigation: Core Discovery */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[13px] tracking-refined font-medium text-[#372921]">
              <Link
                href="/shop"
                className={`transition-colors py-1 hover:text-[#9E5430] ${
                  pathname === '/shop' ? 'text-[#372921] font-semibold border-b-2 border-[#9E5430]' : ''
                }`}
              >
                Shop All
              </Link>

              {/* Collections Hover Dropdown */}
              <div
                className="relative py-2"
                onMouseEnter={() => setCollectionsDropdown(true)}
                onMouseLeave={() => setCollectionsDropdown(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 transition-colors hover:text-[#9E5430] cursor-pointer"
                  onClick={() => setCollectionsDropdown(prev => !prev)}
                >
                  <span>Collections</span>
                  <span className="text-[10px] opacity-60">▾</span>
                </button>

                {collectionsDropdown && (
                  <div className="absolute left-0 top-full w-72 bg-[#FFFCF7] border border-[#DED3C5] shadow-xl rounded-sm p-3 py-2 z-50 animate-fade-in">
                    <div className="text-[11px] uppercase tracking-refined text-[#76695F] px-3 py-1 font-sans font-semibold border-b border-[#EAE2D8] mb-1">
                      Curated Editions
                    </div>
                    {COLLECTIONS.map(col => (
                      <Link
                        key={col.slug}
                        href={`/collections/${col.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-sm text-[13px] text-[#372921] hover:bg-[#F0E9DF] hover:text-[#9E5430] transition-colors"
                      >
                        <span>{col.name}</span>
                        <span className="text-[11px] text-[#A99583]">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/customise"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all text-xs cursor-pointer ${
                  pathname === '/customise'
                    ? 'bg-[#874427] border-[#874427] text-white shadow-xs font-semibold'
                    : 'bg-[#9E5430] border-[#9E5430] text-white hover:bg-[#874427] shadow-xs'
                }`}
              >
                <Gem className="w-3.5 h-3.5 text-white" />
                <span>Create Your Own</span>
              </Link>
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
                className="p-2 -ml-2 text-[#372921] hover:text-[#9E5430] focus:outline-none"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Center Brand Identity Logo (Optical True Center on Desktop) */}
            <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 text-center flex justify-center z-10 pointer-events-auto">
              <Link
                href="/"
                className="inline-flex flex-col items-center group focus:outline-none"
                aria-label="Kalajay — A World of Little Wonders"
              >
                <img
                  src="/logo.png"
                  alt="Kalajay — A World of Little Wonders"
                  className={`w-auto object-contain transition-all duration-300 group-hover:scale-[1.03] ${
                    isScrolled ? 'h-9 sm:h-11 md:h-12' : 'h-12 sm:h-15 md:h-16'
                  }`}
                />
              </Link>
            </div>

            {/* Right Desktop Links + Utility Tools */}
            <div className="flex items-center gap-4 sm:gap-5 md:gap-6 text-[13px] tracking-refined font-medium text-[#372921]">
              {/* Brand Story & Atelier links */}
              <div className="hidden lg:flex items-center gap-6 xl:gap-7">
                <Link
                  href="/story"
                  className={`transition-colors py-1 hover:text-[#9E5430] ${
                    pathname === '/story' ? 'text-[#372921] font-semibold border-b-2 border-[#9E5430]' : ''
                  }`}
                >
                  Our Story
                </Link>
                <Link
                  href="/atelier"
                  className={`transition-colors py-1 hover:text-[#9E5430] ${
                    pathname === '/atelier' ? 'text-[#372921] font-semibold border-b-2 border-[#9E5430]' : ''
                  }`}
                >
                  The Craft House
                </Link>
                <Link
                  href="/gifting"
                  className={`transition-colors py-1 hover:text-[#9E5430] ${
                    pathname === '/gifting' ? 'text-[#372921] font-semibold border-b-2 border-[#9E5430]' : ''
                  }`}
                >
                  Gifting
                </Link>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1.5 sm:gap-3.5 md:gap-4 pl-1">
                <button
                  type="button"
                  onClick={onOpenSearch}
                  aria-label="Search Collection"
                  className="p-2 text-[#372921] hover:text-[#9E5430] transition-colors focus:outline-none"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Wishlist Link */}
                <Link
                  href="/wishlist"
                  aria-label="Saved Pieces (Wishlist)"
                  className="p-2 text-[#372921] hover:text-[#9E5430] transition-colors focus:outline-none"
                  title="Saved Pieces (Wishlist)"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>

                {/* Account / User Portal Link */}
                <Link
                  href={user ? '/account' : '/login'}
                  aria-label={user ? `Patron Account: ${user.name}` : 'Sign In'}
                  className="relative flex items-center justify-center p-2 text-[#372921] hover:text-[#9E5430] transition-colors focus:outline-none group"
                  title={user ? `Signed in as ${user.name} (${user.tier})` : 'Sign In / Register'}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  {user && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#9E5430] ring-1 ring-[#F7F3EC]" />
                  )}
                </Link>

                <button
                  type="button"
                  onClick={openCart}
                  aria-label="Shopping Bag"
                  className="relative flex items-center justify-center p-2 text-[#372921] hover:text-[#9E5430] transition-colors focus:outline-none"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#372921] text-[#F7F3EC] text-[11px] font-bold flex items-center justify-center shadow-sm">
                      {totalCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-plum/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-canvas shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-fade-in border-r border-border-subtle">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-block"
                  aria-label="Kalajay"
                >
                  <img
                    src="/logo.png"
                    alt="Kalajay"
                    className="h-10 w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-ink hover:text-rosewood focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account / Login Status in Drawer */}
              <div className="mt-4">
                {user ? (
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-canvas-subtle border border-gold/40 text-ink hover:border-gold transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-ink text-gold flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-ink group-hover:text-gold-dark transition-colors truncate max-w-[130px]">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-ink-muted">View Orders & Portfolio</div>
                      </div>
                    </div>
                    <span className="text-[11px] uppercase tracking-wider font-bold bg-rosewood/15 text-rosewood px-2 py-0.5 rounded">
                      Patron
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-canvas-subtle border border-border-medium text-ink hover:border-gold transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-ink text-gold flex items-center justify-center shadow-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-ink group-hover:text-gold-dark transition-colors">
                          Sign In / Join Circle
                        </div>
                        <div className="text-[11px] text-rosewood">Claim ₹300 Welcome Gift</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>

              {/* Install App Quick Action in Mobile Drawer */}
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('kalajay:trigger-install'));
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-canvas-subtle border border-gold/40 text-ink hover:border-gold hover:bg-canvas transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shadow-xs">
                      <Smartphone className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-ink group-hover:text-gold-dark transition-colors">
                        Install Kalajay App
                      </div>
                      <div className="text-[11px] text-ink-muted">Add to home screen</div>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-gold-dark group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>

              <nav className="mt-5 flex flex-col space-y-4 text-base font-sans font-medium text-ink">
                <Link href="/" className="hover:text-gold-dark py-1">
                  Home
                </Link>
                <Link href="/shop" className="hover:text-gold-dark py-1 flex items-center justify-between">
                  <span>Shop All Pieces</span>
                  <span className="text-xs text-ink bg-canvas-subtle border border-border-subtle px-2.5 py-0.5 rounded-full font-sans">69 Pieces</span>
                </Link>

                <div className="pt-2 pb-1 border-t border-border-subtle">
                  <div className="text-[11px] uppercase tracking-refined text-ink-muted mb-2 font-semibold">
                    Curated Categories
                  </div>
                  <div className="grid grid-cols-1 gap-1 pl-2">
                    {COLLECTIONS.map(col => (
                      <Link
                        key={col.slug}
                        href={`/collections/${col.slug}`}
                        className="py-1 text-sm text-ink-muted hover:text-ink"
                      >
                        {col.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle space-y-3">
                  <Link
                    href="/customise"
                    className="flex items-center gap-2 p-2.5 rounded-sm bg-canvas-subtle border border-gold/30 text-ink font-medium"
                  >
                    <Gem className="w-4 h-4 text-gold" />
                    <span>Create Your Own (Custom Studio)</span>
                  </Link>
                  <Link href="/gifting" className="block hover:text-gold-dark py-1">
                    Gifting & Celebrations
                  </Link>
                  <Link href="/corporate-gifting" className="block hover:text-gold-dark py-1">
                    Wedding & Corporate Favours
                  </Link>
                  <Link href="/story" className="block hover:text-gold-dark py-1">
                    Our Story & Artisans
                  </Link>
                  <Link href="/atelier" className="block hover:text-gold-dark py-1">
                    The Craft House
                  </Link>
                  <Link href="/track" className="block hover:text-gold-dark py-1 text-gold-dark font-medium">
                    Track Your Order
                  </Link>
                  <Link href="/wishlist" className="block hover:text-gold-dark py-1">
                    Saved Pieces (Wishlist)
                  </Link>
                  <Link href="/contact" className="block hover:text-gold-dark py-1">
                    Contact & Craft House Visits
                  </Link>
                </div>
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-border-subtle mt-8 text-xs text-ink-light">
              <p className="font-serif italic text-sm text-ink mb-1">
                “Small wonders. Beautifully made.”
              </p>
              <p>Handcrafted with love in our studios.</p>
              <p className="mt-2 text-ink font-semibold">+91 97405 40847</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

