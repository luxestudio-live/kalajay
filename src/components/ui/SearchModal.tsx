'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight, Gem } from 'lucide-react';
import { PRODUCTS, COLLECTIONS, Product } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatINR } = useCart();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery =
      !query.trim() ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.materials.some(m => m.toLowerCase().includes(query.toLowerCase()));
    return matchesCat && matchesQuery;
  }).slice(0, 12);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#372921]/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-screen px-4 text-center sm:p-0 flex items-start justify-center pt-16 sm:pt-24 relative z-10">
        <div className="w-full max-w-3xl bg-[#FFFCF7] rounded-sm shadow-2xl border border-[#DED3C5] overflow-hidden text-left animate-fade-in">
          {/* Search Header Bar */}
          <div className="p-4 sm:p-6 border-b border-[#EAE2D8] bg-[#F7F3EC]/50">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#76695F] absolute left-3 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by piece name, bead type, crystal, category, or code (e.g. 'KJ-ORG-101')..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-[#F7F3EC] border border-[#DED3C5] rounded-sm text-sm text-[#372921] placeholder:text-[#76695F] focus:outline-none focus:border-[#9E5430] transition-colors"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 p-1 text-ink-faint hover:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Quick Category Filters */}
            <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar text-xs">
              <span className="text-[11px] uppercase tracking-refined text-ink-muted font-semibold shrink-0 mr-1">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded-full border transition-colors shrink-0 ${
                  selectedCategory === 'All'
                    ? 'bg-plum text-canvas border-plum'
                    : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
                }`}
              >
                All Pieces
              </button>
              {COLLECTIONS.map(col => (
                <button
                  key={col.slug}
                  type="button"
                  onClick={() => setSelectedCategory(col.name)}
                  className={`px-3 py-1 rounded-full border transition-colors shrink-0 ${
                    selectedCategory === col.name
                      ? 'bg-plum text-canvas border-plum'
                      : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-light pb-2">
              <span>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'piece found' : 'pieces found'}
              </span>
              <span className="text-[11px] font-sans">Press ESC to close</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-ink-light space-y-2">
                <p className="font-serif text-lg text-plum">No matching pieces found</p>
                <p className="text-xs max-w-sm mx-auto">
                  Try searching for &quot;Pearl&quot;, &quot;Jewellery Box&quot;, &quot;Sling&quot;, &quot;AirPod&quot;, or browse by category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 rounded-sm border border-border-subtle bg-canvas hover:border-rosewood hover:shadow-sm transition-all group"
                  >
                    <div className="w-14 h-16 bg-canvas-subtle rounded-sm overflow-hidden shrink-0 border border-border-subtle">
                      <img
                        src={product.coverImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm text-plum truncate group-hover:text-rosewood transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-ink-light truncate mt-0.5">
                        {product.category} · {product.code}
                      </p>
                      <p className="text-xs font-semibold text-rosewood mt-1 font-serif">
                        {formatINR(product.price)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-rosewood shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-canvas-subtle/80 border-t border-border-subtle flex items-center justify-between text-xs text-ink-light">
            <span className="flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-gold" />
              <span>Looking for a custom color or bridal order?</span>
            </span>
            <Link
              href="/customise"
              onClick={onClose}
              className="text-rosewood font-medium hover:underline flex items-center gap-1"
            >
              <span>Explore Custom Studio</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

