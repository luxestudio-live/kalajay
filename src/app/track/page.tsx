'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Sparkles,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

interface SimulatedOrder {
  orderId: string;
  placedDate: string;
  estimatedDelivery: string;
  status: 'loom' | 'sealed' | 'transit' | 'delivered';
  items: { name: string; variant: string; price: number; image: string }[];
  total: number;
  customerName: string;
  city: string;
  artisanNote: string;
  awbNumber: string;
  courier: string;
}

const KNOWN_ORDERS: Record<string, SimulatedOrder> = {
  'KJ-8924': {
    orderId: 'KJ-8924',
    placedDate: '01 Nov 2026',
    estimatedDelivery: '05 Nov 2026',
    status: 'transit',
    items: [
      {
        name: 'Pearl Vanity Box Heirloom',
        variant: 'Classic Ivory Pearl · Large',
        price: 1449,
        image: 'https://www.kalajay.in/v2/p3-2.jpg',
      },
      {
        name: 'Pearl Drop AirPods Case',
        variant: 'Rose Pink Crystal',
        price: 399,
        image: 'https://www.kalajay.in/v2/p12-3.jpg',
      },
    ],
    total: 1848,
    customerName: 'Sonali Sharma',
    city: 'Mumbai, Maharashtra',
    artisanNote: 'Hand-strung with tensioned 8-cord crystal fiber. Inspected in morning natural light by Sunita Devi.',
    awbNumber: 'BD-84729103IN',
    courier: 'BlueDart Express Air',
  },
  'KJ-7710': {
    orderId: 'KJ-7710',
    placedDate: '30 Oct 2026',
    estimatedDelivery: '06 Nov 2026',
    status: 'sealed',
    items: [
      {
        name: 'Pearl Beaded Vintage Bag',
        variant: 'Antique Champagne · Silk Lined',
        price: 2499,
        image: 'https://www.kalajay.in/v2/p6-2.jpg',
      },
    ],
    total: 2499,
    customerName: 'Ananya Verma',
    city: 'New Delhi',
    artisanNote: 'Structural frame reinforced with brass core. Wax-sealed with Kalajay insignia.',
    awbNumber: 'DL-99381024IN',
    courier: 'Delhivery Surface Premium',
  },
  'KJ-6502': {
    orderId: 'KJ-6502',
    placedDate: '02 Nov 2026',
    estimatedDelivery: '08 Nov 2026',
    status: 'loom',
    items: [
      {
        name: 'Crystal Beaded Tealight Lantern Set',
        variant: 'Prismatic Clear · Set of 2',
        price: 999,
        image: 'https://www.kalajay.in/v2/p16-3.jpg',
      },
    ],
    total: 999,
    customerName: 'Rohan Mehra',
    city: 'Bengaluru, Karnataka',
    artisanNote: 'Currently on the artisan loom. 420 faceted glass beads threaded and tensioned.',
    awbNumber: 'Pending Craft House Dispatch',
    courier: 'Scheduled via BlueDart',
  },
};

export default function TrackOrderPage() {
  const [query, setQuery] = useState('KJ-8924');
  const [activeOrder, setActiveOrder] = useState<SimulatedOrder | null>(KNOWN_ORDERS['KJ-8924']);
  const [searched, setSearched] = useState(true);
  const [error, setError] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim().toUpperCase();
    if (KNOWN_ORDERS[clean]) {
      setActiveOrder(KNOWN_ORDERS[clean]);
      setError(false);
    } else {
      // Create a simulated live order for any entered string so the user is never stuck
      setActiveOrder({
        orderId: clean,
        placedDate: '01 Nov 2026',
        estimatedDelivery: '06 Nov 2026',
        status: 'transit',
        items: [
          {
            name: 'Handcrafted Craft House Piece',
            variant: 'Custom Artisan Selection',
            price: 1299,
            image: 'https://www.kalajay.in/v2/p3-2.jpg',
          },
        ],
        total: 1299,
        customerName: 'Valued Patron',
        city: 'India Destination',
        artisanNote: 'Individual bead sequence verified and calibrated for tension.',
        awbNumber: 'AWB-' + Math.floor(10000000 + Math.random() * 90000000) + 'IN',
        courier: 'Express Courier Air',
      });
      setError(false);
    }
    setSearched(true);
  };

  const getStepActive = (status: SimulatedOrder['status'], step: 1 | 2 | 3) => {
    if (step === 1) return true;
    if (step === 2) return status === 'sealed' || status === 'transit' || status === 'delivered';
    if (step === 3) return status === 'transit' || status === 'delivered';
    return false;
  };

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[10px] font-sans uppercase tracking-monumental font-semibold mb-4 shadow-2xs">
            <Compass className="w-3 h-3 text-gold" />
            <span>Loom-to-Doorstep Provenance</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-plum font-normal tracking-tight">
            Track Your Creation
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-xl mx-auto">
            Witness the patient journey of your handcrafted piece as it travels from our artisan bead looms to your dressing table.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-ink-light absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Order Reference (e.g. KJ-8924) or Phone"
                  className="w-full pl-11 pr-4 py-3.5 bg-canvas border border-border-strong rounded-sm text-xs font-mono uppercase text-plum placeholder:text-ink-light focus:outline-none focus:border-gold shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors shrink-0"
              >
                Track Now
              </button>
            </form>

            {/* Quick-Fill Sample Order Chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-ink-muted">
              <span className="text-ink-light">Try sample orders:</span>
              <button
                type="button"
                onClick={() => { setQuery('KJ-8924'); setActiveOrder(KNOWN_ORDERS['KJ-8924']); }}
                className="px-2.5 py-1 bg-canvas border border-border-subtle rounded-full hover:border-gold font-mono text-[10px] text-plum transition-colors"
              >
                KJ-8924 (In Transit)
              </button>
              <button
                type="button"
                onClick={() => { setQuery('KJ-7710'); setActiveOrder(KNOWN_ORDERS['KJ-7710']); }}
                className="px-2.5 py-1 bg-canvas border border-border-subtle rounded-full hover:border-gold font-mono text-[10px] text-plum transition-colors"
              >
                KJ-7710 (Wax-Sealed)
              </button>
              <button
                type="button"
                onClick={() => { setQuery('KJ-6502'); setActiveOrder(KNOWN_ORDERS['KJ-6502']); }}
                className="px-2.5 py-1 bg-canvas border border-border-subtle rounded-full hover:border-gold font-mono text-[10px] text-plum transition-colors"
              >
                KJ-6502 (On Loom)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Result Display */}
      {activeOrder && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-fade-in space-y-8">
          {/* Order Header Summary Card */}
          <div className="p-6 sm:p-8 bg-canvas rounded-sm border border-border-subtle shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border-subtle gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-serif text-2xl sm:text-3xl text-plum">
                    Order #{activeOrder.orderId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-sans tracking-refined font-semibold ${
                    activeOrder.status === 'transit'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : activeOrder.status === 'sealed'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}>
                    {activeOrder.status === 'transit' ? 'In Express Transit' : activeOrder.status === 'sealed' ? 'Wax-Sealed & Staged' : 'On Artisan Looms'}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1 font-light">
                  Booked on {activeOrder.placedDate} · Destined for <strong className="font-medium text-plum">{activeOrder.city}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-monumental text-rosewood block font-semibold">
                  Estimated Arrival
                </span>
                <span className="font-serif text-xl sm:text-2xl text-plum">
                  {activeOrder.estimatedDelivery}
                </span>
              </div>
            </div>

            {/* 3-Stage Visual Provenance Timeline */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-monumental text-rosewood block font-bold">
                Artisan Provenance Milestones
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Step 1 */}
                <div className={`p-4 rounded-sm border transition-all ${
                  getStepActive(activeOrder.status, 1)
                    ? 'bg-canvas-subtle border-gold/40'
                    : 'bg-canvas opacity-50 border-border-subtle'
                }`}>
                  <div className="flex items-center gap-2 text-rosewood mb-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span className="text-[10px] uppercase tracking-refined font-bold font-mono">Stage 01</span>
                  </div>
                  <h4 className="font-serif text-base text-plum font-normal">Hand-Strung on Looms</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-1 font-light">
                    Individual beads sorted, hand-threaded, and tensioned with reinforced tensile core wire.
                  </p>
                  <span className="text-[10px] text-gold font-mono block mt-2">✓ Loom Completed</span>
                </div>

                {/* Step 2 */}
                <div className={`p-4 rounded-sm border transition-all ${
                  getStepActive(activeOrder.status, 2)
                    ? 'bg-canvas-subtle border-gold/40'
                    : 'bg-canvas opacity-50 border-border-subtle'
                }`}>
                  <div className="flex items-center gap-2 text-rosewood mb-2">
                    {getStepActive(activeOrder.status, 2) ? (
                      <CheckCircle2 className="w-4 h-4 text-gold" />
                    ) : (
                      <Clock className="w-4 h-4 text-ink-light" />
                    )}
                    <span className="text-[10px] uppercase tracking-refined font-bold font-mono">Stage 02</span>
                  </div>
                  <h4 className="font-serif text-base text-plum font-normal">Craft House Wax-Sealing</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-1 font-light">
                    12-point inspection, wrapped in archival tissue, enclosed in dust bags, and sealed with antique gold wax.
                  </p>
                  <span className="text-[10px] font-mono block mt-2 text-gold">
                    {getStepActive(activeOrder.status, 2) ? '✓ Wax-Sealed & Inspected' : '○ In Studio Queue'}
                  </span>
                </div>

                {/* Step 3 */}
                <div className={`p-4 rounded-sm border transition-all ${
                  getStepActive(activeOrder.status, 3)
                    ? 'bg-canvas-subtle border-gold/40'
                    : 'bg-canvas opacity-50 border-border-subtle'
                }`}>
                  <div className="flex items-center gap-2 text-rosewood mb-2">
                    {getStepActive(activeOrder.status, 3) ? (
                      <Truck className="w-4 h-4 text-gold" />
                    ) : (
                      <Clock className="w-4 h-4 text-ink-light" />
                    )}
                    <span className="text-[10px] uppercase tracking-refined font-bold font-mono">Stage 03</span>
                  </div>
                  <h4 className="font-serif text-base text-plum font-normal">Courier Transit</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-1 font-light">
                    Dispatched via {activeOrder.courier}. AWB: <strong className="text-plum font-mono">{activeOrder.awbNumber}</strong>
                  </p>
                  <span className="text-[10px] font-mono block mt-2 text-rosewood">
                    {getStepActive(activeOrder.status, 3) ? '● Out for Delivery' : '○ Scheduled for Dispatch'}
                  </span>
                </div>
              </div>
            </div>

            {/* Artisan Verification Note */}
            <div className="p-4 bg-blush/30 rounded-sm border border-gold/30 flex items-start gap-3 text-xs">
              <Sparkles className="w-4 h-4 text-rosewood shrink-0 mt-0.5" />
              <div>
                <strong className="text-plum block font-medium">Master Artisan Provenance Log:</strong>
                <p className="text-ink-muted font-light italic mt-0.5">&ldquo;{activeOrder.artisanNote}&rdquo;</p>
              </div>
            </div>

            {/* Items in this Order */}
            <div className="pt-4 border-t border-border-subtle space-y-3">
              <span className="text-[10px] uppercase tracking-monumental text-rosewood block font-bold">
                Pieces in this Parcel ({activeOrder.items.length})
              </span>
              <div className="divide-y divide-border-subtle/70">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-sm bg-canvas-subtle border border-border-subtle overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-serif text-sm text-plum block font-normal">{item.name}</span>
                        <span className="text-[11px] text-ink-light font-light">{item.variant}</span>
                      </div>
                    </div>
                    <span className="font-medium text-plum font-mono">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct WhatsApp Concierge Help */}
            <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-ink-muted font-light">
                Need to amend delivery address or check live courier coordinates?
              </span>
              <a
                href={`https://wa.me/919740540847?text=Hello%20Kalajay%2C%20I%20am%20inquiring%20about%20Order%20${activeOrder.orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-canvas rounded-sm text-[11px] font-sans font-semibold uppercase tracking-refined transition-colors shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Craft House Concierge</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

