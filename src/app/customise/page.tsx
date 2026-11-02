'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gem,
  ArrowRight,
  Check,
  MessageCircle,
  ShoppingBag,
  Sliders,
  Palette,
  FileText,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { CUSTOMISER_CONFIG } from '@/data/extras';
import { useCart } from '@/context/CartContext';

export default function CustomisePage() {
  const { formatINR, addToCart } = useCart();

  // Multi-step form state
  const [step, setStep] = useState(1);
  const [selectedSilhouette, setSelectedSilhouette] = useState('beaded-sling');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [selectedAccentIndex, setSelectedAccentIndex] = useState(0);
  const [selectedCharms, setSelectedCharms] = useState<string[]>([]);
  const [monogramText, setMonogramText] = useState('');
  const [occasion, setOccasion] = useState('Personal Milestone');
  const [customNotes, setCustomNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const activeConfig = CUSTOMISER_CONFIG[selectedSilhouette] || CUSTOMISER_CONFIG['beaded-sling'];
  const activePalette = activeConfig.paletteOptions[selectedPaletteIndex] || activeConfig.paletteOptions[0];
  const activeAccent = activeConfig.accentOptions[selectedAccentIndex] || activeConfig.accentOptions[0];

  const toggleCharm = (charm: string) => {
    setSelectedCharms(prev =>
      prev.includes(charm) ? prev.filter(c => c !== charm) : [...prev, charm]
    );
  };

  const calculatedBasePrice = activeConfig.basePrice;
  const charmPrice = selectedCharms.length * 99;
  const unitPrice = calculatedBasePrice + charmPrice;
  const estimatedTotal = unitPrice * quantity;

  const handleAddToCart = () => {
    // Add custom piece as a typed synthetic product to cart
    const customProduct = {
      id: `CUSTOM-${Date.now()}`,
      code: `CUSTOM-${selectedSilhouette.toUpperCase()}`,
      slug: 'custom-creation',
      name: `Custom ${activeConfig.productType}`,
      category: 'Bespoke Studio',
      categorySlug: 'custom',
      price: unitPrice,
      originalPrice: Math.round(unitPrice * 1.2),
      images: [
        'https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp'
      ],
      coverImage:
        'https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp',
      inStock: true,
      isBestSeller: false,
      isFeatured: false,
      isNewArrival: false,
      variants: [],
      materials: ['Hand-Selected Glass Beads', activeAccent.name],
      dimensions: 'Bespoke Custom Scaling',
      craftHours: `${activeConfig.turnaroundDays} Days Handcraft`,
      care: 'Wipe with soft microfibre cloth.',
      description: `Bespoke custom order: ${activePalette.name} palette with ${activeAccent.name}. Monogram: ${monogramText || 'None'}. Occasion: ${occasion}. Notes: ${customNotes || 'None'}.`
    };

    addToCart(customProduct, undefined, quantity);
    setSubmitted(true);
  };

  const waCustomText = `Hi Kalajay! I designed a custom piece in your Bespoke Studio:\n\n• Product: ${activeConfig.productType}\n• Palette: ${activePalette.name}\n• Finish: ${activeAccent.name}\n• Accents: ${selectedCharms.join(', ') || 'None'}\n• Monogram: ${monogramText || 'None'}\n• Occasion: ${occasion}\n• Quantity: ${quantity}\n• Estimated Total: ${formatINR(estimatedTotal)}\n• Notes: ${customNotes || 'None'}\n\nCould you please review and confirm the artisan loom schedule?`;

  const waUrl = `https://wa.me/919740540847?text=${encodeURIComponent(waCustomText)}`;

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[11px] font-sans uppercase tracking-refined font-semibold mb-3">
              <Gem className="w-3 h-3 text-gold" />
              <span>Bespoke Atelier Studio</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight">
              Create Your Own Heirloom
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
              Design a one-of-a-kind handcrafted piece for your wardrobe, wedding ensemble, or personal space. Select the silhouette, specify bead colorways, add personalized monograms, and let our 21 master artisans weave it by hand.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-12 text-xs font-sans">
          {[
            { num: 1, label: 'Silhouette' },
            { num: 2, label: 'Colorway & Finish' },
            { num: 3, label: 'Personalization' },
            { num: 4, label: 'Review & Order' }
          ].map(s => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className="flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === s.num
                    ? 'bg-plum text-canvas shadow-sm'
                    : step > s.num
                    ? 'bg-rosewood text-canvas'
                    : 'bg-canvas-subtle border border-border-medium text-ink-light'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span className={`hidden sm:inline ${step === s.num ? 'text-plum font-semibold' : 'text-ink-light'}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Customiser Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Form Area (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Silhouette */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-serif text-2xl text-plum mb-1">
                    01 · Select Product Silhouette
                  </h3>
                  <p className="text-xs text-ink-muted font-light">
                    Choose the handcrafted base object you would like customized.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(CUSTOMISER_CONFIG).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedSilhouette(key);
                        setSelectedPaletteIndex(0);
                        setSelectedAccentIndex(0);
                        setSelectedCharms([]);
                      }}
                      className={`p-5 rounded-sm text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedSilhouette === key
                          ? 'bg-plum text-canvas border-plum shadow-md ring-2 ring-plum/20'
                          : 'bg-canvas text-ink border-border-medium hover:border-border-strong'
                      }`}
                    >
                      <div>
                        <span className={`text-[11px] uppercase tracking-refined block mb-1 font-bold ${selectedSilhouette === key ? 'text-champagne' : 'text-rosewood'}`}>
                          Atelier Standard
                        </span>
                        <h4 className="font-serif text-lg font-normal leading-snug">
                          {val.productType}
                        </h4>
                        <p className={`text-[11px] font-light mt-2 line-clamp-3 leading-relaxed ${selectedSilhouette === key ? 'text-canvas/80' : 'text-ink-muted'}`}>
                          {val.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-current/20 flex items-center justify-between text-xs font-semibold">
                        <span>Base Price:</span>
                        <span className="font-serif text-sm">{formatINR(val.basePrice)}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-medium rounded-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Proceed to Colors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Colorways & Finish */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="font-serif text-2xl text-plum mb-1">
                    02 · Curate Bead Palette & Hardware
                  </h3>
                  <p className="text-xs text-ink-muted font-light">
                    Every bead palette is verified for dye-fastness and light-refraction balance.
                  </p>
                </div>

                {/* Bead Palette */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-editorial text-plum font-bold block">
                    A · Master Bead Colorway
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeConfig.paletteOptions.map((pal, idx) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() => setSelectedPaletteIndex(idx)}
                        className={`p-3.5 rounded-sm text-left border flex items-center gap-3 transition-all cursor-pointer ${
                          selectedPaletteIndex === idx
                            ? 'bg-canvas border-rosewood ring-2 ring-rosewood/30 shadow-sm'
                            : 'bg-canvas-subtle/50 border-border-subtle hover:border-border-strong'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-border-medium shrink-0 shadow-xs"
                          style={{ backgroundColor: pal.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-serif text-sm text-plum block font-medium">
                            {pal.name}
                          </span>
                          <span className="text-[11px] text-ink-light truncate block font-light">
                            {pal.desc}
                          </span>
                        </div>
                        {selectedPaletteIndex === idx && <Check className="w-4 h-4 text-rosewood shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hardware Accent */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs uppercase tracking-editorial text-plum font-bold block">
                    B · Hardware Accent & Wire Finish
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {activeConfig.accentOptions.map((acc, idx) => (
                      <button
                        key={acc.name}
                        type="button"
                        onClick={() => setSelectedAccentIndex(idx)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs border transition-all cursor-pointer ${
                          selectedAccentIndex === idx
                            ? 'bg-canvas border-rosewood ring-1 ring-rosewood font-medium shadow-xs'
                            : 'bg-canvas/70 border-border-medium text-ink hover:border-border-strong'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-border-medium"
                          style={{ backgroundColor: acc.hex }}
                        />
                        <span className="text-plum">{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Charms */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs uppercase tracking-editorial text-plum font-bold block">
                    C · Atelier Charms & Embellishments (+₹99 each)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeConfig.charmOptions.map((charm) => (
                      <button
                        key={charm}
                        type="button"
                        onClick={() => toggleCharm(charm)}
                        className={`p-3 rounded-sm text-left text-xs border flex items-center justify-between transition-all cursor-pointer ${
                          selectedCharms.includes(charm)
                            ? 'bg-blush/30 border-rosewood text-plum font-medium'
                            : 'bg-canvas border-border-subtle text-ink-muted hover:border-border-strong'
                        }`}
                      >
                        <span>{charm}</span>
                        <span className={`w-4 h-4 rounded-sm border flex items-center justify-center text-[10px] ${selectedCharms.includes(charm) ? 'bg-rosewood text-canvas border-rosewood' : 'border-border-medium'}`}>
                          {selectedCharms.includes(charm) ? '✓' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-ink-muted hover:text-plum cursor-pointer"
                  >
                    ← Back to Silhouette
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-medium rounded-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Proceed to Personalization</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Personalization & Occasion */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-serif text-2xl text-plum mb-1">
                    03 · Occasion & Monogram Inscriptions
                  </h3>
                  <p className="text-xs text-ink-muted font-light">
                    Add custom monogram initials and custom notes for our artisan team.
                  </p>
                </div>

                {/* Monogram Input */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-editorial text-plum font-bold block">
                    Custom Monogram Initial(s) (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. &apos;S&apos;, &apos;AK&apos;, &apos;PRIYA&apos;"
                    value={monogramText}
                    onChange={e => setMonogramText(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-sm text-sm text-plum placeholder:text-ink-faint focus:outline-none focus:border-rosewood"
                  />
                  <p className="text-[11px] text-ink-light">
                    Our artisans will weave or stamp your initials onto a bespoke pearl plaque or charm tag.
                  </p>
                </div>

                {/* Occasion Selection */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-editorial text-plum font-bold block">
                    What is the Occasion?
                  </label>
                  <select
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-sm text-xs text-plum focus:outline-none focus:border-rosewood cursor-pointer"
                  >
                    <option value="Personal Milestone">Personal Milestone / Self-Treat</option>
                    <option value="Bridal & Wedding Ensemble">Bridal & Wedding Ensemble</option>
                    <option value="Birthday Gift">Birthday Keepsake</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Festive Celebration">Diwali / Festive Celebration</option>
                    <option value="Bridesmaids Hamper">Bridesmaids & Groomsmen Gifting</option>
                  </select>
                </div>

                {/* Artisan Notes */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-editorial text-plum font-bold block">
                    Notes for the Atelier Weaver
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Specify any custom requests (e.g., &apos;Please match ivory lehenga swatch&apos;, &apos;longer strap drop 58cm&apos;, or delivery deadline)..."
                    value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-sm text-xs text-plum placeholder:text-ink-faint focus:outline-none focus:border-rosewood"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-ink-muted hover:text-plum cursor-pointer"
                  >
                    ← Back to Colors
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-6 py-3 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-editorial font-medium rounded-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Review Specification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Finalize */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-serif text-2xl text-plum mb-1">
                    04 · Final Review & Order Placement
                  </h3>
                  <p className="text-xs text-ink-muted font-light">
                    Review your bespoke configuration before submitting to our loom master.
                  </p>
                </div>

                {/* Quantity Control */}
                <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-xs font-medium text-plum">Pieces to Weave:</span>
                  <div className="inline-flex items-center border border-border-medium rounded-full bg-canvas overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-7 h-7 flex items-center justify-center text-ink hover:text-rosewood"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-plum">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-7 h-7 flex items-center justify-center text-ink hover:text-rosewood"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Submission Confirmation Feedback */}
                {submitted ? (
                  <div className="p-6 bg-blush/40 border border-rosewood rounded-sm text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-rosewood text-canvas flex items-center justify-center">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-2xl text-plum">
                      Added to Shopping Bag!
                    </h4>
                    <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                      Your bespoke piece is staged in your cart. You can proceed to checkout or review directly via WhatsApp with our creative director.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        href="/cart"
                        className="px-6 py-2.5 bg-plum text-canvas text-xs uppercase tracking-editorial rounded-sm font-semibold"
                      >
                        View Shopping Bag
                      </Link>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 bg-canvas border border-border-medium text-plum text-xs uppercase tracking-editorial rounded-sm font-medium flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Chat via WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full py-4 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-monumental font-semibold rounded-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add Bespoke Piece to Bag · {formatINR(estimatedTotal)}</span>
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-canvas border border-border-strong hover:border-emerald-700 text-plum hover:text-emerald-800 text-xs uppercase tracking-editorial font-medium rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-700" />
                      <span>Direct WhatsApp Loom Approval ↗</span>
                    </a>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-ink-light">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="hover:underline cursor-pointer"
                  >
                    ← Edit Monogram & Notes
                  </button>
                  <span>Dispatched in {activeConfig.turnaroundDays} business days</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Live Spec Summary Card (Span 5) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-canvas-subtle p-6 sm:p-8 rounded-sm border border-border-medium shadow-xl space-y-6">
              <div className="border-b border-border-subtle pb-4">
                <span className="text-[10px] uppercase tracking-monumental text-rosewood font-sans font-bold block mb-1">
                  Atelier Work Ticket
                </span>
                <h3 className="font-serif text-2xl text-plum">
                  {activeConfig.productType}
                </h3>
                <p className="text-xs text-ink-light mt-0.5">
                  Hand-woven to order in Kalajay Atelier
                </p>
              </div>

              {/* Spec Checklist */}
              <div className="space-y-3 text-xs text-ink divide-y divide-border-subtle/60">
                <div className="flex justify-between pt-2">
                  <span className="text-ink-light">Colorway:</span>
                  <span className="font-medium text-plum flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-border-subtle inline-block"
                      style={{ backgroundColor: activePalette.hex }}
                    />
                    <span>{activePalette.name}</span>
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-ink-light">Hardware Finish:</span>
                  <span className="font-medium text-plum">{activeAccent.name}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-ink-light">Embellishments:</span>
                  <span className="font-medium text-plum">
                    {selectedCharms.length > 0 ? selectedCharms.join(', ') : 'None'}
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-ink-light">Monogram Initial:</span>
                  <span className="font-serif font-bold text-rosewood text-sm">
                    {monogramText || 'None'}
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-ink-light">Occasion:</span>
                  <span className="font-medium text-plum">{occasion}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-ink-light">Estimated Lead Time:</span>
                  <span className="font-medium text-plum">{activeConfig.turnaroundDays} Days</span>
                </div>

                <div className="flex justify-between pt-3 text-sm font-semibold text-plum border-t border-border-subtle">
                  <span>Total Estimate ({quantity} {quantity === 1 ? 'piece' : 'pieces'}):</span>
                  <span className="font-serif text-xl text-rosewood">
                    {formatINR(estimatedTotal)}
                  </span>
                </div>
              </div>

              {/* Atelier Guarantee */}
              <div className="p-4 bg-canvas rounded-sm border border-border-subtle text-[11px] text-ink-light space-y-1">
                <span className="font-medium text-plum block">Handcraft Approval Guarantee</span>
                <p>
                  Before shipping, our studio sends high-resolution macro photos of your finished piece via WhatsApp for your final approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

