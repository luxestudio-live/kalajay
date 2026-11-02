'use client';

import React, { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Check,
  Gem,
  X,
  Eye,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PRODUCTS, COLLECTIONS, Product, ProductVariant } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';

const ITEMS_PER_PAGE = 16;

export function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortOrder, setSortOrder] = useState<string>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewVariant, setQuickViewVariant] = useState<ProductVariant | undefined>(undefined);
  const [quickViewQty, setQuickViewQty] = useState(1);

  const catalogueTopRef = useRef<HTMLDivElement>(null);

  const { addToCart, formatINR, totalCount, openCart } = useCart();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedColor, searchQuery, sortOrder, onlyInStock]);

  const colorSwatches = [
    { label: 'Pearl', hex: '#FAF7F2', border: '#D8CCBD' },
    { label: 'Rose Pink', hex: '#F3D9D6', border: '#E8CCD0' },
    { label: 'Crystal Clear', hex: '#EAEAEA', border: '#CBD5E1' },
    { label: 'Champagne Gold', hex: '#B8924A', border: '#947232' },
    { label: 'Lavender', hex: '#C9B4DB', border: '#A78FBD' },
    { label: 'Emerald', hex: '#2D5A46', border: '#1B4030' },
    { label: 'Plum Black', hex: '#2B1A22', border: '#18121C' },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Color filter
    if (selectedColor !== 'All') {
      const c = selectedColor.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(c) ||
          p.materials.some((m) => m.toLowerCase().includes(c)) ||
          p.variants.some((v) => v.label.toLowerCase().includes(c))
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.materials.some((m) => m.toLowerCase().includes(q))
      );
    }

    // Stock filter
    if (onlyInStock) {
      list = list.filter((p) => p.inStock);
    }

    // Sorting
    switch (sortOrder) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'alpha':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'most-bought':
        list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [selectedCategory, selectedColor, searchQuery, sortOrder, onlyInStock]);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === safePage) return;
    setCurrentPage(newPage);
    if (catalogueTopRef.current) {
      const headerOffset = 140;
      const elementPosition = catalogueTopRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const openQuickView = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
    setQuickViewVariant(product.variants.length > 0 ? product.variants[0] : undefined);
    setQuickViewQty(1);
  };

  const handleQuickViewAdd = () => {
    if (!quickViewProduct) return;
    addToCart(quickViewProduct, quickViewVariant, quickViewQty);
    setQuickViewProduct(null);
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedColor('All');
    setSearchQuery('');
    setOnlyInStock(false);
    setSortOrder('featured');
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (safePage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Page Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase tracking-refined text-gold-dark font-sans font-semibold block mb-2">
              The Complete Storefront
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight">
              All Handcrafted Pieces
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
              Every creation is hand-woven to order with patience and devotion by our master women artisans. Filter by category, color, or custom colorway.
            </p>
          </div>
        </div>
      </div>

      <div ref={catalogueTopRef} id="shop-product-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        {/* Sticky Filter Bar on Desktop & Mobile */}
        <div className="sticky top-20 z-20 bg-canvas/95 backdrop-blur-md pb-4 pt-1 border-b border-border-subtle space-y-3.5">
          {/* Category Chips Scroll Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-ink text-canvas border-ink font-semibold shadow-xs'
                  : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
              }`}
            >
              All Pieces ({PRODUCTS.length})
            </button>
            {COLLECTIONS.map((col) => {
              const count = PRODUCTS.filter((p) => p.category === col.name).length;
              return (
                <button
                  key={col.slug}
                  type="button"
                  onClick={() => setSelectedCategory(col.name)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                    selectedCategory === col.name
                      ? 'bg-ink text-canvas border-ink font-semibold shadow-xs'
                      : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {col.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Secondary Filter & Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search pieces, crystals, beads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-canvas border border-border-medium rounded-full text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Gemstone Color Palette Swatches */}
            <div className="hidden lg:flex items-center gap-2.5 bg-canvas px-3.5 py-1.5 rounded-full border border-border-subtle shadow-2xs">
              <span className="text-[11px] uppercase tracking-refined text-ink-muted font-medium flex items-center gap-1.5">
                <Gem className="w-3 h-3 text-gold" />
                <span>Palette</span>
              </span>

              {/* All Toggle */}
              <button
                type="button"
                onClick={() => setSelectedColor('All')}
                className={`text-xs px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-medium ${
                  selectedColor === 'All'
                    ? 'bg-ink text-canvas shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                All
              </button>

              <div className="h-3 w-px bg-border-medium" />

              {/* Circular Gem Swatches with Tooltips & Active Rings */}
              <div className="flex items-center gap-2">
                {colorSwatches.map((swatch) => {
                  const isSelected = selectedColor === swatch.label;
                  return (
                    <div key={swatch.label} className="relative group/swatch">
                      <button
                        type="button"
                        onClick={() => setSelectedColor(isSelected ? 'All' : swatch.label)}
                        className={`w-5 h-5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center relative ${
                          isSelected
                            ? 'ring-2 ring-gold ring-offset-2 ring-offset-canvas scale-110 shadow-sm'
                            : 'hover:scale-115 opacity-85 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: swatch.hex,
                          border: `1px solid ${swatch.border}`,
                        }}
                        aria-label={`Filter by ${swatch.label}`}
                      >
                        {isSelected && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                swatch.label === 'Pearl' || swatch.label === 'Rose Pink' || swatch.label === 'Crystal Clear'
                                    ? '#141312'
                                    : '#FAF9F6',
                            }}
                          />
                        )}
                      </button>

                      {/* Luxury Micro-Tooltip */}
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/swatch:opacity-100 transition-opacity bg-ink text-canvas text-[10px] font-medium tracking-refined px-2 py-0.5 rounded shadow-md whitespace-nowrap z-30">
                        {swatch.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Active Color Tag with 1-click Clear */}
              {selectedColor !== 'All' && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-border-medium">
                  <span className="text-[11px] font-medium text-gold-dark">
                    {selectedColor}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedColor('All')}
                    className="w-4 h-4 rounded-full bg-canvas-subtle hover:bg-border-medium text-ink flex items-center justify-center transition-colors cursor-pointer"
                    title="Clear color filter"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Sort & Count */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 text-ink">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-canvas border border-border-medium rounded-full text-xs text-plum"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              <span className="text-ink-muted hidden md:inline text-[11px]">
                Showing{' '}
                <strong className="text-plum font-semibold">
                  {totalItems === 0 ? 0 : `${startIndex + 1}–${endIndex}`}
                </strong>{' '}
                of <strong className="text-plum font-semibold">{totalItems}</strong> creations
              </span>

              <div className="flex items-center gap-1.5">
                <label htmlFor="shop-sort" className="text-ink-muted shrink-0 text-[11px]">
                  Sort:
                </label>
                <select
                  id="shop-sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-canvas border border-border-medium px-3 py-1.5 rounded-full text-xs text-plum focus:outline-none focus:border-rosewood cursor-pointer"
                >
                  <option value="featured">Featured / Icons</option>
                  <option value="most-bought">Most Bought</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="alpha">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid: 2 columns on mobile, 4 on desktop */}
        <div className="pt-8">
          {totalItems === 0 ? (
            <div className="py-20 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-blush/40 flex items-center justify-center text-rosewood">
                <Gem className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-serif text-2xl text-plum">No matching pieces found</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                We couldn&apos;t find any pieces matching your current filters. Try resetting the color or category filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-plum text-canvas text-xs uppercase tracking-refined rounded-full font-medium hover:bg-rosewood transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {paginatedProducts.map((product) => {
                  const secondImg = product.images[1] || product.coverImage;

                  return (
                    <div
                      key={product.id}
                      className="group bg-canvas-subtle/50 rounded-image border border-border-gold overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <Link href={`/products/${product.slug}`} className="block relative">
                        {/* Image container with second-image hover swap */}
                        <div className="relative aspect-[4/5] bg-canvas overflow-hidden rounded-t-image">
                          <img
                            src={product.coverImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                            loading="lazy"
                          />
                          <img
                            src={secondImg}
                            alt={`${product.name} alternate view`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            loading="lazy"
                          />

                          {/* Badges */}
                          {product.isBestSeller && (
                            <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-plum text-canvas text-[10px] sm:text-[11px] uppercase tracking-refined px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-sans font-medium">
                              Icon
                            </span>
                          )}

                          {/* Quick View Button (desktop hover) */}
                          <button
                            type="button"
                            onClick={(e) => openQuickView(product, e)}
                            title="Quick View"
                            className="absolute bottom-3 right-3 hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-canvas-muted/90 backdrop-blur-md rounded-full text-ink hover:bg-gold hover:text-[#120A10] text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-border-gold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick View</span>
                          </button>
                        </div>

                        {/* Metadata */}
                        <div className="p-3 sm:p-5">
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-refined text-ink-muted block font-sans font-medium truncate">
                            {product.category} · {product.code}
                          </span>
                          <h3 className="font-serif text-sm sm:text-lg text-plum group-hover:text-rosewood transition-colors mt-1 leading-snug line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
                            <span className="font-serif text-sm sm:text-base text-rosewood font-semibold">
                              {formatINR(product.price)}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-[11px] sm:text-xs text-ink-faint line-through">
                                {formatINR(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Quick Add Button */}
                      <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-0">
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-full text-[11px] sm:text-xs uppercase tracking-refined font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs ${
                            addedId === product.id
                              ? 'bg-emerald-700 text-white'
                              : 'bg-plum hover:bg-rosewood text-canvas'
                          }`}
                        >
                          {addedId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Bag</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Luxury Pagination Bar */}
              {totalPages > 1 && (
                <div className="mt-14 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-5">
                  {/* Item Range Counter */}
                  <div className="text-xs text-ink-muted order-2 sm:order-1">
                    Showing <strong className="text-ink font-semibold">{startIndex + 1}–{endIndex}</strong> of{' '}
                    <strong className="text-ink font-semibold">{totalItems}</strong> handcrafted pieces
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                        safePage === 1
                          ? 'opacity-35 cursor-not-allowed bg-canvas text-ink-muted border-border-subtle'
                          : 'cursor-pointer bg-canvas text-ink border-border-medium hover:border-gold hover:text-plum shadow-2xs'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {pageNumbers.map((p, idx) => {
                        if (typeof p === 'string') {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs text-ink-muted tracking-widest select-none"
                            >
                              …
                            </span>
                          );
                        }

                        const isActive = p === safePage;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={`Go to page ${p}`}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs transition-all cursor-pointer flex items-center justify-center font-medium ${
                              isActive
                                ? 'bg-ink text-canvas border border-ink font-semibold shadow-xs'
                                : 'bg-canvas text-ink border border-border-subtle hover:border-gold hover:text-plum'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                        safePage === totalPages
                          ? 'opacity-35 cursor-not-allowed bg-canvas text-ink-muted border-border-subtle'
                          : 'cursor-pointer bg-canvas text-ink border-border-medium hover:border-gold hover:text-plum shadow-2xs'
                      }`}
                    >
                      <span className="hidden xs:inline">Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick View Drawer / Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-plum/70 backdrop-blur-sm transition-opacity"
            onClick={() => setQuickViewProduct(null)}
          />

          <div className="relative bg-canvas w-full max-w-2xl rounded-image border border-border-gold p-6 sm:p-8 shadow-2xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-ink hover:text-rosewood"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 aspect-[4/5] rounded-image overflow-hidden bg-canvas-subtle border border-border-subtle">
                <img
                  src={quickViewVariant?.image || quickViewProduct.coverImage}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="sm:col-span-7 space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block">
                    {quickViewProduct.category} · {quickViewProduct.code}
                  </span>
                  <h3 className="font-serif text-2xl text-plum font-normal mt-0.5">
                    {quickViewProduct.name}
                  </h3>
                  <div className="font-serif text-xl text-rosewood font-semibold mt-1">
                    {formatINR(quickViewVariant?.price || quickViewProduct.price)}
                  </div>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                  {quickViewProduct.description}
                </p>

                {/* Variants if present */}
                {quickViewProduct.variants.length > 0 && (
                  <div>
                    <label className="text-[11px] uppercase tracking-refined text-plum font-bold block mb-1.5">
                      Select Colorway:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.variants.map((v) => (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => setQuickViewVariant(v)}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                            quickViewVariant?.code === v.code
                              ? 'bg-plum text-canvas border-plum'
                              : 'bg-canvas text-ink border-border-medium hover:border-border-strong'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper & Add */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="inline-flex items-center border border-border-medium rounded-full bg-canvas-subtle">
                    <button
                      type="button"
                      onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-ink hover:text-rosewood"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-plum font-serif">
                      {quickViewQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickViewQty((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center text-ink hover:text-rosewood"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickViewAdd}
                    className="flex-1 py-3 px-6 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-refined font-semibold rounded-full shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href={`/products/${quickViewProduct.slug}`}
                    className="text-xs text-rosewood hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Full Product Story & Specs</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-plum/60 backdrop-blur-xs"
            onClick={() => setIsFilterSheetOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 bg-canvas rounded-t-image p-6 border-t border-border-gold shadow-2xl max-h-[80vh] overflow-y-auto animate-fade-up">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <span className="font-serif text-lg text-plum">Filter Creations</span>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 text-ink-muted hover:text-rosewood"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <span className="text-xs uppercase tracking-refined font-bold text-plum block mb-3">
                  Color Palette
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedColor('All');
                      setIsFilterSheetOpen(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedColor === 'All'
                        ? 'bg-plum text-canvas border-plum'
                        : 'bg-canvas text-ink border-border-medium'
                    }`}
                  >
                    All Colors
                  </button>
                  {colorSwatches.map((s) => {
                    const isSelected = selectedColor === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          setSelectedColor(s.label);
                          setIsFilterSheetOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                          isSelected
                            ? 'bg-blush/60 text-plum border-rosewood font-medium shadow-xs'
                            : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0"
                          style={{
                            backgroundColor: s.hex,
                            border: `1px solid ${s.border}`,
                          }}
                        />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Cart Floating Bar */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 lg:hidden">
          <button
            type="button"
            onClick={openCart}
            className="w-full py-3.5 px-6 bg-plum text-canvas rounded-full shadow-2xl flex items-center justify-between border border-gold/40"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-champagne" />
              <span className="text-xs uppercase tracking-refined font-medium">
                {totalCount} {totalCount === 1 ? 'piece' : 'pieces'} in Bag
              </span>
            </div>
            <span className="text-xs font-semibold text-champagne flex items-center gap-1">
              <span>View Bag</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ShopClient() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-serif">Loading Kalajay catalogue...</div>}>
      <ShopContent />
    </Suspense>
  );
}

