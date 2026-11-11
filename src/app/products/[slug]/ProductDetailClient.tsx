'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Gem,
  ShieldCheck,
  Truck,
  Clock,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  HelpCircle,
  Package,
} from 'lucide-react';
import { PRODUCTS, Product, ProductVariant } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  slug?: string;
}

export default function ProductDetailClient({ slug: propSlug }: ProductDetailClientProps) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);

  const product = PRODUCTS.find((p) => p.slug === slug);
  const { addToCart, formatINR } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    craft: true,
    dimensions: false,
    care: false,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!product) {
    return notFound();
  }

  // "Pairs well with" curated products
  const pairsWellWith = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category !== product.category
  ).slice(0, 3);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentImages = product.images.length > 0 ? product.images : [product.coverImage];
  const activeImage = currentImages[activeImageIndex] || product.coverImage;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const waOrderText = `Hi Kalajay! I'm interested in ordering:\n• ${product.name}${
    selectedVariant ? ` (${selectedVariant.label})` : ''
  } [${selectedVariant ? selectedVariant.code : product.code}]\nQuantity: ${quantity}\nPrice: ${formatINR(
    currentPrice * quantity
  )}\n\nCan you please confirm dispatch timeline?`;

  const waUrl = `https://wa.me/919740540847?text=${encodeURIComponent(waOrderText)}`;

  const waBulkText = `Hi Kalajay! I would like to enquire about bulk / wedding favour pricing for:\n• ${product.name} [${product.code}]\nEstimated quantity: 25+ pieces.\nCould you please share your volume tier pricing and lead time?`;
  const waBulkUrl = `https://wa.me/919740540847?text=${encodeURIComponent(waBulkText)}`;

  return (
    <div className="bg-canvas min-h-screen pb-28 sm:pb-32">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-xs text-ink-muted flex items-center gap-2 border-b border-border-subtle/80">
        <Link href="/" className="hover:text-rosewood">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-rosewood">
          Catalogue
        </Link>
        <span>/</span>
        <Link href={`/collections/${product.categorySlug}`} className="hover:text-rosewood">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-plum truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Image Gallery (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Viewport Image */}
            <div className="relative aspect-[4/5] sm:aspect-[1/1] rounded-image overflow-hidden bg-canvas-subtle border border-border-gold shadow-md group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {product.isBestSeller && (
                <span className="absolute top-4 left-4 bg-plum text-canvas text-[11px] uppercase tracking-refined px-3 py-1 rounded-full font-sans font-medium">
                  Craft House Signature
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                {currentImages.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-24 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-rosewood ring-2 ring-rosewood/40'
                        : 'border-border-subtle opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* "Made by Hand" Authentic Nuance Note */}
            <div className="p-5 bg-canvas-subtle/80 rounded-image border border-border-gold flex items-start gap-3.5 text-xs text-ink-muted">
              <Gem className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-plum block mb-0.5 font-medium font-serif text-sm">
                  Made by Hand: Variation is Part of the Charm
                </strong>
                <span className="leading-relaxed font-light">
                  Every Kalajay object is hand-strung by our independent women makers. Subtle nuances in bead tension, facet reflections, and minor dimensions are organic signatures of authentic human artistry.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Restrained Luxury Product Info (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-1">
                {product.category} · {product.code}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-plum font-normal leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="font-serif text-2xl sm:text-3xl text-plum font-semibold">
                  {formatINR(currentPrice)}
                </span>
                {product.originalPrice > currentPrice && (
                  <span className="text-sm text-ink-faint line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                  Inclusive of all taxes
                </span>
              </div>
            </div>

            {/* Editorial Narrative */}
            <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed pt-1">
              {product.description}
            </p>

            {/* Variants Selector */}
            {product.variants.length > 0 && (
              <div className="pt-4 border-t border-border-subtle space-y-3">
                <label className="text-[11px] uppercase tracking-refined text-plum font-bold block">
                  Select Colorway & Finish ({product.variants.length} available):
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.image) {
                          const idx = currentImages.indexOf(v.image);
                          if (idx !== -1) setActiveImageIndex(idx);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-sans transition-all border cursor-pointer ${
                        selectedVariant?.code === v.code
                          ? 'bg-[#9E5430] text-white border-[#9E5430] shadow-sm font-medium'
                          : 'bg-canvas text-ink border-border-medium hover:border-[#A99583]'
                      }`}
                    >
                      <span>{v.label}</span>
                      <span className="opacity-60 ml-1.5 text-[11px]">{formatINR(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Bag Buttons */}
            <div className="pt-4 border-t border-border-subtle space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-refined text-ink-muted font-medium">
                  Quantity:
                </span>
                <div className="inline-flex items-center border border-border-medium rounded-full bg-canvas-subtle overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink hover:text-rosewood transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-plum font-serif">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink hover:text-rosewood transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] text-xs uppercase tracking-monumental font-semibold rounded-full flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-champagne" />
                      <span>Added to Your Shopping Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Shopping Bag · {formatINR(currentPrice * quantity)}</span>
                    </>
                  )}
                </button>

                {/* Instant WhatsApp Order Link */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-canvas border border-border-strong hover:border-emerald-700 text-plum hover:text-emerald-800 text-xs uppercase tracking-refined font-medium rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>Order Directly via WhatsApp</span>
                </a>
              </div>

              {/* Bulk Prices on Request Line */}
              <div className="p-4 bg-blush/35 rounded-image border border-border-gold flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-plum block">Bulk Prices on Request</span>
                  <span className="text-[11px] text-ink-muted">
                    Favours & corporate gifting (25+ units)
                  </span>
                </div>
                <a
                  href={waBulkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-canvas border border-rosewood text-rosewood hover:bg-rosewood hover:text-canvas text-[11px] font-semibold uppercase tracking-refined rounded-full transition-colors"
                >
                  Enquire Bulk
                </a>
              </div>
            </div>

            {/* Accordion Specification Stack */}
            <div className="pt-4 border-t border-border-subtle divide-y divide-border-subtle text-xs">
              {/* Accordion 1: Craftsmanship & Materials */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('craft')}
                  className="w-full flex items-center justify-between py-1 text-left font-sans uppercase tracking-refined text-xs font-semibold text-plum cursor-pointer"
                >
                  <span>Materials & Craftsmanship</span>
                  {openAccordions.craft ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.craft && (
                  <div className="pt-2 text-ink-muted space-y-1.5 leading-relaxed">
                    <p>
                      <strong>Materials:</strong> {product.materials.join(', ')}.
                    </p>
                    <p>
                      <strong>Artisan Lead Time:</strong> {product.craftHours}.
                    </p>
                    <p>
                      <strong>Craft House Origin:</strong> Hand-crafted loom stringing; studio curation & dispatch.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Dimensions */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('dimensions')}
                  className="w-full flex items-center justify-between py-1 text-left font-sans uppercase tracking-refined text-xs font-semibold text-plum cursor-pointer"
                >
                  <span>Dimensions & Capacity</span>
                  {openAccordions.dimensions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.dimensions && (
                  <div className="pt-2 text-ink-muted space-y-1 leading-relaxed">
                    <p>
                      <strong>Exact Dimensions:</strong> {product.dimensions}.
                    </p>
                    <p>
                      Cradles fine rings, heirloom pendants, vanity cosmetics, or everyday accessories.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Care Instructions */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex items-center justify-between py-1 text-left font-sans uppercase tracking-refined text-xs font-semibold text-plum cursor-pointer"
                >
                  <span>Heirloom Care & Longevity</span>
                  {openAccordions.care ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.care && (
                  <div className="pt-2 text-ink-muted space-y-1 leading-relaxed">
                    <p>{product.care}</p>
                    <p>Avoid submerging in boiling water. Store inside the complimentary cotton dust bag.</p>
                  </div>
                )}
              </div>

              {/* Accordion 4: Shipping & 48-Hour Guarantee */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between py-1 text-left font-sans uppercase tracking-refined text-xs font-semibold text-plum cursor-pointer"
                >
                  <span>Shipping & 48-Hour Protection</span>
                  {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.shipping && (
                  <div className="pt-2 text-ink-muted space-y-1 leading-relaxed">
                    <p>• Complimentary Pan-India shipping for all orders above ₹599.</p>
                    <p>• 48-Hour Transit Guarantee: Immediate complimentary replacement for any transit damage.</p>
                    <p>• Standard handcrafted dispatch within 3–5 business days.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* "Pairs Well With" Recommendations Rail */}
        <div className="mt-20 pt-12 border-t border-border-subtle">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block">
                Craft House Harmony
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-plum">
                Pairs Well With
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-refined text-plum hover:text-rosewood font-semibold"
            >
              Browse All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pairsWellWith.map((item) => (
              <div
                key={item.id}
                className="bg-canvas-subtle/50 p-4 rounded-image border border-border-gold flex gap-4 items-center"
              >
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-canvas shrink-0">
                  <img src={item.coverImage} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-refined text-ink-muted block truncate">
                    {item.category}
                  </span>
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-serif text-base text-plum hover:text-rosewood block truncate mt-0.5"
                  >
                    {item.name}
                  </Link>
                  <div className="font-serif text-sm font-semibold text-rosewood mt-1">
                    {formatINR(item.price)}
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="mt-2 text-[11px] uppercase tracking-refined font-semibold text-plum hover:text-rosewood flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Quick Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar (Price + Add + WhatsApp) */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-canvas/95 backdrop-blur-md p-3 border-t border-border-gold shadow-2xl flex items-center gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-refined text-ink-muted block">Total Price</span>
          <span className="font-serif text-lg font-bold text-plum">
            {formatINR(currentPrice * quantity)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 py-3 px-4 bg-plum text-canvas text-xs uppercase tracking-refined font-semibold rounded-full flex items-center justify-center gap-2 shadow-md"
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-champagne" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag</span>
            </>
          )}
        </button>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order on WhatsApp"
          className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full"
        >
          <MessageCircle className="w-5 h-5 text-emerald-700" />
        </a>
      </div>
    </div>
  );
}

