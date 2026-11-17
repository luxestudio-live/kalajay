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
  Image as ImageIcon,
  Tag,
  Sliders,
  Palette,
  FileText,
  Upload,
  Info,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { PRODUCTS, COLLECTIONS, Product, Collection, ProductVariant } from '@/data/catalogue';
import {
  getFirestoreProducts,
  saveFirestoreProduct,
  deleteFirestoreProduct,
  getFirestoreCategories,
  saveFirestoreCategory,
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

  type ModalTab = 'overview' | 'pricing' | 'variants' | 'media' | 'specs';

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState<ModalTab>('overview');
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [editModalTab, setEditModalTab] = useState<ModalTab>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [editCollectionModalOpen, setEditCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // New product form
  const INITIAL_NEW_PRODUCT = {
    code: '',
    name: '',
    category: 'Bags & Clutches',
    price: 3499,
    originalPrice: 3999,
    craftHours: '16 hours',
    materials: 'Glass seed beads, high-tensile wire',
    dimensions: '18 cm × 12 cm × 5 cm',
    care: 'Keep dry. Wipe gently with soft cotton cloth.',
    coverImage: '/products/bag1.png',
    images: ['/products/bag1.png'],
    description: 'Masterfully hand-threaded by artisan women in Bihar using Japanese micro-beads.',
    inStock: true,
    isBestSeller: false,
    isFeatured: false,
    isNewArrival: true,
    variants: [] as ProductVariant[],
  };
  const [newProduct, setNewProduct] = useState(INITIAL_NEW_PRODUCT);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sync products and collections from Cloud Firestore on mount
  React.useEffect(() => {
    getFirestoreProducts().then((liveProds) => {
      if (liveProds && liveProds.length > 0) {
        const codeSet = new Set(liveProds.map(p => p.code));
        const combined = [...liveProds, ...PRODUCTS.filter(p => !codeSet.has(p.code))];
        setProducts(combined);
      }
    }).catch(() => {});

    getFirestoreCategories().then((liveCats) => {
      if (liveCats && liveCats.length > 0) {
        const slugSet = new Set(liveCats.map(c => c.slug));
        const combined = [...liveCats, ...COLLECTIONS.filter(c => !slugSet.has(c.slug))];
        setCollections(combined);
      }
    }).catch(() => {});
  }, []);

  const uploadImageFile = async (file: File): Promise<string | null> => {
    setIsUploadingImage(true);
    try {
      const res = await uploadToCloudinary(file);
      if (res.secureUrl) {
        showToast('Uploaded image to Cloudinary (kalajay/products)');
        return res.secureUrl;
      } else if (res.error) {
        showModal({
          title: 'Upload Failed',
          message: res.error,
          icon: 'warning',
        });
        return null;
      }
      return null;
    } catch (err: any) {
      showModal({
        title: 'Upload Failed',
        message: err.message || 'Could not upload image to Cloudinary.',
        icon: 'warning',
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddVariantToEditing = () => {
    if (!editingProduct) return;
    const baseSku = editingProduct.code || 'KJ-VAR';
    const newVar: ProductVariant = {
      code: `${baseSku}-${(editingProduct.variants?.length || 0) + 1}`,
      label: '',
      price: editingProduct.price,
      inStock: true,
      image: editingProduct.coverImage || '',
    };
    setEditingProduct({
      ...editingProduct,
      variants: [...(editingProduct.variants || []), newVar],
    });
  };

  const handleUpdateEditingVariant = (idx: number, patch: Partial<ProductVariant>) => {
    if (!editingProduct) return;
    const next = [...(editingProduct.variants || [])];
    next[idx] = { ...next[idx], ...patch };
    setEditingProduct({ ...editingProduct, variants: next });
  };

  const handleRemoveEditingVariant = (idx: number) => {
    if (!editingProduct) return;
    const next = [...(editingProduct.variants || [])];
    next.splice(idx, 1);
    setEditingProduct({ ...editingProduct, variants: next });
  };

  const handleAddGalleryImageToEditing = (url: string) => {
    if (!editingProduct || !url.trim()) return;
    const trimmed = url.trim();
    if (editingProduct.images?.includes(trimmed)) return;
    const nextImages = [...(editingProduct.images || []), trimmed];
    setEditingProduct({
      ...editingProduct,
      images: nextImages,
    });
  };

  const handleRemoveGalleryImageFromEditing = (idx: number) => {
    if (!editingProduct) return;
    const next = [...(editingProduct.images || [])];
    next.splice(idx, 1);
    setEditingProduct({
      ...editingProduct,
      images: next,
      coverImage: next.length > 0 && !next.includes(editingProduct.coverImage) ? next[0] : editingProduct.coverImage,
    });
  };

  const handleAddNewProductVariant = () => {
    const baseSku = newProduct.code.trim() || 'KJ-NEW';
    const newVar: ProductVariant = {
      code: `${baseSku}-${newProduct.variants.length + 1}`,
      label: '',
      price: Number(newProduct.price) || 0,
      inStock: true,
      image: newProduct.coverImage || '',
    };
    setNewProduct(prev => ({
      ...prev,
      variants: [...prev.variants, newVar],
    }));
  };

  const handleUpdateNewProductVariant = (idx: number, patch: Partial<ProductVariant>) => {
    setNewProduct(prev => {
      const next = [...prev.variants];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, variants: next };
    });
  };

  const handleRemoveNewProductVariant = (idx: number) => {
    setNewProduct(prev => {
      const next = [...prev.variants];
      next.splice(idx, 1);
      return { ...prev, variants: next };
    });
  };

  const handleAddGalleryImageToNewProduct = (url: string) => {
    if (!url.trim()) return;
    const trimmed = url.trim();
    setNewProduct(prev => {
      if (prev.images.includes(trimmed)) return prev;
      return { ...prev, images: [...prev.images, trimmed] };
    });
  };

  const handleRemoveGalleryImageFromNewProduct = (idx: number) => {
    setNewProduct(prev => {
      const next = [...prev.images];
      next.splice(idx, 1);
      return {
        ...prev,
        images: next,
        coverImage: next.length > 0 && !next.includes(prev.coverImage) ? next[0] : prev.coverImage,
      };
    });
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
    const foundCat = collections.find(c => c.name === newProduct.category);
    const productItem: Product = {
      id: `prod-${Date.now()}`,
      code: newProduct.code.trim().toUpperCase(),
      name: newProduct.name.trim(),
      slug,
      category: newProduct.category,
      categorySlug: foundCat?.slug || newProduct.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: Number(newProduct.price) || 0,
      originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price) || 0,
      images: newProduct.images.length > 0 ? newProduct.images : [newProduct.coverImage || '/products/bag1.png'],
      coverImage: newProduct.coverImage || newProduct.images[0] || '/products/bag1.png',
      dimensions: newProduct.dimensions || 'Custom handcrafted dimensions',
      inStock: newProduct.inStock,
      isBestSeller: newProduct.isBestSeller,
      isFeatured: newProduct.isFeatured,
      isNewArrival: newProduct.isNewArrival,
      craftHours: newProduct.craftHours,
      materials: typeof newProduct.materials === 'string'
        ? newProduct.materials.split(',').map(m => m.trim()).filter(Boolean)
        : newProduct.materials,
      variants: newProduct.variants,
      care: newProduct.care,
      description: newProduct.description,
      status: newProduct.inStock ? 'active' : 'inactive',
      isActive: newProduct.inStock,
      active: newProduct.inStock,
    };

    setProducts(prev => [productItem, ...prev]);
    setAddModalOpen(false);
    saveFirestoreProduct(productItem).catch(() => {});
    logAction('CREATE_PRODUCT', 'catalogue', `Added new handcrafted piece: ${productItem.name} (${productItem.code}) with ${productItem.variants.length} variants`);
    showToast(`Added "${productItem.name}" to the master product catalogue.`);
    setNewProduct(INITIAL_NEW_PRODUCT);
    setAddModalTab('overview');
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated: Product = {
      ...editingProduct,
      code: editingProduct.code.trim().toUpperCase(),
      name: editingProduct.name.trim(),
      price: Number(editingProduct.price) || 0,
      originalPrice: Number(editingProduct.originalPrice) || Number(editingProduct.price) || 0,
      coverImage: editingProduct.coverImage || editingProduct.images?.[0] || '/products/bag1.png',
      images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [editingProduct.coverImage || '/products/bag1.png'],
      materials: Array.isArray(editingProduct.materials)
        ? editingProduct.materials
        : (typeof (editingProduct as any).materials === 'string' ? (editingProduct as any).materials.split(',').map((m: string) => m.trim()).filter(Boolean) : []),
      variants: editingProduct.variants || [],
      status: editingProduct.inStock ? 'active' : 'inactive',
      isActive: editingProduct.inStock,
      active: editingProduct.inStock,
    };
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setEditProductModalOpen(false);
    saveFirestoreProduct(updated).catch(() => {});
    logAction('UPDATE_PRODUCT', 'catalogue', `Updated details for: ${updated.name} (${updated.code}) with ${updated.variants?.length || 0} variants`);
    showToast(`Updated "${updated.name}" specifications.`);
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
    saveFirestoreCategory(editingCollection).catch(() => {});
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
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10.5px] text-[#76695F] font-mono">{p.code}</span>
                              {p.variants && p.variants.length > 0 && (
                                <span className="text-[10px] bg-[#9E5430]/10 text-[#9E5430] font-mono px-1.5 py-0.2 rounded-full font-semibold">
                                  {p.variants.length} {p.variants.length === 1 ? 'variant' : 'variants'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#76695F]">{p.category}</td>
                      <td className="py-3 px-4 text-[#76695F]">
                        <span className="block truncate max-w-[200px]">
                          {Array.isArray(p.materials) ? p.materials.join(', ') : (p.materials || '')}
                        </span>
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
                              setEditingProduct({
                                ...p,
                                variants: Array.isArray(p.variants) ? p.variants.map(v => ({ ...v })) : [],
                                images: Array.isArray(p.images) && p.images.length > 0 ? [...p.images] : (p.coverImage ? [p.coverImage] : []),
                                materials: Array.isArray(p.materials) ? [...p.materials] : (typeof (p as any).materials === 'string' ? [(p as any).materials] : []),
                                dimensions: p.dimensions || '',
                                craftHours: p.craftHours || '',
                                care: p.care || 'Keep dry. Wipe gently with soft cotton cloth.',
                                description: p.description || '',
                                originalPrice: p.originalPrice || p.price,
                                inStock: p.inStock ?? true,
                                isBestSeller: p.isBestSeller ?? false,
                                isFeatured: p.isFeatured ?? false,
                                isNewArrival: p.isNewArrival ?? false,
                              });
                              setEditModalTab('overview');
                              setEditProductModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] transition-colors cursor-pointer"
                            title="Edit Piece Details & Variants"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Atelier Formulation &middot; New Piece
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#372921] mt-0.5">
                  Add New Handcrafted Piece
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 px-6 pt-2 pb-0 bg-[#F7F3EC] border-b border-[#EAE2D8] overflow-x-auto text-xs shrink-0">
              <button
                type="button"
                onClick={() => setAddModalTab('overview')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  addModalTab === 'overview'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Overview &amp; Story</span>
              </button>
              <button
                type="button"
                onClick={() => setAddModalTab('pricing')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  addModalTab === 'pricing'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Pricing &amp; Merchandising</span>
              </button>
              <button
                type="button"
                onClick={() => setAddModalTab('variants')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  addModalTab === 'variants'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Variants &amp; Finishes</span>
                {newProduct.variants.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#9E5430]/15 text-[#9E5430] font-bold">
                    {newProduct.variants.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setAddModalTab('media')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  addModalTab === 'media'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media &amp; Gallery</span>
                {newProduct.images.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#9E5430]/15 text-[#9E5430] font-bold">
                    {newProduct.images.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setAddModalTab('specs')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  addModalTab === 'specs'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Craft Specs</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="createProductForm" onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs space-y-4">
              {/* TAB 1: OVERVIEW */}
              {addModalTab === 'overview' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <p className="text-[10.5px] text-[#76695F] mt-1">Unique stock unit code (alphanumeric)</p>
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

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Craft Duration / Hours
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 18 hours"
                      value={newProduct.craftHours}
                      onChange={e => setNewProduct(prev => ({ ...prev, craftHours: e.target.value }))}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#372921]">
                        Artisanal Story &amp; Editorial Description
                      </label>
                      <span className="text-[10px] text-[#76695F]">
                        {newProduct.description.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={newProduct.description}
                      onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] leading-relaxed focus:outline-none focus:border-[#9E5430]"
                      placeholder="Describe the handcrafted heritage, beadwork technique, artisan origins, and tactile beauty of this piece. This copy appears on the storefront product detail page."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & FLAGS */}
              {addModalTab === 'pricing' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#372921] mb-1">
                        Retail Selling Price (₹) <span className="text-[#9E5430]">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newProduct.price}
                        onChange={e => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                      <p className="text-[10.5px] text-[#76695F] mt-1">Inclusive of GST. Customer pays this amount at checkout.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#372921] mb-1">
                        Compare-at MRP Price (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newProduct.originalPrice}
                        onChange={e => setNewProduct(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                        className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                      <p className="text-[10.5px] text-[#76695F] mt-1">If higher than selling price, displays strikethrough original price.</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E5430] mb-3">
                      Merchandising &amp; Storefront Placement
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-start gap-3 p-3 bg-white border border-[#DED3C5] rounded-xl cursor-pointer hover:border-[#9E5430] transition-colors">
                        <input
                          type="checkbox"
                          checked={newProduct.inStock}
                          onChange={e => setNewProduct(prev => ({ ...prev, inStock: e.target.checked }))}
                          className="mt-0.5 rounded text-[#9E5430] focus:ring-[#9E5430]"
                        />
                        <div>
                          <span className="font-semibold text-[#372921] block">Published &amp; Active</span>
                          <span className="text-[11px] text-[#76695F]">Piece is visible and available for checkout on website</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white border border-[#DED3C5] rounded-xl cursor-pointer hover:border-[#9E5430] transition-colors">
                        <input
                          type="checkbox"
                          checked={newProduct.isFeatured}
                          onChange={e => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                          className="mt-0.5 rounded text-[#9E5430] focus:ring-[#9E5430]"
                        />
                        <div>
                          <span className="font-semibold text-[#372921] block">Featured Masterpiece</span>
                          <span className="text-[11px] text-[#76695F]">Showcased in homepage featured carousel</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white border border-[#DED3C5] rounded-xl cursor-pointer hover:border-[#9E5430] transition-colors">
                        <input
                          type="checkbox"
                          checked={newProduct.isBestSeller}
                          onChange={e => setNewProduct(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                          className="mt-0.5 rounded text-[#9E5430] focus:ring-[#9E5430]"
                        />
                        <div>
                          <span className="font-semibold text-[#372921] block">Best Seller Badge</span>
                          <span className="text-[11px] text-[#76695F]">Displays Best Seller badge on product cards</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white border border-[#DED3C5] rounded-xl cursor-pointer hover:border-[#9E5430] transition-colors">
                        <input
                          type="checkbox"
                          checked={newProduct.isNewArrival}
                          onChange={e => setNewProduct(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                          className="mt-0.5 rounded text-[#9E5430] focus:ring-[#9E5430]"
                        />
                        <div>
                          <span className="font-semibold text-[#372921] block">New Arrival Badge</span>
                          <span className="text-[11px] text-[#76695F]">Marks piece with New Arrival ribbon</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VARIANTS & FINISHES */}
              {addModalTab === 'variants' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-xl text-xs text-[#76695F] flex items-start gap-2.5">
                    <Palette className="w-4 h-4 text-[#9E5430] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-[#372921] block font-semibold">Storefront Colorways &amp; Finish Options</strong>
                      Shoppers on the Product Detail Page can select between these finishes. Each variant can have its own price, SKU, stock status, and photo preview.
                    </div>
                  </div>

                  {newProduct.variants.length === 0 ? (
                    <div className="text-center py-8 px-4 border border-dashed border-[#DED3C5] rounded-xl bg-white/50 space-y-2">
                      <p className="text-xs text-[#76695F]">No variants configured. This piece is currently sold as a single standard finish.</p>
                      <button
                        type="button"
                        onClick={handleAddNewProductVariant}
                        className="px-4 py-2 rounded-full bg-[#9E5430]/10 hover:bg-[#9E5430]/20 text-[#9E5430] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Variant / Colorway</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {newProduct.variants.map((variant, idx) => (
                        <div key={idx} className="p-4 bg-white border border-[#DED3C5] rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D8]">
                            <span className="font-mono text-[11px] font-bold text-[#9E5430] uppercase">
                              Variant #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNewProductVariant(idx)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Remove variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                                Variant Label / Finish <span className="text-[#9E5430]">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Ivory Pearl & 24K Gold"
                                value={variant.label}
                                onChange={e => handleUpdateNewProductVariant(idx, { label: e.target.value })}
                                className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                                Variant SKU Code
                              </label>
                              <input
                                type="text"
                                value={variant.code}
                                onChange={e => handleUpdateNewProductVariant(idx, { code: e.target.value.toUpperCase() })}
                                className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                                Variant Price (₹)
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={variant.price}
                                onChange={e => handleUpdateNewProductVariant(idx, { price: Number(e.target.value) })}
                                className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                                Variant Photo URL
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="https://... or upload photo"
                                  value={variant.image}
                                  onChange={e => handleUpdateNewProductVariant(idx, { image: e.target.value })}
                                  className="flex-1 bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                                />
                                <label className="cursor-pointer px-2.5 py-1.5 bg-[#FAF7F2] border border-[#DED3C5] hover:border-[#9E5430] hover:text-[#9E5430] text-[#372921] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0">
                                  <Upload className="w-3 h-3" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async e => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = await uploadImageFile(file);
                                        if (url) handleUpdateNewProductVariant(idx, { image: url });
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {variant.image ? (
                                <img
                                  src={variant.image}
                                  alt={variant.label || 'Variant preview'}
                                  className="w-10 h-10 object-cover rounded-lg border border-[#DED3C5] shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg border border-dashed border-[#DED3C5] flex items-center justify-center text-[#76695F] shrink-0">
                                  <ImageIcon className="w-4 h-4 opacity-40" />
                                </div>
                              )}
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#372921]">
                                <input
                                  type="checkbox"
                                  checked={variant.inStock}
                                  onChange={e => handleUpdateNewProductVariant(idx, { inStock: e.target.checked })}
                                  className="rounded text-[#9E5430] focus:ring-[#9E5430]"
                                />
                                <span>In Stock</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddNewProductVariant}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#DED3C5] hover:border-[#9E5430] text-[#76695F] hover:text-[#9E5430] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors bg-white/40"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Another Colorway / Variant</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MEDIA & GALLERY */}
              {addModalTab === 'media' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Primary Storefront Cover Image <span className="text-[#9E5430]">*</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        value={newProduct.coverImage}
                        onChange={e => {
                          const url = e.target.value;
                          setNewProduct(prev => ({
                            ...prev,
                            coverImage: url,
                            images: prev.images.includes(url) ? prev.images : [url, ...prev.images],
                          }));
                        }}
                        className="flex-1 bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                        placeholder="https://... or upload image"
                      />
                      <label className="cursor-pointer px-3.5 py-2 bg-[#FAF7F2] border border-[#DED3C5] hover:border-[#9E5430] hover:text-[#9E5430] text-[#372921] rounded-xl text-xs font-medium flex items-center justify-center shrink-0 transition-colors">
                        {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImageFile(file);
                              if (url) {
                                setNewProduct(prev => ({
                                  ...prev,
                                  coverImage: url,
                                  images: prev.images.includes(url) ? prev.images : [url, ...prev.images],
                                }));
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    {newProduct.coverImage && (
                      <div className="flex items-center gap-3 p-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-xl">
                        <img
                          src={newProduct.coverImage}
                          alt="Cover preview"
                          className="w-16 h-16 object-cover rounded-lg border border-[#DED3C5]"
                        />
                        <div className="text-xs text-[#76695F]">
                          <span className="font-semibold text-[#372921] block">Primary Cover Preview</span>
                          <span className="text-[11px] truncate block max-w-md">{newProduct.coverImage}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#EAE2D8]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-xs font-bold text-[#372921]">Product Gallery Images</h4>
                        <p className="text-[11px] text-[#76695F]">Close-ups of bead tension, interior lining, and angles on PDP.</p>
                      </div>
                      <label className="cursor-pointer px-3 py-1.5 bg-[#9E5430]/10 hover:bg-[#9E5430]/20 text-[#9E5430] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Add Photo via Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImageFile(file);
                              if (url) handleAddGalleryImageToNewProduct(url);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {newProduct.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group bg-white border border-[#DED3C5] rounded-xl p-2 space-y-1.5">
                          <div className="aspect-square bg-[#FAF7F2] rounded-lg overflow-hidden border border-[#EAE2D8]">
                            <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#76695F]">
                              {idx === 0 ? '★ Cover' : `#${idx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImageFromNewProduct(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              title="Remove from gallery"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CRAFT SPECS */}
              {addModalTab === 'specs' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Materials &amp; Composition
                    </label>
                    <input
                      type="text"
                      value={newProduct.materials}
                      onChange={e => setNewProduct(prev => ({ ...prev, materials: e.target.value }))}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      placeholder="e.g. Japanese Miyuki glass beads, 24K gold-plated lock, raw silk lining"
                    />
                    <p className="text-[10.5px] text-[#76695F] mt-1">Separate materials with commas.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Dimensions &amp; Sizing
                    </label>
                    <input
                      type="text"
                      value={newProduct.dimensions}
                      onChange={e => setNewProduct(prev => ({ ...prev, dimensions: e.target.value }))}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      placeholder="e.g. 18 cm (L) × 12 cm (H) × 6 cm (W); 55 cm detachable chain"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Artisanal Care &amp; Preservation Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={newProduct.care}
                      onChange={e => setNewProduct(prev => ({ ...prev, care: e.target.value }))}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] leading-relaxed focus:outline-none focus:border-[#9E5430]"
                      placeholder="e.g. Store in provided raw silk dust bag. Avoid water, perfume, and abrasive friction. Wipe gently with dry microfiber cloth."
                    />
                  </div>
                </div>
              )}
            </form>

            {/* Sticky Footer */}
            <div className="px-6 py-3.5 border-t border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] text-xs font-semibold text-[#76695F] hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="createProductForm"
                className="px-5 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Piece to Catalogue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT PRODUCT MODAL
          ========================================================================= */}
      {editProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Piece Merchandising &middot; {editingProduct.code}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#372921] mt-0.5 truncate max-w-md sm:max-w-xl">
                  Edit: {editingProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 px-6 pt-2 pb-0 bg-[#F7F3EC] border-b border-[#EAE2D8] overflow-x-auto text-xs shrink-0">
              <button
                type="button"
                onClick={() => setEditModalTab('overview')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  editModalTab === 'overview'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Overview &amp; Story</span>
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('pricing')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  editModalTab === 'pricing'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Pricing &amp; Merchandising</span>
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('variants')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  editModalTab === 'variants'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Variants &amp; Finishes</span>
                {editingProduct.variants && editingProduct.variants.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#9E5430]/15 text-[#9E5430] font-bold">
                    {editingProduct.variants.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('media')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  editModalTab === 'media'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media &amp; Gallery</span>
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#9E5430]/15 text-[#9E5430] font-bold">
                    {editingProduct.images.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('specs')}
                className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  editModalTab === 'specs'
                    ? 'border-[#9E5430] text-[#9E5430] font-semibold'
                    : 'border-transparent text-[#76695F] hover:text-[#372921]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Craft Specs</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="editProductForm" onSubmit={handleEditProductSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs space-y-4">
              {/* TAB 1: OVERVIEW */}
              {editModalTab === 'overview' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#372921] mb-1">
                        SKU Code <span className="text-[#9E5430]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.code}
                        onChange={e => setEditingProduct(prev => prev ? { ...prev, code: e.target.value.toUpperCase() } : null)}
                        className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                      <p className="text-[10.5px] text-[#76695F] mt-1">Unique stock unit code</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#372921] mb-1">
                        Collection Category
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={e => {
                          const cat = e.target.value;
                          const found = collections.find(c => c.name === cat);
                          setEditingProduct(prev => prev ? {
                            ...prev,
                            category: cat,
                            categorySlug: found?.slug || cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                          } : null);
                        }}
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
                      value={editingProduct.name}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Craft Duration / Hours
                    </label>
                    <input
                      type="text"
                      value={editingProduct.craftHours}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, craftHours: e.target.value } : null)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      placeholder="e.g. 18 hours"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#372921]">
                        Artisanal Story &amp; Editorial Description
                      </label>
                      <span className="text-[10px] text-[#76695F]">
                        {editingProduct.description?.length || 0} characters
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={editingProduct.description}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] leading-relaxed focus:outline-none focus:border-[#9E5430]"
                      placeholder="Describe the handcrafted heritage, beadwork technique, artisan origins, and tactile beauty of this piece. This copy appears on the storefront product detail page."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & FLAGS */}
              {editModalTab === 'pricing' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#372921] mb-1">
                        Retail Selling Price (₹) <span className="text-[#9E5430]">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editingProduct.price}
                        onChange={e => setEditingProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                        className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                      <p className="text-[10.5px] text-[#76695F] mt-1">Inclusive of GST. Customer pays this amount at checkout.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#372921] mb-1">
                        Compare-at MRP Price (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editingProduct.originalPrice || editingProduct.price}
                        onChange={e => setEditingProduct(prev => prev ? { ...prev, originalPrice: Number(e.target.value) } : null)}
                        className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                      <p className="text-[10.5px] text-[#76695F] mt-1">If higher than selling price, displays strikethrough original price.</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E5430] mb-3">
                      Merchandising &amp; Storefront Placement
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-start gap-3 p-3 bg-white border border-[#DED3C5] rounded-xl cursor-pointer hover:border-[#9E5430] transition-colors">
                        <input
                          type="checkbox"
                          checked={editingProduct.inStock}
                          onChange={e => setEditingProduct(prev => prev ? { ...prev, inStock: e.target.checked } : null)}
                          className="mt-0.5 rounded text-[#9E5430] focus:ring-[#9E5430]"
                        />
                        <div>
                          <span className="font-semibold text-[#372921] block">Published &amp; Active</span>
                          <span className="text-[11px] text-[#76695F]">Piece is visible and available for checkout on website</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white border border-[#DED3C5] rounded-xl cursor-pointer hover:border-[#9E5430] transition-colors">
                        <input
                          type="checkbox"
                          checked={editingProduct.isFeatured}
                          onChange={e => setEditingProduct(prev => prev ? { ...prev, isFeatured: e.target.checked } : null)}
                          className="mt-0.5 rounded text-[#9E5430] focus:ring-[#9E5430]"
                        />
                        <div>
                          <span className="font-semibold text-[#372921] block">Featured Masterpiece</span>
                          <span className="text-[11px] text-[#76695F]">Showcased on homepage featured carousel</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white border border-[#DED3C5] rounded-xl cursor-pointer hover:border-[#9E5430] transition-colors">
                        <input
                          type="checkbox"
                          checked={editingProduct.isBestSeller}
                          onChange={e => setEditingProduct(prev => prev ? { ...prev, isBestSeller: e.target.checked } : null)}
                          className="mt-0.5 rounded text-[#9E5430] focus:ring-[#9E5430]"
                        />
                        <div>
                          <span className="font-semibold text-[#372921] block">Best Seller Badge</span>
                          <span className="text-[11px] text-[#76695F]">Displays Best Seller badge across listings</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white border border-[#DED3C5] rounded-xl cursor-pointer hover:border-[#9E5430] transition-colors">
                        <input
                          type="checkbox"
                          checked={editingProduct.isNewArrival}
                          onChange={e => setEditingProduct(prev => prev ? { ...prev, isNewArrival: e.target.checked } : null)}
                          className="mt-0.5 rounded text-[#9E5430] focus:ring-[#9E5430]"
                        />
                        <div>
                          <span className="font-semibold text-[#372921] block">New Arrival Badge</span>
                          <span className="text-[11px] text-[#76695F]">Promotes piece under New Arrivals</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VARIANTS & FINISHES */}
              {editModalTab === 'variants' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-xl text-xs text-[#76695F] flex items-start gap-2.5">
                    <Palette className="w-4 h-4 text-[#9E5430] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-[#372921] block font-semibold">Storefront Colorways &amp; Finish Options</strong>
                      Shoppers on the Product Detail Page can select between these finishes. Each variant can have its own price, SKU, stock status, and photo preview.
                    </div>
                  </div>

                  {(!editingProduct.variants || editingProduct.variants.length === 0) ? (
                    <div className="text-center py-8 px-4 border border-dashed border-[#DED3C5] rounded-xl bg-white/50 space-y-2">
                      <p className="text-xs text-[#76695F]">No variants configured yet. This creation is sold as a single standard finish.</p>
                      <button
                        type="button"
                        onClick={handleAddVariantToEditing}
                        className="px-4 py-2 rounded-full bg-[#9E5430]/10 hover:bg-[#9E5430]/20 text-[#9E5430] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Variant / Colorway</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editingProduct.variants.map((variant, idx) => (
                        <div key={idx} className="p-4 bg-white border border-[#DED3C5] rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D8]">
                            <span className="font-mono text-[11px] font-bold text-[#9E5430] uppercase">
                              Variant #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEditingVariant(idx)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Remove variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                                Variant Label / Finish <span className="text-[#9E5430]">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Ivory Pearl & 24K Gold"
                                value={variant.label}
                                onChange={e => handleUpdateEditingVariant(idx, { label: e.target.value })}
                                className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                                Variant SKU Code
                              </label>
                              <input
                                type="text"
                                value={variant.code}
                                onChange={e => handleUpdateEditingVariant(idx, { code: e.target.value.toUpperCase() })}
                                className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                                Variant Price (₹)
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={variant.price}
                                onChange={e => handleUpdateEditingVariant(idx, { price: Number(e.target.value) })}
                                className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                                Variant Photo URL
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="https://... or upload photo"
                                  value={variant.image}
                                  onChange={e => handleUpdateEditingVariant(idx, { image: e.target.value })}
                                  className="flex-1 bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                                />
                                <label className="cursor-pointer px-2.5 py-1.5 bg-[#FAF7F2] border border-[#DED3C5] hover:border-[#9E5430] hover:text-[#9E5430] text-[#372921] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0">
                                  <Upload className="w-3 h-3" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async e => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = await uploadImageFile(file);
                                        if (url) handleUpdateEditingVariant(idx, { image: url });
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {variant.image ? (
                                <img
                                  src={variant.image}
                                  alt={variant.label || 'Variant preview'}
                                  className="w-10 h-10 object-cover rounded-lg border border-[#DED3C5] shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg border border-dashed border-[#DED3C5] flex items-center justify-center text-[#76695F] shrink-0">
                                  <ImageIcon className="w-4 h-4 opacity-40" />
                                </div>
                              )}
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#372921]">
                                <input
                                  type="checkbox"
                                  checked={variant.inStock}
                                  onChange={e => handleUpdateEditingVariant(idx, { inStock: e.target.checked })}
                                  className="rounded text-[#9E5430] focus:ring-[#9E5430]"
                                />
                                <span>In Stock</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddVariantToEditing}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#DED3C5] hover:border-[#9E5430] text-[#76695F] hover:text-[#9E5430] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors bg-white/40"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Another Colorway / Variant</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MEDIA & GALLERY */}
              {editModalTab === 'media' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Primary Storefront Cover Image <span className="text-[#9E5430]">*</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        value={editingProduct.coverImage}
                        onChange={e => {
                          const url = e.target.value;
                          setEditingProduct(prev => prev ? {
                            ...prev,
                            coverImage: url,
                            images: prev.images.includes(url) ? prev.images : [url, ...prev.images],
                          } : null);
                        }}
                        className="flex-1 bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                        placeholder="https://... or upload image"
                      />
                      <label className="cursor-pointer px-3.5 py-2 bg-[#FAF7F2] border border-[#DED3C5] hover:border-[#9E5430] hover:text-[#9E5430] text-[#372921] rounded-xl text-xs font-medium flex items-center justify-center shrink-0 transition-colors">
                        {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImageFile(file);
                              if (url) {
                                setEditingProduct(prev => prev ? {
                                  ...prev,
                                  coverImage: url,
                                  images: prev.images.includes(url) ? prev.images : [url, ...prev.images],
                                } : null);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    {editingProduct.coverImage && (
                      <div className="flex items-center gap-3 p-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-xl">
                        <img
                          src={editingProduct.coverImage}
                          alt="Cover preview"
                          className="w-16 h-16 object-cover rounded-lg border border-[#DED3C5]"
                        />
                        <div className="text-xs text-[#76695F]">
                          <span className="font-semibold text-[#372921] block">Primary Cover Preview</span>
                          <span className="text-[11px] truncate block max-w-md">{editingProduct.coverImage}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#EAE2D8]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-xs font-bold text-[#372921]">Product Gallery Images</h4>
                        <p className="text-[11px] text-[#76695F]">Close-ups of bead tension, interior lining, and angles on PDP.</p>
                      </div>
                      <label className="cursor-pointer px-3 py-1.5 bg-[#9E5430]/10 hover:bg-[#9E5430]/20 text-[#9E5430] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Add Photo via Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImageFile(file);
                              if (url) handleAddGalleryImageToEditing(url);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {editingProduct.images?.map((imgUrl, idx) => (
                        <div key={idx} className="relative group bg-white border border-[#DED3C5] rounded-xl p-2 space-y-1.5">
                          <div className="aspect-square bg-[#FAF7F2] rounded-lg overflow-hidden border border-[#EAE2D8]">
                            <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#76695F]">
                              {idx === 0 ? '★ Cover' : `#${idx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImageFromEditing(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              title="Remove from gallery"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CRAFT SPECS */}
              {editModalTab === 'specs' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Materials &amp; Composition
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(editingProduct.materials) ? editingProduct.materials.join(', ') : editingProduct.materials}
                      onChange={e => setEditingProduct(prev => prev ? {
                        ...prev,
                        materials: e.target.value.split(',').map(m => m.trim()).filter(Boolean),
                      } : null)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      placeholder="e.g. Japanese Miyuki glass beads, 24K gold-plated lock, raw silk lining"
                    />
                    <p className="text-[10.5px] text-[#76695F] mt-1">Separate materials with commas.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Dimensions &amp; Sizing
                    </label>
                    <input
                      type="text"
                      value={editingProduct.dimensions}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, dimensions: e.target.value } : null)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      placeholder="e.g. 18 cm (L) × 12 cm (H) × 6 cm (W); 55 cm detachable chain"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Artisanal Care &amp; Preservation Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.care}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, care: e.target.value } : null)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] leading-relaxed focus:outline-none focus:border-[#9E5430]"
                      placeholder="e.g. Store in provided raw silk dust bag. Avoid water, perfume, and abrasive friction. Wipe gently with dry microfiber cloth."
                    />
                  </div>
                </div>
              )}
            </form>

            {/* Sticky Footer */}
            <div className="px-6 py-3.5 border-t border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setEditProductModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] text-xs font-semibold text-[#76695F] hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editProductForm"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save Piece Specifications</span>
              </button>
            </div>
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
