'use client';

import React, { useState } from 'react';
import {
  Star,
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Monitor,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { PRODUCTS, Product } from '@/data/catalogue';

export default function FeaturedProductsView() {
  const { featuredConfig, updateFeaturedProducts, inventory, can } = useAdminStore();

  const [mode, setMode] = useState<'manual' | 'auto-bestsellers' | 'auto-new'>(
    featuredConfig.mode
  );
  const [title, setTitle] = useState(featuredConfig.title);
  const [subtitle, setSubtitle] = useState(featuredConfig.subtitle);
  const [displayLimit, setDisplayLimit] = useState(featuredConfig.displayLimit);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    featuredConfig.productIds
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

  const canEdit = can('featured.curator', 'edit');
  const canPublish = can('featured.curator', 'publish');

  // Resolved list of curated products
  const curatedProducts = selectedProductIds
    .map(id => PRODUCTS.find(p => p.id === id || p.code === id))
    .filter((p): p is Product => Boolean(p));

  // Compute live stock inventory status for each curated piece
  const getStockWarning = (sku: string) => {
    const inv = inventory.find(i => i.sku === sku);
    if (!inv) return null;
    if (inv.status === 'out_of_stock') {
      return { level: 'error', text: 'Out of Stock (0 available)' };
    }
    if (inv.status === 'low_stock') {
      return { level: 'warning', text: `Low Stock: Only ${inv.available} available` };
    }
    return null;
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!canEdit) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedProductIds.length) return;
    const next = [...selectedProductIds];
    const [moved] = next.splice(index, 1);
    next.splice(newIndex, 0, moved);
    setSelectedProductIds(next);
    setHasUnsavedChanges(true);
  };

  const handleRemove = (productId: string) => {
    if (!canEdit) return;
    setSelectedProductIds(prev => prev.filter(id => id !== productId));
    setHasUnsavedChanges(true);
  };

  const handleAddProduct = (product: Product) => {
    if (!canEdit) return;
    if (selectedProductIds.includes(product.id) || selectedProductIds.includes(product.code)) {
      return;
    }
    setSelectedProductIds(prev => [...prev, product.id]);
    setHasUnsavedChanges(true);
    setPickerOpen(false);
  };

  const handleSaveDraft = () => {
    updateFeaturedProducts({
      mode,
      title,
      subtitle,
      displayLimit,
      productIds: selectedProductIds,
      status: 'draft',
    });
    setHasUnsavedChanges(false);
    setPublishSuccessMessage('Draft saved successfully to local operational store.');
    setTimeout(() => setPublishSuccessMessage(null), 3000);
  };

  const handlePublish = () => {
    updateFeaturedProducts({
      mode,
      title,
      subtitle,
      displayLimit,
      productIds: selectedProductIds,
      status: 'published',
    });
    setHasUnsavedChanges(false);
    setPublishSuccessMessage('Curation published live to customer storefront!');
    setTimeout(() => setPublishSuccessMessage(null), 3500);
  };

  // Filter products for the picker modal
  const filteredPickerProducts = PRODUCTS.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesCat = pickerCategory === 'All' || p.category === pickerCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Star className="w-3.5 h-3.5" />
            <span>Storefront Merchandising</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Featured Products Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Curate, reorder, and preview the high-converting &ldquo;Objects of Affection&rdquo; showcase on the homepage.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {publishSuccessMessage && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{publishSuccessMessage}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!canEdit}
            className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F0E9DF] text-[#372921] text-xs font-semibold transition-colors disabled:opacity-40"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish to Storefront</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have unsaved merchandising changes. Click &ldquo;Save as Draft&rdquo; or &ldquo;Publish to Storefront&rdquo; to apply them.</span>
          </div>
        </div>
      )}

      {/* 2. CURATION SETTINGS CARD */}
      <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
          <span className="font-serif text-base font-semibold text-[#372921]">
            Curator Settings &amp; Section Copy
          </span>
          <span className="text-[11px] font-mono text-[#76695F]">
            Status: <strong className="uppercase text-[#9E5430]">{featuredConfig.status}</strong> · Last edited:{' '}
            {new Date(featuredConfig.lastEdited).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Curation Mode */}
          <div>
            <label className="block text-xs font-semibold text-[#372921] mb-1">
              Curation Mode
            </label>
            <select
              value={mode}
              onChange={e => {
                setMode(e.target.value as any);
                setHasUnsavedChanges(true);
              }}
              disabled={!canEdit}
              className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            >
              <option value="manual">Manual Curation (Exact Hand-Picked Sequence)</option>
              <option value="auto-bestsellers">Automatic: Top Atelier Best Sellers</option>
              <option value="auto-new">Automatic: New Craft House Arrivals</option>
            </select>
            <span className="text-[10.5px] text-[#76695F] mt-1 block">
              Manual mode gives you absolute control over exact sequence and fallback.
            </span>
          </div>

          {/* Section Heading */}
          <div>
            <label className="block text-xs font-semibold text-[#372921] mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              disabled={!canEdit}
              className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            />
          </div>

          {/* Display Limit */}
          <div>
            <label className="block text-xs font-semibold text-[#372921] mb-1">
              Storefront Display Limit
            </label>
            <select
              value={displayLimit}
              onChange={e => {
                setDisplayLimit(Number(e.target.value));
                setHasUnsavedChanges(true);
              }}
              disabled={!canEdit}
              className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            >
              <option value="4">4 Pieces (Minimal Showcase)</option>
              <option value="6">6 Pieces (Recommended for Tablet)</option>
              <option value="8">8 Pieces (Full Flagship Rail)</option>
              <option value="12">12 Pieces (Extended Edition)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. CURATED ITEMS LIST & REORDERING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product List (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Curated Sequence ({curatedProducts.length} pieces selected)
              </h3>
              <p className="text-[11px] text-[#76695F]">
                Showing top {displayLimit} on storefront. Use arrows to re-sequence.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={!canEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="space-y-2">
            {curatedProducts.map((p, idx) => {
              const warning = getStockWarning(p.code);
              const isOverLimit = idx >= displayLimit;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isOverLimit
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-[#FFFCF7] border-[#DED3C5] hover:border-[#9E5430]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center font-mono text-xs font-bold text-[#76695F]">
                      {idx + 1}
                    </span>
                    <img
                      src={p.coverImage}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#DED3C5] shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[#372921] block truncate">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10.5px] text-[#76695F] font-mono mt-0.5">
                        <span>{p.code}</span>
                        <span>·</span>
                        <span>{p.category}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#372921]">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {warning && (
                        <span
                          className={`text-[9.5px] font-semibold px-2 py-0.2 rounded-full inline-flex items-center gap-1 mt-1 ${
                            warning.level === 'error'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{warning.text}</span>
                        </span>
                      )}
                      {isOverLimit && (
                        <span className="text-[9.5px] text-gray-500 italic block mt-0.5">
                          (Exceeds display limit of {displayLimit}; acts as fallback)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move Up/Down & Remove Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0 || !canEdit}
                      aria-label="Move piece up in sequence"
                      className="p-1.5 rounded hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === curatedProducts.length - 1 || !canEdit}
                      aria-label="Move piece down in sequence"
                      className="p-1.5 rounded hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      disabled={!canEdit}
                      aria-label="Remove piece from featured curation"
                      className="p-1.5 rounded hover:bg-rose-50 text-[#76695F] hover:text-rose-600 disabled:opacity-30 cursor-pointer ml-1"
                      title="Remove from featured list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Responsive Storefront Preview (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#9E5430]" />
              <span className="font-serif text-base font-semibold text-[#372921]">
                Live Storefront Preview
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center bg-[#F7F3EC] p-0.5 rounded-lg border border-[#DED3C5]">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                aria-label="Desktop preview mode"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-[#9E5430] shadow-xs'
                    : 'text-[#76695F] hover:text-[#372921]'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                aria-label="Mobile preview mode"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-[#9E5430] shadow-xs'
                    : 'text-[#76695F] hover:text-[#372921]'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Frame */}
          <div
            className={`mx-auto bg-[#F7F3EC] rounded-xl border border-[#DED3C5] p-4 transition-all overflow-hidden ${
              previewDevice === 'mobile' ? 'max-w-[340px]' : 'w-full'
            }`}
          >
            <div className="text-center mb-3">
              <span className="text-[10px] uppercase tracking-wider text-[#9E5430] font-sans font-bold block">
                Chapter 05 · {title}
              </span>
              <h4 className="font-serif text-base font-normal text-[#372921] tracking-tight">
                Objects of Affection. <span className="italic font-light text-[#9E5430]">Patiently Hand-Strung.</span>
              </h4>
            </div>

            {/* Preview Grid */}
            <div
              className={`grid gap-2.5 ${
                previewDevice === 'mobile' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-2'
              }`}
            >
              {curatedProducts.slice(0, displayLimit).map((item, i) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-2 border border-[#EAE2D8] text-center shadow-2xs group hover:border-[#9E5430] transition-colors"
                >
                  <div className="aspect-square rounded overflow-hidden bg-[#F0E9DF] mb-1.5">
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[10.5px] font-semibold text-[#372921] block truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-serif text-[#9E5430] font-bold block mt-0.5">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center pt-3 border-t border-[#DED3C5]/60 mt-3">
              <span className="text-[10px] uppercase tracking-wider text-[#9E5430] font-semibold">
                View All Handcrafted Creations →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRODUCT PICKER MODAL */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setPickerOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-[#EAE2D8] flex items-center justify-between bg-[#FFFCF7]">
                <h3 className="font-serif text-lg font-semibold text-[#372921]">
                  Add Product to Featured Rail
                </h3>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="p-1 text-[#76695F] hover:text-[#372921]"
                >
                  ✕
                </button>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-[#EAE2D8] flex flex-col sm:flex-row gap-3 bg-[#F7F3EC]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#76695F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    placeholder="Search by title, SKU..."
                    className="w-full bg-white border border-[#DED3C5] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#372921] focus:outline-none"
                  />
                </div>
                <select
                  value={pickerCategory}
                  onChange={e => setPickerCategory(e.target.value)}
                  className="bg-white border border-[#DED3C5] rounded-lg px-3 py-1.5 text-xs text-[#372921] focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Grid */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-2">
                {filteredPickerProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#76695F]">
                    No matching pieces found in catalogue.
                  </div>
                ) : (
                  filteredPickerProducts.map(p => {
                    const isAlreadySelected =
                      selectedProductIds.includes(p.id) || selectedProductIds.includes(p.code);

                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isAlreadySelected
                            ? 'bg-gray-50 border-gray-200 opacity-50'
                            : 'bg-white border-[#EAE2D8] hover:border-[#9E5430] cursor-pointer'
                        }`}
                        onClick={() => !isAlreadySelected && handleAddProduct(p)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.coverImage}
                            alt={p.name}
                            className="w-10 h-10 rounded object-cover border border-[#EAE2D8]"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-[#372921] block truncate">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[#76695F] font-mono">
                              {p.code} · {p.category} · ₹{p.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isAlreadySelected}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            isAlreadySelected
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-[#9E5430] hover:bg-[#874427] text-white cursor-pointer'
                          }`}
                        >
                          {isAlreadySelected ? 'Added' : 'Select'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

