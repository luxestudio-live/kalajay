'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Star,
  Trash2,
  Edit2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { PRODUCTS, COLLECTIONS, Product } from '@/data/catalogue';

export default function CatalogueView() {
  const { can } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'reviews'>('products');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const canEditCatalogue = can('catalogue.products', 'edit');

  const categories = ['All', ...COLLECTIONS.map(c => c.name)];

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>Merchandising &amp; Catalog</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Catalogue &amp; Products
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Manage Kalajay&apos;s handcrafted beaded creations, collections, dimensions, and customer reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('New product formulation flow: ERP sync integration active.')}
          disabled={!canEditCatalogue}
          className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Handcrafted Piece</span>
        </button>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs overflow-x-auto pb-1">
        {[
          { id: 'products', label: `All Products (${PRODUCTS.length})` },
          { id: 'collections', label: `Collections (${COLLECTIONS.length})` },
          { id: 'reviews', label: 'Review Moderation (8 Pending)' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                : 'text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF]/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-[#DED3C5] flex flex-wrap items-center gap-3 text-xs shadow-2xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#76695F] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products by title, SKU..."
                className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#372921] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#76695F] font-semibold">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Heirloom Piece</th>
                    <th className="py-3 px-4">Collection Category</th>
                    <th className="py-3 px-4">Materials &amp; Craft Hours</th>
                    <th className="py-3 px-4 text-right">Retail Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-[#FFFCF7] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.coverImage}
                            alt={p.name}
                            className="w-10 h-10 rounded object-cover border border-[#DED3C5]"
                          />
                          <div>
                            <strong className="text-[#372921] font-semibold block">{p.name}</strong>
                            <span className="text-[10.5px] text-[#76695F] font-mono">{p.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#76695F]">{p.category}</td>
                      <td className="py-3 px-4 text-[#76695F]">
                        <span className="block truncate max-w-[200px]">{p.materials.join(', ')}</span>
                        <span className="text-[10.5px] text-[#9E5430] font-mono">{p.craftHours}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-[#372921]">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase font-mono">
                          Published
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/products/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#9E5430] hover:underline font-semibold"
                        >
                          View ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. COLLECTIONS TAB */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLLECTIONS.map(col => (
            <div
              key={col.slug}
              className="bg-white rounded-2xl border border-[#DED3C5] overflow-hidden shadow-xs space-y-3"
            >
              <div className="aspect-[16/9] bg-[#F0E9DF] overflow-hidden">
                <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-serif text-lg font-semibold text-[#372921]">{col.name}</h3>
                <p className="text-xs text-[#9E5430] italic font-serif">&ldquo;{col.tagline}&rdquo;</p>
                <p className="text-xs text-[#76695F] line-clamp-2 mt-1">{col.description}</p>
                <div className="pt-3 border-t border-[#EAE2D8] flex items-center justify-between text-xs">
                  <span className="font-mono text-[#76695F]">{col.slug}</span>
                  <a
                    href={`/collections/${col.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#9E5430] font-semibold hover:underline"
                  >
                    View Collection ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. REVIEWS MODERATION TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-semibold text-[#372921]">
            Patron Reviews Moderation Queue
          </h3>
          <p className="text-xs text-[#76695F]">
            Every review submitted through customer product pages is inspected here for authentic verified buyer credentials.
          </p>
          <div className="space-y-3">
            {[
              {
                id: 'rev-01',
                patron: 'Ananya Deshmukh (Verified Buyer)',
                product: 'Vintage Pearl Beaded Evening Bag',
                rating: 5,
                comment: 'The beadwork is breathtaking. You can genuinely feel the hours of patient human craft in the tight, uniform weave.',
                date: '2026-11-10',
              },
              {
                id: 'rev-02',
                patron: 'Meera Singhania (Verified Buyer)',
                product: 'Signature Pearl Beaded Vanity Box',
                rating: 5,
                comment: 'Sits like a sculpted treasure on my dresser. The 90-degree corners are so rigid and well tensioned.',
                date: '2026-11-09',
              },
            ].map(r => (
              <div key={r.id} className="p-4 rounded-xl border border-[#EAE2D8] bg-[#FFFCF7] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-semibold text-[#372921]">{r.patron}</strong>
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#9E5430] font-medium block">
                    Product: {r.product}
                  </span>
                  <p className="text-xs text-[#76695F] italic font-serif leading-relaxed">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                  <span className="text-[10px] text-[#A99583] font-mono block mt-1">{r.date}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => alert('Review approved and featured on storefront.')}
                    className="px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Review archived.')}
                    className="px-3 py-1 rounded-full border border-[#DED3C5] text-xs text-[#76695F]"
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

