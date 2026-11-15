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
  X,
  Eye,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { PRODUCTS, COLLECTIONS, Product, Collection } from '@/data/catalogue';
import {
  getFirestoreProducts,
  saveFirestoreProduct,
  deleteFirestoreProduct,
} from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface ReviewItem {
  id: string;
  patron: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'archived';
}

const SEED_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-01',
    patron: 'Ananya Deshmukh (Verified Buyer)',
    product: 'Vintage Pearl Beaded Evening Bag',
    rating: 5,
    comment: 'The beadwork is breathtaking. You can genuinely feel the hours of patient human craft in the tight, uniform weave.',
    date: '2026-11-10',
    status: 'pending',
  },
  {
    id: 'rev-02',
    patron: 'Meera Singhania (Verified Buyer)',
    product: 'Signature Pearl Beaded Vanity Box',
    rating: 5,
    comment: 'Sits like a sculpted treasure on my dresser. The 90-degree corners are so rigid and well tensioned.',
    date: '2026-11-09',
    status: 'pending',
  },
  {
    id: 'rev-03',
    patron: 'Kavita Chawla (Verified Buyer)',
    product: 'Colorful Beaded AirPod Case',
    rating: 5,
    comment: 'A whimsical jewel in my handbag! The snaps hold tight and the micro-beads sparkle wonderfully in natural light.',
    date: '2026-11-08',
    status: 'approved',
  },
  {
    id: 'rev-04',
    patron: 'Radhika Kothari (Verified Buyer)',
    product: 'Radiant Crystal Beaded Tealight Lantern',
    rating: 5,
    comment: 'Casts the most sublime geometric amber shadows across our dinner table. A true heritage conversation starter.',
    date: '2026-11-07',
    status: 'approved',
  },
];

export default function CatalogueView() {
  const { can, activeSubPage, setActiveSubPage, logAction, showModal } = useAdminStore();

  const activeTab: 'products' | 'collections' | 'reviews' =
    activeSubPage === 'catalogue.collections'
      ? 'collections'
      : activeSubPage === 'catalogue.reviews'
      ? 'reviews'
      : 'products';

  const handleTabClick = (tabId: string) => {
    const map: Record<string, string> = {
      products: 'catalogue.products',
      collections: 'catalogue.collections',
      reviews: 'catalogue.reviews',
    };
    setActiveSubPage(map[tabId] || 'catalogue.products');
  };

  // State
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [collections, setCollections] = useState<Collection[]>(COLLECTIONS);
  const [reviews, setReviews] = useState<ReviewItem[]>(SEED_REVIEWS);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [editCollectionModalOpen, setEditCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // New product form
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    category: 'Bags & Clutches',
    price: 3499,
    craftHours: '16 hours',
    materials: 'Glass seed beads, high-tensile wire',
    coverImage: '/products/bag1.png',
    description: 'Masterfully hand-threaded by artisan women in Bihar.',
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sync products from Cloud Firestore on mount
  React.useEffect(() => {
    getFirestoreProducts().then((liveProds) => {
      if (liveProds && liveProds.length > 0) {
        const codeSet = new Set(liveProds.map(p => p.code));
        const combined = [...liveProds, ...PRODUCTS.filter(p => !codeSet.has(p.code))];
        setProducts(combined);
      }
    }).catch(() => {});
  }, []);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const res = await uploadToCloudinary(file);
      if (res.secureUrl) {
        setNewProduct(prev => ({ ...prev, coverImage: res.secureUrl! }));
        showToast('Uploaded image to Cloudinary (kalajay/products)');
      } else if (res.error) {
        showModal({
          title: 'Upload Failed',
          message: res.error,
          icon: 'warning',
        });
      }
    } catch (err: any) {
      showModal({
        title: 'Upload Failed',
        message: err.message || 'Could not upload image to Cloudinary.',
        icon: 'warning',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const canEditCatalogue = can('catalogue.products', 'edit');
  const categories = ['All', ...collections.map(c => c.name)];

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.code) {
      showModal({
        title: 'Validation Incomplete',
        message: 'Please provide both a product title and SKU code before publishing to the boutique catalogue.',
        icon: 'warning',
      });
      return;
    }
    const slug = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productItem: Product = {
      id: `prod-${Date.now()}`,
      code: newProduct.code,
      name: newProduct.name,
      slug,
      category: newProduct.category,
      categorySlug: newProduct.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.price),
      images: [newProduct.coverImage],
      coverImage: newProduct.coverImage,
      dimensions: 'Custom handcrafted dimensions',
      inStock: true,
      isBestSeller: false,
      isFeatured: false,
      isNewArrival: true,
      craftHours: newProduct.craftHours,
      materials: newProduct.materials.split(',').map(m => m.trim()),
      variants: [],
      care: 'Keep dry. Wipe gently with soft cotton cloth.',
      description: newProduct.description,
    };

    setProducts(prev => [productItem, ...prev]);
    setAddModalOpen(false);
    saveFirestoreProduct(productItem).catch(() => {});
    logAction('CREATE_PRODUCT', 'catalogue', `Added new handcrafted piece: ${productItem.name} (${productItem.code})`);
    showToast(`Added "${productItem.name}" to the master product catalogue.`);
    setNewProduct({
      code: '',
      name: '',
      category: 'Bags & Clutches',
      price: 3499,
      craftHours: '16 hours',
      materials: 'Glass seed beads, high-tensile wire',
      coverImage: '/products/bag1.png',
      description: 'Masterfully hand-threaded by artisan women in Bihar.',
    });
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(prev => prev.map(p => (p.id === editingProduct.id ? editingProduct : p)));
    setEditProductModalOpen(false);
    saveFirestoreProduct(editingProduct).catch(() => {});
    logAction('UPDATE_PRODUCT', 'catalogue', `Updated details for: ${editingProduct.name} (${editingProduct.code})`);
    showToast(`Updated "${editingProduct.name}" specifications.`);
  };

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    const targetId = deletingProduct.id || deletingProduct.code;
    setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
    setDeleteProductModalOpen(false);
    deleteFirestoreProduct(targetId).catch(() => {});
    logAction('DELETE_PRODUCT', 'catalogue', `Archived piece: ${deletingProduct.name} (${deletingProduct.code})`);
    showToast(`Archived "${deletingProduct.name}" from storefront catalogue.`);
    setDeletingProduct(null);
  };

  const handleEditCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;
    setCollections(prev => prev.map(c => (c.slug === editingCollection.slug ? editingCollection : c)));
    setEditCollectionModalOpen(false);
    logAction('UPDATE_COLLECTION', 'catalogue', `Updated collection editorial: ${editingCollection.name}`);
    showToast(`Saved updates for Collection "${editingCollection.name}".`);
  };

  const handleReviewStatus = (reviewId: string, status: 'approved' | 'archived') => {
    setReviews(prev => prev.map(r => (r.id === reviewId ? { ...r, status } : r)));
    logAction('MODERATE_REVIEW', 'catalogue', `Set review ${reviewId} to ${status}`);
    showToast(`Review marked as ${status}.`);
  };

  const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 bg-[#372921] text-[#F7F3EC] px-4 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

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
          onClick={() => setAddModalOpen(true)}
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
          { id: 'products', label: `All Products (${products.length})` },
          { id: 'collections', label: `Collections (${collections.length})` },
          {
            id: 'reviews',
            label: `Review Moderation (${reviews.length})`,
            badge: pendingReviewsCount > 0 ? `${pendingReviewsCount} Pending` : undefined,
          },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                : 'text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF]/60'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[9px] font-bold">
                {tab.badge}
              </span>
            )}
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
                className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#76695F] font-semibold">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
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
                          {p.inStock ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct({ ...p });
                              setEditProductModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] transition-colors cursor-pointer"
                            title="Edit Piece Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded hover:bg-[#F0E9DF] text-[#9E5430] transition-colors"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingProduct(p);
                              setDeleteProductModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-rose-50 text-[#76695F] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Archive / Remove Piece"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {collections.map(col => (
            <div
              key={col.slug}
              className="bg-white rounded-2xl border border-[#DED3C5] overflow-hidden shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] bg-[#F0E9DF] overflow-hidden relative group">
                  <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCollection({ ...col });
                      setEditCollectionModalOpen(true);
                    }}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#372921] flex items-center gap-1 shadow-sm hover:bg-white"
                  >
                    <Edit2 className="w-3 h-3 text-[#9E5430]" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-serif text-lg font-semibold text-[#372921]">{col.name}</h3>
                  <p className="text-xs text-[#9E5430] italic font-serif">&ldquo;{col.tagline}&rdquo;</p>
                  <p className="text-xs text-[#76695F] line-clamp-3 mt-1 leading-relaxed">{col.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-[#EAE2D8] mt-2 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-[#76695F]">{col.slug}</span>
                <a
                  href={`/collections/${col.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#9E5430] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View Collection</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. REVIEWS MODERATION TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE2D8]">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Patron Reviews Moderation Queue
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Every review submitted through customer product pages is inspected here for authentic verified buyer credentials.
              </p>
            </div>
            <span className="text-xs font-mono text-[#76695F] bg-[#F7F3EC] px-3 py-1 rounded-full border border-[#DED3C5]">
              {pendingReviewsCount} Pending Verification
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map(r => (
              <div
                key={r.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  r.status === 'pending'
                    ? 'bg-[#FFFCF7] border-amber-200'
                    : r.status === 'approved'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-stone-50 border-stone-200 opacity-60'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-semibold text-[#372921]">{r.patron}</strong>
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span
                      className={`text-[9.5px] uppercase font-bold px-2 py-0.2 rounded-full font-mono ${
                        r.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9E5430] font-medium block">
                    Product: {r.product}
                  </span>
                  <p className="text-xs text-[#76695F] italic font-serif leading-relaxed">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                  <span className="text-[10px] text-[#A99583] font-mono block mt-1">{r.date}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {r.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleReviewStatus(r.id, 'approved')}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Approve &amp; Feature
                    </button>
                  )}
                  {r.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => handleReviewStatus(r.id, 'archived')}
                      className="px-3.5 py-1.5 rounded-full border border-[#DED3C5] bg-white text-xs text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF] transition-colors cursor-pointer"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD NEW HANDCRAFTED PIECE
          ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Atelier Formulation
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Add New Handcrafted Piece
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    SKU Code <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KJ-BAG-009"
                    value={newProduct.code}
                    onChange={e => setNewProduct(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Collection Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    {collections.map(c => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Product Title <span className="text-[#9E5430]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luminous Pearl Evening Minaudière"
                  value={newProduct.name}
                  onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newProduct.price}
                    onChange={e => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Craft Hours
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18 hours"
                    value={newProduct.craftHours}
                    onChange={e => setNewProduct(prev => ({ ...prev, craftHours: e.target.value }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Materials (comma separated)
                </label>
                <input
                  type="text"
                  value={newProduct.materials}
                  onChange={e => setNewProduct(prev => ({ ...prev, materials: e.target.value }))}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Cover Image URL / Path (or Upload to Cloudinary)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProduct.coverImage}
                    onChange={e => setNewProduct(prev => ({ ...prev, coverImage: e.target.value }))}
                    className="flex-1 bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    placeholder="https://... or upload image"
                  />
                  <label className="cursor-pointer px-3.5 py-2 bg-[#FAF7F2] border border-[#DED3C5] hover:border-[#9E5430] hover:text-[#9E5430] text-[#372921] rounded-xl text-xs font-medium flex items-center justify-center shrink-0 transition-colors">
                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Artisanal Story &amp; Description
                </label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Piece to Catalogue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT PRODUCT MODAL
          ========================================================================= */}
      {editProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Modify Piece
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Edit {editingProduct.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={e => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Retail Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Craft Hours</label>
                  <input
                    type="text"
                    value={editingProduct.craftHours}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, craftHours: e.target.value } : null)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={e => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  {collections.map(c => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={editingProduct.inStock}
                  onChange={e => setEditingProduct(prev => prev ? { ...prev, inStock: e.target.checked } : null)}
                  className="rounded text-[#9E5430] focus:ring-[#9E5430]"
                />
                <label htmlFor="inStockCheck" className="text-xs text-[#372921] font-medium cursor-pointer">
                  Published and available for customer orders on storefront
                </label>
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditProductModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DELETE PRODUCT MODAL
          ========================================================================= */}
      {deleteProductModalOpen && deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#372921]">
                Archive Handcrafted Piece?
              </h3>
              <p className="text-xs text-[#76695F]">
                Are you sure you want to archive <strong className="text-[#372921]">{deletingProduct.name}</strong> ({deletingProduct.code})? It will no longer appear in customer search.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteProductModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] text-xs font-semibold text-[#76695F]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Archive Piece
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: EDIT COLLECTION MODAL
          ========================================================================= */}
      {editCollectionModalOpen && editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Collection Editorial
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Edit Collection: {editingCollection.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditCollectionModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCollectionSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  value={editingCollection.name}
                  onChange={e => setEditingCollection(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Editorial Tagline</label>
                <input
                  type="text"
                  value={editingCollection.tagline}
                  onChange={e => setEditingCollection(prev => prev ? { ...prev, tagline: e.target.value } : null)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Description Story</label>
                <textarea
                  rows={3}
                  value={editingCollection.description}
                  onChange={e => setEditingCollection(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={editingCollection.image}
                  onChange={e => setEditingCollection(prev => prev ? { ...prev, image: e.target.value } : null)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditCollectionModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
