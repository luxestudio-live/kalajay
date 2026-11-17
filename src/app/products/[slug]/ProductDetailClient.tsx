'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
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
  Star,
  PenLine,
  Sparkles,
  Send,
  UserCheck,
} from 'lucide-react';
import { PRODUCTS, Product, ProductVariant, DEFAULT_REVIEWS, ReviewItem } from '@/data/catalogue';
import { getFirestoreProducts, getFirestoreInventory } from '@/lib/firestore';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  slug?: string;
}

export default function ProductDetailClient({ slug: propSlug }: ProductDetailClientProps) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);

  const [product, setProduct] = useState<Product | undefined>(() =>
    PRODUCTS.find((p) => p.slug === slug || p.code === slug || p.id === slug)
  );
  const [isLiveLoaded, setIsLiveLoaded] = useState(false);
  const [liveInventoryStock, setLiveInventoryStock] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    getFirestoreProducts().then((liveProds) => {
      if (!isMounted) return;
      if (liveProds && liveProds.length > 0) {
        const live = liveProds.find((p) => p.slug === slug || p.code === slug || p.id === slug);
        if (live) {
          setProduct(live);
        }
      }
      setIsLiveLoaded(true);
    }).catch(() => {
      if (isMounted) setIsLiveLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Sync live inventory stock for accurate availability
  useEffect(() => {
    if (product?.code) {
      getFirestoreInventory().then((invItems) => {
        const item = invItems.find(i => i.sku === product.code);
        if (item) {
          setLiveInventoryStock(item.available !== undefined ? item.available : item.onHand);
        }
      }).catch(() => {});
    }
  }, [product?.code]);

  const { addToCart, formatINR } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Synchronize variant if product data updates from Firestore
  useEffect(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

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

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    return DEFAULT_REVIEWS.filter(
      (r) =>
        r.status === 'approved' &&
        (r.productSlug === slug ||
          r.productId === product?.id ||
          r.productId === product?.code ||
          (product && r.product && r.product.toLowerCase().includes(product.name.toLowerCase())))
    );
  });
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string | null>(null);

  // Sync approved reviews from API
  useEffect(() => {
    if (!slug && !product?.id) return;
    setIsReviewsLoading(true);
    fetch(`/api/reviews?slug=${encodeURIComponent(slug || product?.slug || '')}&productId=${encodeURIComponent(product?.id || product?.code || '')}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => {
        console.error('Failed to load reviews:', err);
      })
      .finally(() => {
        setIsReviewsLoading(false);
      });
  }, [slug, product?.id, product?.code]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewErrorMessage(null);
    setReviewSuccessMessage(null);

    if (!reviewerName.trim()) {
      setReviewErrorMessage('Please provide your name.');
      return;
    }
    if (!reviewerEmail.trim() || !reviewerEmail.includes('@')) {
      setReviewErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewErrorMessage('Please write a reflection of at least 5 characters.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patron: reviewerName.trim(),
          email: reviewerEmail.trim(),
          product: product?.name || 'Handcrafted Creation',
          productSlug: product?.slug || slug,
          productId: product?.id || product?.code,
          rating: reviewRating,
          headline: reviewHeadline.trim(),
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Submission failed');
      }

      setReviewSuccessMessage(
        'Thank you! Your reflection has been submitted to our atelier moderation queue and will appear once verified by our team.'
      );
      setReviewerName('');
      setReviewerEmail('');
      setReviewHeadline('');
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewErrorMessage(err.message || 'Could not submit your review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getRatingDescription = (r: number) => {
    switch (r) {
      case 5: return 'Exceptional Heirloom (5/5)';
      case 4: return 'Exquisite Craftsmanship (4/5)';
      case 3: return 'Pleasing Handmade Piece (3/5)';
      case 2: return 'Fair Workmanship (2/5)';
      case 1: return 'Requires Improvement (1/5)';
      default: return '';
    }
  };

  if (product && (product.status === 'archived' || (product as any).isActive === false || (product as any).active === false)) {
    return notFound();
  }

  if (!product) {
    if (isLiveLoaded) {
      return notFound();
    }
    return (
      <div className="bg-canvas min-h-screen flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-rosewood border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg text-plum">Consulting Atelier Catalogue...</p>
        </div>
      </div>
    );
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
              <Heart className="w-4 h-4 text-rosewood shrink-0 mt-0.5" />
              <div>
                <strong className="text-plum block mb-0.5 font-medium font-serif text-sm">
                  {product.artisanTitle || 'Made by Hand: Variation is Part of the Charm'}
                </strong>
                <span className="leading-relaxed font-light">
                  {product.artisanNote || 'Every Kalajay object is hand-strung by our independent women makers. Subtle nuances in bead tension, facet reflections, and minor dimensions are organic signatures of authentic human artistry.'}
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
                  className="w-full py-3.5 px-6 bg-canvas border border-rosewood/40 hover:border-rosewood text-rosewood hover:text-plum text-xs uppercase tracking-refined font-medium rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-rosewood" />
                  <span>Order Directly via WhatsApp</span>
                </a>
              </div>

              {/* Bulk Prices on Request Line */}
              <div className="p-4 bg-blush/35 rounded-image border border-border-gold flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-plum block">Bulk Prices on Request</span>
                  <span className="text-[11px] text-ink-muted">
                    {product.bulkEnquiryNote || 'Favours & corporate gifting (25+ units)'}
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
                  <span>Materials &amp; Craftsmanship</span>
                  {openAccordions.craft ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.craft && (
                  <div className="pt-2 text-ink-muted space-y-1.5 leading-relaxed">
                    <p>
                      <strong>Materials:</strong> {Array.isArray(product.materials) ? product.materials.join(', ') : product.materials}.
                    </p>
                    <p>
                      <strong>Artisan Lead Time:</strong> {product.craftHours}.
                    </p>
                    <p>
                      <strong>Craft House Origin:</strong> {product.origin || 'Hand-crafted loom stringing; studio curation & dispatch.'}
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
                  <span>Dimensions &amp; Capacity</span>
                  {openAccordions.dimensions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.dimensions && (
                  <div className="pt-2 text-ink-muted space-y-1 leading-relaxed">
                    <p>
                      <strong>Exact Dimensions:</strong> {product.dimensions}.
                    </p>
                    <p>
                      {product.dimensionsNote || 'Cradles fine rings, heirloom pendants, vanity cosmetics, or everyday accessories.'}
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
                  <span>Heirloom Care &amp; Longevity</span>
                  {openAccordions.care ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.care && (
                  <div className="pt-2 text-ink-muted space-y-1 leading-relaxed">
                    <p>{product.care}</p>
                    <p>{product.careNote || 'Avoid submerging in boiling water. Store inside the complimentary cotton dust bag.'}</p>
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
                  <span>Shipping &amp; 48-Hour Protection</span>
                  {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.shipping && (
                  <div className="pt-2 text-ink-muted space-y-1 leading-relaxed">
                    <p>• {product.shippingPolicy || 'Complimentary Pan-India shipping for all orders above ₹599.'}</p>
                    <p>• {product.transitGuarantee || '48-Hour Transit Guarantee: Immediate complimentary replacement for any transit damage.'}</p>
                    <p>• {product.dispatchTimeline || 'Standard handcrafted dispatch within 3–5 business days.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PATRON REFLECTIONS & REVIEWS SECTION
            ========================================================================= */}
        <div id="patron-reviews" className="mt-20 pt-12 border-t border-border-gold/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-rosewood" />
                <span>Atelier Testimonials</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-plum font-normal">
                Patron Reflections &amp; Reviews
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex text-amber-500 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-plum font-serif">
                  {reviews.length > 0
                    ? `${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5.0`
                    : '5.0 / 5.0'}
                </span>
                <span className="text-xs text-ink-faint">·</span>
                <span className="text-xs text-ink-muted">
                  {reviews.length} {reviews.length === 1 ? 'Verified Patron Reflection' : 'Verified Patron Reflections'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowReviewForm((prev) => !prev);
                setReviewSuccessMessage(null);
                setReviewErrorMessage(null);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] text-xs uppercase tracking-refined font-semibold shadow-sm transition-all cursor-pointer self-start md:self-auto"
            >
              <PenLine className="w-3.5 h-3.5 text-champagne" />
              <span>{showReviewForm ? 'Close Reflection Form' : 'Write an Atelier Review'}</span>
            </button>
          </div>

          {/* Feedback Notices */}
          {reviewSuccessMessage && (
            <div className="p-4 mb-6 bg-emerald-50 border border-emerald-300/80 rounded-image text-emerald-900 text-xs flex items-start gap-3 animate-fade-in shadow-xs">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5">Reflection Received with Gratitude</strong>
                <p className="leading-relaxed">{reviewSuccessMessage}</p>
              </div>
            </div>
          )}

          {reviewErrorMessage && (
            <div className="p-4 mb-6 bg-rose-50 border border-rose-300/80 rounded-image text-rose-900 text-xs flex items-start gap-3 animate-fade-in shadow-xs">
              <span className="w-4 h-4 text-rose-700 shrink-0 mt-0.5 font-bold">!</span>
              <div>
                <strong className="block font-semibold mb-0.5">Verification Notice</strong>
                <p className="leading-relaxed">{reviewErrorMessage}</p>
              </div>
            </div>
          )}

          {/* Review Submission Form Drawer / Card */}
          {showReviewForm && (
            <div className="bg-canvas-subtle/80 border border-border-gold rounded-image p-6 sm:p-8 mb-10 shadow-md animate-fade-in">
              <div className="max-w-2xl">
                <span className="text-[10px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-1">
                  Atelier Verification
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-plum mb-2">
                  Share Your Experience with &ldquo;{product.name}&rdquo;
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed mb-6 font-light">
                  Every reflection is verified by our studio curatorial team. Please describe the texture, bead tension, hue nuance, or how this piece complements your personal aesthetic.
                </p>

                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-plum uppercase tracking-refined mb-2">
                      Artisanal Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setReviewRating(starVal)}
                            className="p-1 text-2xl transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                            aria-label={`Rate ${starVal} out of 5 stars`}
                          >
                            <span
                              className={
                                (hoverRating || reviewRating) >= starVal
                                  ? 'text-amber-500'
                                  : 'text-border-medium'
                              }
                            >
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-serif text-plum font-medium ml-2">
                        {getRatingDescription(hoverRating || reviewRating)}
                      </span>
                    </div>
                  </div>

                  {/* Patron Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-plum mb-1.5">
                        Your Name / Signature *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Radhika Kothari"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-plum mb-1.5">
                        Email Address (Kept Private) *
                      </label>
                      <input
                        type="email"
                        required
                        value={reviewerEmail}
                        onChange={(e) => setReviewerEmail(e.target.value)}
                        placeholder="e.g. radhika@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                      />
                      <p className="text-[10px] text-ink-faint mt-1">
                        Guaranteed confidential under DPDP regulations; never published publicly.
                      </p>
                    </div>
                  </div>

                  {/* Review Headline */}
                  <div>
                    <label className="block text-xs font-semibold text-plum mb-1.5">
                      Reflection Headline (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewHeadline}
                      onChange={(e) => setReviewHeadline(e.target.value)}
                      placeholder="e.g. Luminous beadwork and exquisite weight"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border-medium text-xs text-plum focus:outline-none focus:border-rosewood"
                    />
                  </div>

                  {/* Review Narrative */}
                  <div>
                    <label className="block text-xs font-semibold text-plum mb-1.5">
                      Your Detailed Experience / Narrative *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe the tactile sensation, bead reflection, craftsmanship details, or compliments received..."
                      className="w-full p-3.5 rounded-xl bg-canvas border border-border-medium text-xs text-plum leading-relaxed focus:outline-none focus:border-rosewood"
                    />
                  </div>

                  {/* Submit / Cancel Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-6 py-3 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs uppercase tracking-refined font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReview ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting to Atelier...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Reflection for Moderation</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-3 rounded-full border border-border-medium text-xs text-ink-muted hover:text-plum transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-canvas-subtle/50 p-6 rounded-image border border-border-gold flex flex-col justify-between space-y-4 hover:border-rosewood/40 transition-colors shadow-2xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-500 text-xs">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <span className="text-[10.5px] font-mono text-ink-faint">{rev.date}</span>
                    </div>

                    {rev.headline && (
                      <h4 className="font-serif text-base text-plum font-medium leading-snug">
                        &ldquo;{rev.headline}&rdquo;
                      </h4>
                    )}

                    <p className="text-xs sm:text-[12.5px] text-ink-muted leading-relaxed font-light">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle/70">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-plum/10 text-plum font-serif text-[11px] font-semibold flex items-center justify-center">
                        {rev.patron.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-plum">{rev.patron}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 font-sans font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      <span>Verified Patron</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-canvas-subtle/40 rounded-image border border-border-gold p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-blush/60 text-rosewood flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-plum">Be the First to Leave a Reflection</h3>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Every Kalajay object is created by our independent women artisans. Share your experience with this piece and guide future patrons of the craft house.
              </p>
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="px-5 py-2.5 rounded-full bg-rosewood text-canvas text-xs uppercase tracking-refined font-semibold shadow-xs hover:bg-plum transition-colors cursor-pointer"
              >
                Share First Atelier Reflection
              </button>
            </div>
          )}
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
          className="p-3 bg-canvas-subtle hover:bg-canvas text-rosewood hover:text-plum border border-border-default rounded-full flex items-center justify-center transition-colors shadow-2xs"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
        </a>
      </div>
    </div>
  );
}

