'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, ArrowRight, Check, ShieldCheck, MapPin, Building, HeartHandshake, Sparkles, Send } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createFirestoreCorporateEnquiry } from '@/lib/firestore';

export default function CorporateGiftingPage() {
  const { formatINR } = useCart();
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState<'Wedding Favour' | 'Corporate Milestone' | 'Festive Gifting' | 'VIP Hamper'>('Wedding Favour');
  const [quantity, setQuantity] = useState(50);
  const [budgetPerPiece, setBudgetPerPiece] = useState(1500);
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!companyName.trim() || !contactPerson.trim()) {
      setSubmitError('Please provide your organization / wedding family name and contact person.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSubmitError('Please provide a valid institutional or personal email address.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setSubmitError('Please provide a 10-digit mobile number for WhatsApp coordination.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createFirestoreCorporateEnquiry({
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        eventType,
        quantity: Number(quantity) || 50,
        budgetPerPiece: Number(budgetPerPiece) || 1500,
        targetDate: targetDate || 'Within 4-6 weeks',
        status: 'new',
      });

      setSubmitSuccess(
        'Thank you! Your institutional proposal request has been recorded in our Craft House Gifting ledger. Our Curation Director will dispatch a tailored quote and catalog within 24 business hours.'
      );
      setCompanyName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setNotes('');
    } catch (err: any) {
      setSubmitError(err.message || 'Could not record proposal request. Please connect directly via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-3">
            Institutional & Ceremonial Keepsakes
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-plum font-normal tracking-tight leading-[1.05]">
            Wedding & Corporate Favours
          </h1>
          <p className="mt-6 text-sm sm:text-base text-ink-muted font-light leading-relaxed max-w-2xl mx-auto">
            Give keepsakes that carry genuine human artistry. Customized beadwork, bespoke color palettes, and luxury packaging for milestone weddings and executive client appreciation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">
        {/* Two Offerings Columns */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Bridal & Wedding */}
          <div className="bg-canvas p-8 sm:p-10 rounded-sm border border-border-medium shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-rosewood">
              <HeartHandshake className="w-6 h-6" />
              <span className="text-xs uppercase tracking-monumental font-bold">Matrimonial Celebrations</span>
            </div>
            <h3 className="font-serif text-3xl text-plum">
              Bridal & Mehendi Favours
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
              Elevate your wedding festivities with bespoke keepsakes tailored to your wedding decor palette. From pearl coin bags and crocheted bag charms to floral coasters, our pieces serve as radiant tokens of gratitude for your loved ones.
            </p>
            <ul className="space-y-2 text-xs text-ink">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Exact palette matching to bridal lehenga and invitations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Custom couple monogram tags with hot-foil embossing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Individually boxed with satin ribbons and thank-you notes</span>
              </li>
            </ul>
          </div>

          {/* Corporate Gifting */}
          <div className="bg-canvas p-8 sm:p-10 rounded-sm border border-border-medium shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-rosewood">
              <Building className="w-6 h-6" />
              <span className="text-xs uppercase tracking-monumental font-bold">Executive & Client Care</span>
            </div>
            <h3 className="font-serif text-3xl text-plum">
              Artisanal Corporate Hampers
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
              Move away from mass-produced plastic giveaways. Offer partners, leadership teams, and key accounts handcrafted vanity trays, crystal pen holders, and coaster sets that reflect intentional taste and meaningful human craft.
            </p>
            <ul className="space-y-2 text-xs text-ink">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Formal GST invoicing & bulk corporate payment terms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Pan-India multi-location doorstep direct dispatch</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rosewood" />
                <span>Dedicated craft house manager and pre-production sample approval</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Volume Tiers Table */}
        <section className="bg-canvas-subtle p-8 sm:p-12 rounded-sm border border-border-medium space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block mb-1">
              Tiered Volume Structures
            </span>
            <h3 className="font-serif text-3xl text-plum">
              Order Quantities & Craft House Timeline
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-canvas rounded-sm border border-border-subtle shadow-xs space-y-3">
              <span className="text-xs font-mono text-rosewood font-bold block">TIER I</span>
              <h4 className="font-serif text-2xl text-plum">25 to 50 Units</h4>
              <p className="text-xs text-ink-light">Boutique weddings, VIP client hampers, bridal party gifts.</p>
              <div className="text-xs text-ink space-y-1 pt-2 border-t border-border-subtle">
                <p>• Lead Time: 2 weeks</p>
                <p>• 10% Volume Craft House advantage</p>
                <p>• Free wax-seal gift packaging</p>
              </div>
            </div>

            <div className="p-6 bg-canvas rounded-sm border border-rosewood shadow-md space-y-3 ring-1 ring-rosewood">
              <span className="text-xs font-mono text-rosewood font-bold block">TIER II · MOST POPULAR</span>
              <h4 className="font-serif text-2xl text-plum">50 to 200 Units</h4>
              <p className="text-xs text-ink-light">Grand wedding celebrations, annual corporate milestones.</p>
              <div className="text-xs text-ink space-y-1 pt-2 border-t border-border-subtle">
                <p>• Lead Time: 3 to 4 weeks</p>
                <p>• 15% Volume Craft House advantage</p>
                <p>• Complimentary physical sample</p>
              </div>
            </div>

            <div className="p-6 bg-canvas rounded-sm border border-border-subtle shadow-xs space-y-3">
              <span className="text-xs font-mono text-rosewood font-bold block">TIER III</span>
              <h4 className="font-serif text-2xl text-plum">200+ Units</h4>
              <p className="text-xs text-ink-light">Large destination weddings, enterprise festive distributions.</p>
              <div className="text-xs text-ink space-y-1 pt-2 border-t border-border-subtle">
                <p>• Lead Time: 4 to 6 weeks</p>
                <p>• Custom bespoke pricing schedule</p>
                <p>• Multi-city direct atelier dispatch</p>
              </div>
            </div>
          </div>
        </section>

        {/* Formal Institutional Proposal Request Form */}
        <section className="bg-canvas-subtle p-8 sm:p-12 rounded-sm border border-border-gold space-y-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-rosewood" />
              <span>Tailored Curation Manifest</span>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl text-plum font-normal">
              Request an Institutional Proposal
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-light mt-2">
              Share your celebration details below. Our corporate gifting concierges will formulate a comprehensive volume pricing schedule, wax-seal options, and sample delivery timeline.
            </p>
          </div>

          {submitSuccess && (
            <div className="max-w-2xl mx-auto p-4 bg-emerald-50 border border-emerald-300 rounded-sm text-emerald-900 text-xs flex items-start gap-3">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5">Proposal Request Recorded</strong>
                <p className="leading-relaxed">{submitSuccess}</p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-300 rounded-sm text-rose-900 text-xs flex items-start gap-3">
              <span className="w-4 h-4 text-rose-700 shrink-0 font-bold">!</span>
              <div>
                <strong className="block font-semibold mb-0.5">Notice</strong>
                <p className="leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitEnquiry} className="max-w-3xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-plum mb-1.5">
                  Company / Family Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Reliance Foundation / Singhania Wedding"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-plum mb-1.5">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. Radhika Singhania"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-plum mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. radhika@singhania.in"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-plum mb-1.5">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-plum mb-1.5">
                  Celebration / Occasion Type
                </label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-sm bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                >
                  <option value="Wedding Favour">Wedding &amp; Mehendi Favours</option>
                  <option value="Corporate Milestone">Executive Milestone</option>
                  <option value="Festive Gifting">Diwali / Festive Hamper</option>
                  <option value="VIP Hamper">VIP Client Keepsake</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-plum mb-1.5">
                  Estimated Quantity
                </label>
                <input
                  type="number"
                  min="25"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-plum mb-1.5">
                  Target Delivery Date
                </label>
                <input
                  type="text"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  placeholder="e.g. 15 Dec 2026"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                />
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs uppercase tracking-refined font-semibold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting to Atelier...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Proposal Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Direct WhatsApp Callout */}
        <section className="bg-plum text-canvas p-8 sm:p-12 rounded-sm text-center space-y-6">
          <h3 className="font-serif text-3xl sm:text-4xl text-canvas">
            Speak Directly with Our Curation Director
          </h3>
          <p className="text-xs sm:text-sm text-canvas/75 font-light max-w-lg mx-auto leading-relaxed">
            Every celebration has its own character. Let us send you custom swatches, sample photos, and personalized price schedules over WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="https://wa.me/919740540847?text=Hi%20Kalajay!%20I%20am%20enquiring%20about%20a%20wedding/corporate%20bulk%20gifting%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-champagne hover:bg-champagne-light text-plum text-xs uppercase tracking-editorial font-semibold rounded-sm transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-rosewood" />
              <span>Connect on WhatsApp (+91 97405 40847)</span>
            </a>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-canvas/10 hover:bg-canvas/20 text-canvas border border-canvas/20 text-xs uppercase tracking-editorial font-medium rounded-sm transition-colors"
            >
              <span>Email the Craft House</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

