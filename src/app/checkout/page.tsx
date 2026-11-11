'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Check,
  CreditCard,
  Truck,
  MessageCircle,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function CheckoutPage() {
  const { cart, subtotal, deliveryFee, total, formatINR, clearCart } = useCart();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'whatsapp'>('upi');
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOrder = `KJ-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrder);
    setStep('success');
    clearCart();
  };

  if (step === 'success') {
    return (
      <div className="bg-canvas min-h-screen py-20 px-4">
        <div className="max-w-2xl mx-auto bg-canvas-subtle p-8 sm:p-12 rounded-sm border border-border-medium shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-blush text-rosewood flex items-center justify-center">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-refined text-rosewood font-bold block mb-1">
              Order Confirmed · Prototype Demo
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-plum">
              Thank You for Supporting Handcrafted Art
            </h1>
            <p className="text-xs text-ink-light font-mono mt-2">
              Order Reference: <strong className="text-plum">{orderNumber}</strong>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-lg mx-auto">
            Your piece is now scheduled on our Craft House artisan loom. A confirmation letter with tracking details has been simulated for{' '}
            <strong className="text-plum">{email || 'your email'}</strong> and SMS updates to{' '}
            <strong className="text-plum">{phone || '+91 97405 40847'}</strong>.
          </p>

          <div className="p-5 bg-canvas rounded-sm border border-border-subtle text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-border-subtle/80 pb-2 font-medium text-plum">
              <span>Delivery Destination</span>
              <span>Kalajay Craft House Dispatch</span>
            </div>
            <p className="text-ink-muted">
              {name || 'Honoured Guest'} <br />
              {address ? `${address}, ${city}, ${stateName} - ${pincode}` : '14 Altamount Road, Mumbai, Maharashtra - 400026'}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] text-xs uppercase tracking-editorial font-semibold rounded-full transition-colors"
            >
              <span>Explore More Creations</span>
            </Link>
            <a
              href={`https://wa.me/919740540847?text=Hi%20Kalajay!%20I%20just%20placed%20order%20${orderNumber}%20on%20your%20digital%20flagship.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-canvas border border-border-strong text-plum hover:text-emerald-800 text-xs uppercase tracking-editorial font-medium rounded-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>Track on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Checkout Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs text-ink-light hover:text-rosewood">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Bag</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-ink-light">
            <Lock className="w-3.5 h-3.5 text-rosewood" />
            <span>Secure 256-Bit SSL Prototype Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Form Area (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Contact Details */}
            <div className="bg-canvas p-6 sm:p-8 rounded-sm border border-border-medium shadow-xs space-y-4">
              <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block">
                01 · Customer Contact
              </span>
              <h2 className="font-serif text-2xl text-plum">Where Should We Send Order Updates?</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-ink-light font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-ink-light font-medium mb-1">Mobile Number (For WhatsApp Tracking)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-canvas p-6 sm:p-8 rounded-sm border border-border-medium shadow-xs space-y-4">
              <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block">
                02 · Pan-India Delivery Destination
              </span>
              <h2 className="font-serif text-2xl text-plum">Shipping Address</h2>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-ink-light font-medium mb-1">Full Name of Recipient</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Kapoor"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-ink-light font-medium mb-1">Street Address, Apartment, Suite</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apartment 14B, Sea Green Mansions, Worli Sea Face"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-ink-light font-medium mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-light font-medium mb-1">State</label>
                    <select
                      value={stateName}
                      onChange={e => setStateName(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] cursor-pointer transition-colors"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Other">Other State / UT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-ink-light font-medium mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      placeholder="400018"
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Prototype */}
            <div className="bg-canvas p-6 sm:p-8 rounded-sm border border-border-medium shadow-xs space-y-4">
              <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block">
                03 · Payment Method Simulation
              </span>
              <h2 className="font-serif text-2xl text-plum">Select Payment Mode</h2>

              <div className="space-y-3 text-xs font-sans">
                <label
                  className={`p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-rosewood bg-blush/20 ring-1 ring-rosewood' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-rosewood"
                    />
                    <div>
                      <span className="font-semibold text-plum block">Instant UPI (GPay, PhonePe, Paytm, BHIM)</span>
                      <span className="text-ink-light">Zero transaction fees. Instant QR code generation.</span>
                    </div>
                  </div>
                  <Zap className="w-4 h-4 text-rosewood" />
                </label>

                <label
                  className={`p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-rosewood bg-blush/20 ring-1 ring-rosewood' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-rosewood"
                    />
                    <div>
                      <span className="font-semibold text-plum block">Credit / Debit Card & Net Banking</span>
                      <span className="text-ink-light">Visa, MasterCard, RuPay, Amex accepted across India.</span>
                    </div>
                  </div>
                  <CreditCard className="w-4 h-4 text-ink-light" />
                </label>

                <label
                  className={`p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'whatsapp' ? 'border-rosewood bg-blush/20 ring-1 ring-rosewood' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="accent-rosewood"
                    />
                    <div>
                      <span className="font-semibold text-plum block">WhatsApp Direct Confirmation</span>
                      <span className="text-ink-light">Review order with an artisan liaison before paying.</span>
                    </div>
                  </div>
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] text-xs uppercase tracking-monumental font-semibold rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Place Order & Confirm Handcraft · {formatINR(total)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Preview (Span 5) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-canvas-subtle p-6 sm:p-8 rounded-sm border border-border-medium shadow-xl space-y-6">
              <h3 className="font-serif text-2xl text-plum border-b border-border-subtle pb-4">
                Items in This Shipment ({cart.length})
              </h3>

              <div className="max-h-72 overflow-y-auto divide-y divide-border-subtle/70 space-y-3">
                {cart.map(item => (
                  <div key={item.key} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-canvas rounded-sm overflow-hidden shrink-0 border border-border-subtle">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm text-plum truncate max-w-[160px]">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-ink-light block">
                          Qty: {item.quantity} {item.variantLabel ? `· ${item.variantLabel}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif font-semibold text-plum shrink-0">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs text-ink border-t border-border-subtle pt-4">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-medium text-plum">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Pan-India Delivery</span>
                  <span className="font-medium text-plum">
                    {deliveryFee === 0 ? <span className="text-rosewood font-semibold">FREE</span> : formatINR(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-plum border-t border-border-subtle pt-3">
                  <span>Grand Total</span>
                  <span className="font-serif text-2xl text-rosewood">{formatINR(total)}</span>
                </div>
              </div>

              <div className="p-4 bg-canvas rounded-sm border border-border-subtle text-[11px] text-ink-light space-y-1">
                <span className="font-medium text-plum block">Authentic Handmade Notice</span>
                <p>
                  As each piece is made to order, please allow 3-5 business days for hand-weaving before dispatch.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

