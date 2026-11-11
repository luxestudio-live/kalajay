'use client';

import React, { useState } from 'react';
import {
  LayoutTemplate,
  FileText,
  Megaphone,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  Globe,
  Edit2,
  Eye,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  Copy,
  ExternalLink,
  Smartphone,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { BannerItem } from '@/data/adminTypes';
import { ARTISAN_STORIES } from '@/data/extras';

const STOREFRONT_PAGES_INVENTORY = [
  { route: '/', name: 'Home Flagship', sections: 12, lastEdited: '2026-11-11', status: 'Published' },
  { route: '/shop', name: 'Shop All Pieces', sections: 4, lastEdited: '2026-11-10', status: 'Published' },
  { route: '/story', name: 'Our Story & Heritage', sections: 6, lastEdited: '2026-11-11', status: 'Published' },
  { route: '/atelier', name: 'The Craft House', sections: 5, lastEdited: '2026-11-09', status: 'Published' },
  { route: '/customise', name: 'Bespoke Studio', sections: 4, lastEdited: '2026-11-11', status: 'Published' },
  { route: '/gifting', name: 'Gifting Concierge', sections: 5, lastEdited: '2026-11-08', status: 'Published' },
  { route: '/corporate-gifting', name: 'Corporate & Wedding', sections: 5, lastEdited: '2026-11-07', status: 'Published' },
  { route: '/cart', name: 'Shopping Bag', sections: 3, lastEdited: '2026-11-11', status: 'Published' },
  { route: '/checkout', name: 'Checkout & Payment', sections: 3, lastEdited: '2026-11-11', status: 'Published' },
  { route: '/account', name: 'Patron Portal', sections: 5, lastEdited: '2026-11-10', status: 'Published' },
  { route: '/track', name: 'Live Order Tracking', sections: 3, lastEdited: '2026-11-11', status: 'Published' },
  { route: '/wishlist', name: 'Curated Wishlist', sections: 2, lastEdited: '2026-11-05', status: 'Published' },
  { route: '/contact', name: 'Contact & Studios', sections: 3, lastEdited: '2026-11-04', status: 'Published' },
  { route: '/faq', name: 'Frequently Asked Questions', sections: 4, lastEdited: '2026-11-06', status: 'Published' },
  { route: '/shipping-returns', name: 'Shipping & Returns Policy', sections: 3, lastEdited: '2026-11-06', status: 'Published' },
  { route: '/privacy', name: 'Privacy Policy', sections: 2, lastEdited: '2026-11-01', status: 'Published' },
  { route: '/terms', name: 'Terms of Service', sections: 2, lastEdited: '2026-11-01', status: 'Published' },
];

export default function CmsView() {
  const {
    homepageSections,
    updateHomepageSection,
    banners,
    updateBanner,
    createBanner,
    deleteBanner,
    activeSubPage,
    setActiveSubPage,
    can,
  } = useAdminStore();

  // Map activeSubPage to internal tab for two-way synchronization with sidebar
  const getTabFromSubPage = (sub: string): 'pages' | 'homepage' | 'banners' | 'media' | 'artisans' | 'policies' | 'seo' => {
    switch (sub) {
      case 'cms.banners':
        return 'banners';
      case 'cms.media':
        return 'media';
      case 'cms.story':
        return 'artisans';
      case 'cms.navigation':
        return 'pages';
      case 'cms.policies':
        return 'policies';
      case 'cms.seo':
        return 'seo';
      case 'cms.homepage':
      default:
        return 'homepage';
    }
  };

  const activeTab = getTabFromSubPage(activeSubPage);

  const handleTabClick = (tabId: string) => {
    const subMap: Record<string, string> = {
      homepage: 'cms.homepage',
      banners: 'cms.banners',
      media: 'cms.media',
      artisans: 'cms.story',
      pages: 'cms.navigation',
      policies: 'cms.policies',
      seo: 'cms.seo',
    };
    setActiveSubPage(subMap[tabId] || 'cms.homepage');
  };

  // Homepage Builder selected section for editing
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-hero');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // New Banner Modal state
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerText, setNewBannerText] = useState('');
  const [newBannerCtaText, setNewBannerCtaText] = useState('Explore');
  const [newBannerCtaUrl, setNewBannerCtaUrl] = useState('/shop');
  const [newBannerLoc, setNewBannerLoc] = useState<BannerItem['location']>('top-ticker');

  // Media Library state
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const canEditCms = can('cms.homepage', 'edit');
  const canPublishCms = can('cms.homepage', 'publish');

  const activeSection = homepageSections.find(s => s.id === selectedSectionId) || homepageSections[0];

  const handleFieldChange = (key: string, value: any) => {
    if (!canEditCms) return;
    updateHomepageSection(selectedSectionId, { [key]: value });
    setSaveToast('Section content updated in live operational store.');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    createBanner({
      title: newBannerTitle,
      text: newBannerText,
      ctaText: newBannerCtaText,
      ctaUrl: newBannerCtaUrl,
      location: newBannerLoc,
      priority: 5,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      isActive: true,
    });
    setBannerModalOpen(false);
    setNewBannerTitle('');
    setNewBannerText('');
  };

  const handleCopyUrl = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Structured Visual CMS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Website &amp; Content Management
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Edit storefront copy, hero showcases, announcement tickers, artisan stories, and legal policies.
          </p>
        </div>

        {saveToast && (
          <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{saveToast}</span>
          </span>
        )}
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#DED3C5] text-xs">
        {[
          { id: 'homepage', label: 'Homepage Builder', icon: LayoutTemplate },
          { id: 'pages', label: 'All Pages (17)', icon: FileText },
          { id: 'banners', label: 'Banners & Marquee', icon: Megaphone },
          { id: 'media', label: 'Media Library', icon: ImageIcon },
          { id: 'artisans', label: 'Our Story & Artisans', icon: BookOpen },
          { id: 'policies', label: 'FAQ & Policies', icon: HelpCircle },
          { id: 'seo', label: 'SEO & Metadata', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold shadow-2xs'
                  : 'text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF]/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: HOMEPAGE BUILDER (VISUAL SECTION EDITOR + PREVIEW) */}
      {activeTab === 'homepage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Section Selector & Field Editor (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Section Picker Pills */}
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#A99583] font-bold block mb-2">
                Select Storefront Section to Edit
              </span>
              <div className="flex flex-wrap gap-1.5">
                {homepageSections.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSectionId(s.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      s.id === selectedSectionId
                        ? 'bg-[#9E5430] text-white shadow-xs font-semibold'
                        : 'bg-[#F7F3EC] text-[#372921] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Field Inputs for Active Section */}
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#372921]">
                    {activeSection.name}
                  </h3>
                  <p className="text-[11px] text-[#76695F]">{activeSection.subtitle}</p>
                </div>
                <span className="text-[10px] font-mono text-[#76695F]">
                  Order #{activeSection.order}
                </span>
              </div>

              <div className="space-y-3.5">
                {Object.entries(activeSection.fields).map(([fieldKey, fieldValue]) => {
                  return (
                    <div key={fieldKey}>
                      <label className="block text-xs font-semibold text-[#372921] mb-1 capitalize">
                        {fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      {typeof fieldValue === 'string' && fieldValue.length > 60 ? (
                        <textarea
                          rows={3}
                          value={fieldValue}
                          disabled={!canEditCms}
                          onChange={e => handleFieldChange(fieldKey, e.target.value)}
                          className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] leading-relaxed"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(fieldValue)}
                          disabled={!canEditCms}
                          onChange={e => handleFieldChange(fieldKey, e.target.value)}
                          className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Live Responsive Preview (Span 5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#9E5430]" />
                <span className="font-serif text-base font-semibold text-[#372921]">
                  Live Visual Preview
                </span>
              </div>

              <div className="flex items-center bg-[#F7F3EC] p-0.5 rounded-lg border border-[#DED3C5]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md ${
                    previewDevice === 'desktop' ? 'bg-white text-[#9E5430] shadow-xs' : 'text-[#76695F]'
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md ${
                    previewDevice === 'mobile' ? 'bg-white text-[#9E5430] shadow-xs' : 'text-[#76695F]'
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Frame Output */}
            <div
              className={`mx-auto bg-[#F7F3EC] rounded-xl border border-[#DED3C5] p-5 text-center transition-all ${
                previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'
              }`}
            >
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-[#9E5430] font-sans font-bold block">
                  {String(activeSection.fields.chapterTag || activeSection.fields.badge || 'Kalajay Editorial')}
                </span>

                <h3 className="font-serif text-2xl text-[#372921] font-normal leading-tight">
                  {String(activeSection.fields.headline || activeSection.fields.heading || activeSection.fields.title || 'Section Heading')}
                </h3>

                <p className="font-serif italic text-xs text-[#76695F] leading-relaxed max-w-sm mx-auto">
                  &ldquo;{String(activeSection.fields.text || activeSection.fields.subheadline || activeSection.fields.subheading || '')}&rdquo;
                </p>

                {activeSection.fields.ctaText && (
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#372921] text-white text-[10.5px] font-semibold">
                      {String(activeSection.fields.ctaText)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#F0E9DF] rounded-xl text-[11px] text-[#76695F] flex items-center justify-between">
              <span>Previewing active draft</span>
              <span className="font-mono text-[#9E5430]">Instant Render</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: ALL PAGES INVENTORY */}
      {activeTab === 'pages' && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EAE2D8] flex items-center justify-between bg-[#FFFCF7]">
            <h3 className="font-serif text-base font-semibold text-[#372921]">
              Discovered Storefront Routes &amp; Content Mapping ({STOREFRONT_PAGES_INVENTORY.length})
            </h3>
            <span className="text-xs text-[#76695F]">
              Every customer-facing route mapped to an admin management seam
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Page Title &amp; Route</th>
                  <th className="py-3 px-4">Managed Sections</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Verified</th>
                  <th className="py-3 px-4 text-right">Storefront Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {STOREFRONT_PAGES_INVENTORY.map(page => (
                  <tr key={page.route} className="hover:bg-[#FFFCF7] transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-[#372921] font-semibold block">{page.name}</strong>
                      <span className="text-[10.5px] text-[#76695F] font-mono">{page.route}</span>
                    </td>
                    <td className="py-3 px-4 text-[#76695F]">
                      {page.sections} editable sections
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                        {page.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#76695F] font-mono text-[11px]">
                      {page.lastEdited}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={page.route}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#9E5430] hover:underline font-semibold"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: BANNERS & ANNOUNCEMENTS */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-[#372921]">
              Active Announcements &amp; Marquee Tickers ({banners.length})
            </h3>
            <button
              type="button"
              onClick={() => setBannerModalOpen(true)}
              disabled={!canEditCms}
              className="px-3.5 py-1.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map(banner => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase bg-[#F0E9DF] text-[#372921] px-2 py-0.5 rounded font-bold">
                      {banner.location}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateBanner(banner.id, { isActive: !banner.isActive })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        banner.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {banner.isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <h4 className="font-serif text-base font-semibold text-[#372921]">
                    {banner.title}
                  </h4>

                  <p className="text-xs text-[#76695F] leading-relaxed line-clamp-3">
                    {banner.text}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE2D8] flex items-center justify-between text-xs text-[#76695F]">
                  <span>CTA: {banner.ctaText} ({banner.ctaUrl})</span>
                  <button
                    type="button"
                    onClick={() => deleteBanner(banner.id)}
                    disabled={!canEditCms}
                    className="p-1 text-[#76695F] hover:text-rose-600 disabled:opacity-40"
                    title="Delete banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: MEDIA LIBRARY */}
      {activeTab === 'media' && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE2D8]">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Media Library &amp; Atelier Assets
              </h3>
              <p className="text-[11px] text-[#76695F]">
                Inspect asset dimensions, copy direct URLs, and upload photography mockups.
              </p>
            </div>

            <label className="px-3.5 py-1.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Simulate Asset Upload</span>
              <input type="file" className="hidden" onChange={() => alert('Demo Upload: Asset added to media index.')} />
            </label>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              {
                url: 'https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp',
                name: 'Signature Vanity Box (Hero)',
                dimensions: '1200 x 1200 px',
                size: '142 KB',
              },
              {
                url: 'https://www.kalajay.in/v2/p3-2.jpg',
                name: 'Vintage Evening Bag (Atelier)',
                dimensions: '1080 x 1350 px',
                size: '210 KB',
              },
              {
                url: 'https://www.kalajay.in/media/products/82de6afd08ff448280211f0bfcc8dde73ecbfa427b97749596ad38de44c9d763.webp',
                name: 'Crystal Tealight Lantern',
                dimensions: '1200 x 1200 px',
                size: '188 KB',
              },
              {
                url: 'https://www.kalajay.in/media/products/b57e3efd6e2f7c2f0bcac6be9aaf5e1b506ff561e72739f1c3041d6fbf4afe8b.webp',
                name: 'Luminous Envelope Clutch',
                dimensions: '1200 x 1200 px',
                size: '165 KB',
              },
            ].map(asset => (
              <div
                key={asset.url}
                className="rounded-xl border border-[#DED3C5] bg-[#FFFCF7] p-2.5 space-y-2 group hover:border-[#9E5430] transition-colors"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-[#F0E9DF] relative">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.url)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow text-[#372921] hover:text-[#9E5430] transition-colors"
                    title="Copy direct asset URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#372921] block truncate">
                    {asset.name}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-[#76695F] font-mono">
                    <span>{asset.dimensions}</span>
                    <span>{asset.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 5: OUR STORY & 21 ARTISANS */}
      {activeTab === 'artisans' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-3">
            <h3 className="font-serif text-lg font-semibold text-[#372921]">
              The 21 Women Master Artisans of Kalajay
            </h3>
            <p className="text-xs text-[#76695F] leading-relaxed">
              Kalajay is an artisanal sisterhood. Our production collective provides sustainable living wages, creative autonomy, and dignified livelihoods to 21 women makers in Bihar and Mumbai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ARTISAN_STORIES.map(artisan => (
              <div
                key={artisan.name}
                className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F0E9DF] border border-[#DED3C5] flex items-center justify-center font-serif text-[#9E5430] font-bold text-lg">
                    {artisan.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="font-serif text-base text-[#372921] block">
                      {artisan.name}
                    </strong>
                    <span className="text-xs text-[#9E5430] font-medium block">
                      {artisan.experience}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#76695F] leading-relaxed italic font-serif">
                  &ldquo;{artisan.quote}&rdquo;
                </p>

                <div className="pt-2 border-t border-[#EAE2D8] text-[11px] text-[#76695F]">
                  Location: <strong className="text-[#372921]">{artisan.location}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 6 & 7: POLICIES & SEO */}
      {(activeTab === 'policies' || activeTab === 'seo') && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#372921]">
            {activeTab === 'policies' ? 'Store Policies & FAQ Accordions' : 'Global SEO & Canonical Metadata'}
          </h3>
          <p className="text-xs text-[#76695F] leading-relaxed">
            Content managed here directly populates customer-facing <code>/faq</code>, <code>/shipping-returns</code>, and root metadata tags.
          </p>
          <div className="p-4 rounded-xl bg-[#F7F3EC] border border-[#DED3C5] text-xs text-[#372921] space-y-2">
            <span className="font-bold block">Configured Policies &amp; Thresholds:</span>
            <ul className="list-disc list-inside space-y-1 text-[#76695F]">
              <li>Free Pan-India Delivery: Orders above <strong>₹599</strong></li>
              <li>Dispatch Timeline: Handcrafted &amp; dispatched within <strong>48 hours</strong></li>
              <li>Transit Protection: 100% replacement guarantee for beads damaged in courier transit</li>
              <li>GST Exemption / Compliance: HSN Code 7018 / 7117 (Handcrafted Glass Beadworks)</li>
            </ul>
          </div>
        </div>
      )}

      {/* CREATE BANNER MODAL */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setBannerModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#DED3C5] p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#372921] pb-2 border-b border-[#EAE2D8]">
                Create Storefront Announcement
              </h3>
              <form onSubmit={handleCreateBanner} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">Title</label>
                  <input
                    type="text"
                    required
                    value={newBannerTitle}
                    onChange={e => setNewBannerTitle(e.target.value)}
                    placeholder="e.g. Diwali Festive Offer"
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">Announcement Copy</label>
                  <textarea
                    rows={2}
                    required
                    value={newBannerText}
                    onChange={e => setNewBannerText(e.target.value)}
                    placeholder="e.g. Complimentary gift packaging on all orders this week."
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">Display Location</label>
                  <select
                    value={newBannerLoc}
                    onChange={e => setNewBannerLoc(e.target.value as any)}
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                  >
                    <option value="top-ticker">Top Marquee Ticker</option>
                    <option value="hero-announcement">Hero Cover Announcement</option>
                    <option value="modal-popup">Modal Welcome Popup</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE2D8]">
                  <button
                    type="button"
                    onClick={() => setBannerModalOpen(false)}
                    className="px-4 py-1.5 rounded-full border border-[#DED3C5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-[#9E5430] text-white font-semibold"
                  >
                    Save Banner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

