'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { getFirestoreOrderById } from '@/lib/firestore';
import { auth } from '@/lib/firebase';

interface SimulatedOrder {
  orderId: string;
  placedDate: string;
  estimatedDelivery: string;
  status: 'loom' | 'sealed' | 'transit' | 'delivered';
  items: { name: string; variant: string; price: number; image: string }[];
  itemCount?: number;
  total?: number;
  customerName: string;
  city: string;
  artisanNote: string;
  awbNumber: string;
  courier: string;
  paymentStatus?: string;
  isInternalTracking?: boolean;
  requiresVerification?: boolean;
  isVerifiedOwner?: boolean;
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
    awbNumber: 'KJ-DISP-84729103',
    courier: 'Kalajay In-House Direct Dispatch',
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
    awbNumber: 'KJ-DISP-99381024',
    courier: 'Kalajay Atelier Direct Delivery',
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
    courier: 'Scheduled via Kalajay Atelier Team',
  },
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = (searchParams.get('orderId') || searchParams.get('order') || '').trim();

  const [query, setQuery] = useState(initialOrderId || 'KJ-8924');
  const [activeOrder, setActiveOrder] = useState<SimulatedOrder | null>(
    initialOrderId ? null : KNOWN_ORDERS['KJ-8924']
  );
  const [searched, setSearched] = useState(!initialOrderId);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyExtra, setVerifyExtra] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const executeSearch = async (targetQuery: string, emailVal?: string, extraVal?: string) => {
    const clean = targetQuery.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setError(false);
    setVerifyError('');

    try {
      let liveDoc: any = null;

      // 1. Fetch from server tracking API with Auth token & verification parameters
      try {
        const headers: Record<string, string> = {};
        if (auth?.currentUser) {
          try {
            const token = await auth.currentUser.getIdToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
          } catch {}
        }

        let url = `/api/orders?orderId=${encodeURIComponent(clean)}`;
        const effectiveEmail = emailVal || verifyEmail;
        const effectiveExtra = extraVal || verifyExtra;

        if (effectiveEmail) {
          url += `&email=${encodeURIComponent(effectiveEmail.trim().toLowerCase())}`;
        }
        if (effectiveExtra) {
          const digits = effectiveExtra.replace(/\D/g, '');
          if (digits.length === 6) {
            url += `&pincode=${encodeURIComponent(digits)}`;
          } else if (digits.length >= 10) {
            url += `&phone=${encodeURIComponent(digits)}`;
          } else {
            url += `&key=${encodeURIComponent(effectiveExtra.trim())}`;
          }
        }

        const urlToken = searchParams.get('token') || searchParams.get('key');
        if (urlToken && !url.includes('&key=') && !url.includes('&token=')) {
          url += `&token=${encodeURIComponent(urlToken)}`;
        }

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.order) {
            liveDoc = data.order;
          }
        }
      } catch (apiErr) {
        console.warn('Server tracking API notice:', apiErr);
      }

      // 2. Direct Firestore fallback (for authenticated customer's own order)
      if (!liveDoc) {
        try {
          liveDoc = await getFirestoreOrderById(clean);
        } catch {}
      }

      if (liveDoc) {
        const mappedStatus: SimulatedOrder['status'] =
          liveDoc.fulfillmentStatus === 'delivered'
            ? 'delivered'
            : liveDoc.fulfillmentStatus === 'shipped'
            ? 'transit'
            : liveDoc.fulfillmentStatus === 'quality_checked'
            ? 'sealed'
            : 'loom';

        const rawAwb = liveDoc.trackingAwb || 'KJ-DISP-' + Math.floor(10000000 + Math.random() * 90000000);
        const isInternal = rawAwb.startsWith('KJ-DISP-') || (liveDoc.courier || '').includes('Kalajay In-House');

        setActiveOrder({
          orderId: liveDoc.id,
          placedDate: liveDoc.createdAt ? new Date(liveDoc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
          estimatedDelivery: '3 to 5 Business Days',
          status: mappedStatus,
          paymentStatus: liveDoc.paymentStatus || 'pending',
          isInternalTracking: isInternal,
          requiresVerification: liveDoc.requiresVerification,
          isVerifiedOwner: liveDoc.isVerifiedOwner,
          itemCount: liveDoc.itemCount || (liveDoc.items || []).length || 1,
          items: (liveDoc.items || []).map((it: any) => ({
            name: it.name,
            variant: `${it.sku || it.productId || 'KJ-ATELIER'} · Qty ${it.quantity || 1}`,
            price: it.price || 0,
            image: it.image || 'https://www.kalajay.in/v2/p3-2.jpg',
          })),
          total: liveDoc.total,
          customerName: liveDoc.customerName,
          city: `${liveDoc.shippingAddress?.city || 'India'}, ${liveDoc.shippingAddress?.state || ''}`,
          artisanNote: liveDoc.artisanNote || 'Handcrafted on Bihar artisan loom with heirloom-grade bead tension.',
          awbNumber: rawAwb,
          courier: liveDoc.courier || 'Kalajay In-House Direct Dispatch',
        });
        setError(false);
        setSearched(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Live order query failed, using fallback:', err);
    }

    if (KNOWN_ORDERS[clean]) {
      setActiveOrder(KNOWN_ORDERS[clean]);
      setError(false);
    } else {
      setActiveOrder(null);
      setError(true);
    }
    setLoading(false);
    setSearched(true);
  };

  useEffect(() => {
    if (initialOrderId) {
      setQuery(initialOrderId);
      executeSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeSearch(query);
  };

  const handleVerifyGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmail.trim() || !activeOrder) {
      setVerifyError('Please enter the email address used during order placement.');
      return;
    }
    if (!verifyExtra.trim()) {
      setVerifyError('Please enter your 6-digit delivery pincode or phone number for security verification.');
      return;
    }
    setVerifying(true);
    setVerifyError('');
    await executeSearch(activeOrder.orderId, verifyEmail, verifyExtra);
    setVerifying(false);
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
                <label htmlFor="track-order-input" className="sr-only">Order Reference or Phone Number</label>
                <Search className="w-4 h-4 text-ink-light absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="track-order-input"
                  type="text"
                  aria-label="Order Reference or Phone Number"
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

      {/* Order Not Found State */}
      {error && !activeOrder && (
        <div className="max-w-2xl mx-auto px-4 pt-12 animate-fade-in">
          <div className="p-8 bg-canvas-subtle border border-border-medium rounded-sm text-center space-y-5">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-refined text-rosewood font-bold block mb-1">
                Artisan Dispatch Tracking
              </span>
              <h3 className="font-serif text-2xl text-plum">
                No Record Found for &ldquo;{query}&rdquo;
              </h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed max-w-md mx-auto">
              We could not locate an active artisan order or dispatch manifest matching this reference. Please verify your order number from your email receipt or contact our Patron Concierge team for direct assistance.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/919740540847?text=Hello%20Kalajay!%20I%20am%20trying%20to%20track%20my%20order%20reference%20${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-[#372921] hover:bg-[#503A2E] text-white text-xs uppercase tracking-editorial rounded-sm font-semibold flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5 text-rosewood" />
                <span>Contact Atelier on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => { setQuery(''); setError(false); }}
                className="px-5 py-2.5 bg-canvas border border-border-medium text-xs text-ink uppercase tracking-editorial rounded-sm font-medium"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {activeOrder.paymentStatus && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-sans tracking-refined font-semibold ${
                      activeOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {activeOrder.paymentStatus === 'paid' ? 'Payment Verified' : 'Payment: Pending Verification'}
                    </span>
                  )}
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
                  <h4 className="font-serif text-base text-plum font-normal">Atelier Direct Transit</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-1 font-light">
                    {activeOrder.isInternalTracking || (activeOrder.awbNumber || '').startsWith('KJ-DISP-') ? (
                      <>
                        Dispatched via <strong className="text-plum">{activeOrder.courier}</strong> · Internal Dispatch Ref:{' '}
                        <strong className="text-plum font-mono">{activeOrder.awbNumber}</strong>
                        <span className="block text-[10px] text-ink-light italic mt-0.5">
                          (Pre-allocated internal tracking reference. Commercial courier tracking details will be updated upon physical courier handover.)
                        </span>
                      </>
                    ) : (
                      <>
                        Commercial Courier: <strong className="text-plum">{activeOrder.courier}</strong> · AWB Tracking:{' '}
                        <strong className="text-plum font-mono">{activeOrder.awbNumber}</strong>
                      </>
                    )}
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
                Pieces in this Parcel ({activeOrder.items.length > 0 ? activeOrder.items.length : (activeOrder.itemCount || 1)})
              </span>

              {activeOrder.requiresVerification && activeOrder.items.length === 0 ? (
                <div className="p-5 bg-canvas-subtle border border-gold/40 rounded-sm space-y-3">
                  <div className="flex items-center gap-2 text-rosewood">
                    <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                    <span className="text-xs font-semibold text-plum tracking-refined uppercase font-sans">Patron Privacy Protection</span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed font-light">
                    To maintain strict client confidentiality, itemized parcel contents and financial invoices ({activeOrder.itemCount || 1} handcrafted creation{(activeOrder.itemCount || 1) === 1 ? '' : 's'}) are shielded. Authenticate as the account patron or enter your order email along with your delivery pincode or phone to unlock the complete invoice.
                  </p>
                  <form onSubmit={handleVerifyGuest} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <input
                      type="email"
                      placeholder="Order Email Address"
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      className="w-full sm:w-60 px-3.5 py-2.5 bg-canvas border border-border-strong rounded-sm text-xs text-plum placeholder:text-ink-light focus:outline-none focus:border-gold shadow-2xs"
                    />
                    <input
                      type="text"
                      placeholder="Delivery Pincode or Phone"
                      value={verifyExtra}
                      onChange={(e) => setVerifyExtra(e.target.value)}
                      className="w-full sm:w-48 px-3.5 py-2.5 bg-canvas border border-border-strong rounded-sm text-xs font-mono text-plum placeholder:text-ink-light focus:outline-none focus:border-gold shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={verifying}
                      className="w-full sm:w-auto px-6 py-2.5 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors shrink-0 disabled:opacity-50"
                    >
                      {verifying ? 'Verifying...' : 'Unlock Parcel Details'}
                    </button>
                  </form>
                  {verifyError && (
                    <p className="text-[11px] text-red-600 font-sans mt-1">{verifyError}</p>
                  )}
                </div>
              ) : (
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
              )}
            </div>

            {/* Direct WhatsApp Concierge Help */}
            <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-ink-muted font-light">
                Need to amend delivery address or check live dispatch coordinates?
              </span>
              <a
                href={`https://wa.me/919740540847?text=Hello%20Kalajay%2C%20I%20am%20inquiring%20about%20Order%20${activeOrder.orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] rounded-sm text-[11px] font-sans font-semibold uppercase tracking-refined transition-colors shrink-0 shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-gold" />
                <span>WhatsApp Craft House Concierge</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-canvas min-h-screen py-24 flex items-center justify-center">
          <div className="text-center space-y-3 font-serif text-ink">
            <Compass className="w-8 h-8 text-gold mx-auto animate-spin" />
            <p className="text-sm">Connecting to Loom Provenance Chronicle...</p>
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

