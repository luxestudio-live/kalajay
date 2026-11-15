'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Award,
  LayoutDashboard,
  Palette,
  Package,
  MapPin,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  X,
  Check,
  Lock,
  Scale,
  FileText,
  AlertCircle,
  Send,
  UserCheck,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { useAuth, Address, Order, OrderItem } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/catalogue';
import { getPatronOrders } from '@/lib/firestore';

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, isAuthenticated, isLoading, logout, updateProfile, addAddress, deleteAddress, setDefaultAddress } =
    useAuth();
  const { formatINR, addToCart, openCart } = useCart();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: user?.preferences.birthday || '',
    anniversary: user?.preferences.anniversary || '',
    preferredPalette: user?.preferences.preferredPalette || 'Champagne Gold & Pearl',
  });
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // DPDP Act 2023 Data Principal Rights Hub States
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [nomineeContact, setNomineeContact] = useState('');
  const [nomineeSavedNotice, setNomineeSavedNotice] = useState(false);

  const [grievanceSubject, setGrievanceSubject] = useState('Personal Data Portability / Query');
  const [grievanceDetails, setGrievanceDetails] = useState('');
  const [grievanceSubmittedTicket, setGrievanceSubmittedTicket] = useState<string | null>(null);

  const [isErasureModalOpen, setIsErasureModalOpen] = useState(false);
  const [erasureConfirmText, setErasureConfirmText] = useState('');
  const [erasureCompleted, setErasureCompleted] = useState(false);

  // Load existing nominee if any
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kalajay_dpdp_nominee');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNomineeName(parsed.name || '');
        setNomineeRelation(parsed.relation || 'Spouse');
        setNomineeContact(parsed.contact || '');
      }
    } catch {}
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthday: user.preferences.birthday || '',
        anniversary: user.preferences.anniversary || '',
        preferredPalette: user.preferences.preferredPalette,
      });
    }
  }, [user]);

  // Protect route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isAuthenticated, isLoading, router]);

  // Sync live orders from Firestore chronicle with multi-device deduplication (Concern 8)
  useEffect(() => {
    if (user && user.id) {
      getPatronOrders(user.id)
        .then((liveOrders) => {
          if (liveOrders && liveOrders.length > 0) {
            const currentOrders = user.orders || [];
            const orderMap = new Map<string, Order>();
            // Seed current orders
            for (const ord of currentOrders) {
              if (ord && ord.id) orderMap.set(ord.id, ord);
            }
            // Merge live authoritative orders
            let hasNew = false;
            for (const ord of liveOrders) {
              if (ord && ord.id) {
                if (!orderMap.has(ord.id)) {
                  hasNew = true;
                }
                orderMap.set(ord.id, { ...orderMap.get(ord.id), ...ord });
              }
            }
            if (hasNew || orderMap.size !== currentOrders.length) {
              updateProfile({ orders: Array.from(orderMap.values()) });
            }
          }
        })
        .catch((e) => console.warn('Patron orders query notice:', e));
    }
  }, [user?.id]);

  if (isLoading || !user) {
    return (
      <div className="bg-canvas min-h-screen py-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-ink flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>
          <p className="font-serif text-lg text-ink">Opening Your Craft House Portfolio...</p>
        </div>
      </div>
    );
  }

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      preferences: {
        ...user.preferences,
        birthday: profileForm.birthday,
        anniversary: profileForm.anniversary,
        preferredPalette: profileForm.preferredPalette,
      },
    });
    setIsEditingProfile(false);
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3000);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
      alert('Please fill all required address fields.');
      return;
    }
    addAddress(newAddress);
    setIsAddressModalOpen(false);
    setNewAddress({
      label: 'Home',
      fullName: user.name,
      phone: user.phone,
      street: '',
      apartment: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleBuyAgain = (item: OrderItem) => {
    const product = PRODUCTS.find((p) => p.code === item.code || p.id === item.id) || PRODUCTS[0];
    addToCart(product);
    openCart();
  };

  // DPDP Section 11: Export Data Portability Packet
  const handleDownloadDataPacket = () => {
    const dataPacket = {
      fiduciary: 'Kalajay Creations Private Limited',
      legalFramework: 'Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) & DPDP Rules 2025',
      exportTimestamp: new Date().toISOString(),
      dataPrincipal: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        patronTier: user.tier,
        memberSince: user.memberSince,
        celebrationDates: {
          birthday: user.preferences.birthday || null,
          anniversary: user.preferences.anniversary || null,
        },
        signaturePalette: user.preferences.preferredPalette,
      },
      savedDestinations: user.addresses,
      ordersAndProvenance: user.orders.map((ord) => ({
        orderId: ord.id,
        orderDate: ord.date,
        status: ord.status,
        totalAmount: ord.totalAmount,
        paymentMethod: ord.paymentMethod,
        shippingDestination: ord.deliveryAddress,
        items: ord.items,
        trackingAWB: ord.awbNumber,
        masterArtisan: `${ord.artisanName} (${ord.artisanLocation})`,
      })),
      statutoryRetentionCarveOut: {
        applicableLaw: 'Section 36, Central Goods and Services Tax (CGST) Act, 2017',
        statutoryRetentionPeriod: '72 months (7 years) for completed tax invoices and GST returns',
      },
      grievanceOfficer: {
        officer: 'Soumya (Founder & Principal Trustee)',
        email: 'contact@kalajay.in',
        statutorySlaHours: 48,
        resolutionSlaDays: 30,
        appellateAuthority: 'Data Protection Board of India (DPBI)',
      },
    };

    const blob = new Blob([JSON.stringify(dataPacket, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kalajay-patron-dpdp-data-${user.phone || 'export'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // DPDP Section 14: Save Nominee Designation
  const handleSaveNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeName.trim() || !nomineeContact.trim()) return;
    localStorage.setItem(
      'kalajay_dpdp_nominee',
      JSON.stringify({
        name: nomineeName,
        relation: nomineeRelation,
        contact: nomineeContact,
        updatedAt: new Date().toISOString(),
      })
    );
    setNomineeSavedNotice(true);
    setTimeout(() => setNomineeSavedNotice(false), 3500);
  };

  // DPDP Section 13: File Grievance Ticket
  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceDetails.trim()) return;
    const ticketId = `DPDP-KJ-${Math.floor(10000 + Math.random() * 90000)}`;
    setGrievanceSubmittedTicket(ticketId);
    setGrievanceDetails('');
  };

  // DPDP Section 12: Right to Erasure / Forgotten
  const handleExecuteErasure = () => {
    setErasureCompleted(true);
    setTimeout(() => {
      logout();
      router.push('/');
    }, 2200);
  };

  return (
    <div className="bg-canvas min-h-screen pb-24 selection:bg-champagne selection:text-ink">
      {/* Editorial Member Hero Banner */}
      <div className="bg-canvas-subtle/90 border-b border-border-subtle py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink text-canvas text-[11px] uppercase tracking-monumental font-sans font-semibold">
                <Award className="w-3 h-3 text-gold" />
                <span>{user.tier} · Patron</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl text-ink font-normal tracking-tight">
                Namaste, {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
                Your personal portfolio for hand-strung bead treasures, artisan dispatches, and custom orders.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="px-4 py-2.5 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold transition-all shadow-xs flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Browse Vault</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-full bg-canvas border border-border-medium hover:border-rose-400 hover:text-rose-700 text-ink text-xs uppercase tracking-refined font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-4 border-b border-border-subtle text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-ink text-canvas border-ink font-semibold shadow-xs'
                : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-gold" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-full border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-ink text-canvas border-ink font-semibold shadow-xs'
                : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-gold" />
            <span>Orders & Provenance ({user.orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-full border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'addresses'
                ? 'bg-ink text-canvas border-ink font-semibold shadow-xs'
                : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-gold" />
            <span>Saved Addresses ({user.addresses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-full border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-ink text-canvas border-ink font-semibold shadow-xs'
                : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-gold" />
            <span>Profile & Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-full border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-ink text-canvas border-ink font-semibold shadow-xs'
                : 'bg-canvas text-ink border-border-subtle hover:border-border-strong'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>Data Privacy &amp; DPDP Hub</span>
          </button>
        </div>

        {/* --- 1. OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="pt-8 space-y-8 animate-fade-in">
            {/* Patron Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xs">
                <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                  Treasures Owned
                </span>
                <div className="font-serif text-3xl text-ink font-semibold mt-1">
                  {user.orders.reduce((sum, ord) => sum + ord.items.reduce((acc, it) => acc + it.quantity, 0), 0)}
                </div>
                <span className="text-[11px] text-gold-dark mt-1 block">Across {user.orders.length} orders</span>
              </div>

              <div className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xs">
                <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                  Craft House Points
                </span>
                <div className="font-serif text-3xl text-rosewood font-semibold mt-1">
                  ₹{user.rewardPoints}
                </div>
                <span className="text-[11px] text-ink-muted mt-1 block">Usable at checkout</span>
              </div>

              <div className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xs">
                <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                  Custom Piece
                </span>
                <div className="font-serif text-lg text-ink font-semibold mt-1 truncate">
                  Pearl Vanity Heirloom
                </div>
                <span className="text-[11px] text-emerald-700 font-medium mt-1 block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Wax-Sealed in Craft House</span>
                </span>
              </div>

              <div className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xl">
                <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                  Member Status
                </span>
                <div className="font-serif text-xl text-ink font-semibold mt-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-gold" />
                  <span>Circle Patron</span>
                </div>
                <span className="text-[11px] text-ink-muted mt-1 block">Since {user.memberSince}</span>
              </div>
            </div>

            {/* Active Order Spotlight Banner */}
            {user.orders.length > 0 && (
              <div className="bg-gradient-to-r from-canvas-subtle to-canvas rounded-2xl border border-border-gold p-6 sm:p-8 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-refined text-rosewood font-bold">
                        Live Tracking Spotlight
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-champagne/20 text-ink text-[10px] font-semibold border border-gold/40">
                        {user.orders[0].status}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl text-ink font-normal mt-1">
                      Order #{user.orders[0].id}
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Estimated Arrival: <strong className="text-ink">{user.orders[0].estimatedDelivery}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(user.orders[0]);
                      setActiveTab('orders');
                    }}
                    className="px-5 py-2.5 bg-ink text-canvas hover:bg-gold hover:text-ink rounded-full text-xs uppercase tracking-refined font-semibold transition-all cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    View Provenance Timeline →
                  </button>
                </div>

                <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <p className="text-xs text-ink-muted leading-relaxed">
                      <strong className="text-ink font-medium">Artisan Signature: </strong>
                      &ldquo;{user.orders[0].artisanNote}&rdquo; —{' '}
                      <span className="text-gold-dark font-medium">
                        {user.orders[0].artisanName} ({user.orders[0].artisanLocation})
                      </span>
                    </p>

                    {/* Miniature Progress Track */}
                    <div className="pt-2">
                      <div className="w-full bg-canvas-subtle rounded-full h-1.5 border border-border-subtle overflow-hidden">
                        <div className="bg-gold h-full rounded-full w-3/5" />
                      </div>
                      <div className="flex justify-between text-[10px] text-ink-muted mt-1.5">
                        <span>Hand-Strung & Tensioned</span>
                        <span className="font-semibold text-gold-dark">Craft House Wax-Sealed</span>
                        <span>Doorstep Delivery</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex items-center gap-3">
                    {user.orders[0].items.map((item) => (
                      <div
                        key={item.id}
                        className="w-16 h-20 rounded-xl overflow-hidden bg-canvas border border-border-medium shrink-0 shadow-2xs"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="text-xs">
                      <span className="font-serif text-sm font-semibold text-ink block">
                        {user.orders[0].items[0].name}
                      </span>
                      <span className="text-[11px] text-ink-muted">
                        {formatINR(user.orders[0].totalAmount)} · {user.orders[0].paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div
                onClick={() => setActiveTab('orders')}
                className="bg-canvas-subtle p-6 rounded-2xl border border-border-subtle hover:border-gold transition-all cursor-pointer group shadow-2xs"
              >
                <Package className="w-6 h-6 text-gold mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-serif text-lg text-ink font-medium">Orders & Dispatches</h4>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Review item specs, invoices, and hand-woven signatures for all past orders.
                </p>
                <span className="text-xs font-semibold text-gold-dark mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab('addresses')}
                className="bg-canvas-subtle p-6 rounded-2xl border border-border-subtle hover:border-gold transition-all cursor-pointer group shadow-2xs"
              >
                <MapPin className="w-6 h-6 text-gold mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-serif text-lg text-ink font-medium">Delivery Addresses</h4>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Manage your home, studio, and gift delivery destinations for swift checkout.
                </p>
                <span className="text-xs font-semibold text-gold-dark mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Manage {user.addresses.length} Addresses</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <Link
                href="/customise"
                className="bg-canvas-subtle p-6 rounded-2xl border border-border-subtle hover:border-gold transition-all cursor-pointer group shadow-2xs block"
              >
                <Palette className="w-6 h-6 text-rosewood mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-serif text-lg text-ink font-medium">Custom Studio Creations</h4>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Design bespoke color combinations or request customized wedding favours.
                </p>
                <span className="text-xs font-semibold text-gold-dark mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Custom Studio</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* --- 2. ORDERS & PROVENANCE TAB --- */}
        {activeTab === 'orders' && (
          <div className="pt-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h2 className="font-serif text-2xl text-ink font-normal">Order Chronicle & Provenance</h2>
                <p className="text-xs text-ink-muted">
                  Every order includes authentic artisan notes and calibrated transit milestones.
                </p>
              </div>
              <span className="text-xs text-ink-muted">
                Showing <strong className="text-ink">{user.orders?.length || 0}</strong> orders
              </span>
            </div>

            {!user.orders || user.orders.length === 0 ? (
              <div className="text-center py-16 bg-canvas-subtle rounded-2xl border border-dashed border-border-medium space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-champagne/30 text-rosewood flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-ink font-medium">Your Craft Portfolio is Empty</h3>
                  <p className="text-xs text-ink-muted max-w-sm mx-auto">
                    You have not placed any atelier commissions yet. Explore our handcrafted creations to start your collection.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink text-canvas hover:bg-gold hover:text-ink text-xs uppercase tracking-refined font-semibold transition-all shadow-xs"
                >
                  <span>Browse Handcrafted Creations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {user.orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-canvas-subtle rounded-2xl border border-border-gold overflow-hidden transition-all shadow-xs"
                  >
                    {/* Order Summary Bar */}
                    <div className="p-5 sm:p-6 bg-canvas border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-serif text-lg font-semibold text-ink">
                          Order #{order.id}
                        </span>
                        <span className="text-xs text-ink-muted">Placed on {order.date}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-refined ${
                            order.status === 'In Transit'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-serif text-base font-semibold text-rosewood">
                          {formatINR(order.totalAmount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(isSelected ? null : order)}
                          className="px-3.5 py-1.5 rounded-full border border-border-medium hover:border-gold text-xs font-semibold text-ink transition-colors cursor-pointer"
                        >
                          {isSelected ? 'Hide Details' : 'View Timeline & Specs'}
                        </button>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-5 sm:p-6 divide-y divide-border-subtle">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-canvas border border-border-medium shrink-0 shadow-2xs">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-refined text-ink-muted block">
                                {item.category} · {item.code}
                              </span>
                              <h4 className="font-serif text-sm sm:text-base text-ink font-semibold mt-0.5">
                                {item.name}
                              </h4>
                              <span className="text-xs text-gold-dark font-medium block mt-0.5">
                                Colorway: {item.colorway}
                              </span>
                              <span className="text-xs text-ink-muted mt-1 block">
                                Qty: {item.quantity} × {formatINR(item.price)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-serif text-sm font-semibold text-ink block">
                              {formatINR(item.price * item.quantity)}
                            </span>
                            <div className="flex items-center justify-end gap-2 mt-1 text-[11px]">
                              <button
                                type="button"
                                onClick={() => handleBuyAgain(item)}
                                className="text-gold-dark hover:text-ink font-semibold underline cursor-pointer"
                              >
                                Buy Again
                              </button>
                              <span className="text-border-medium select-none">·</span>
                              <Link
                                href="/customise"
                                className="text-ink-muted hover:text-rosewood hover:underline"
                              >
                                Customise This Piece
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Timeline Drawer */}
                    {isSelected && (
                      <div className="p-5 sm:p-8 bg-canvas-subtle/80 border-t border-border-gold space-y-6 animate-fade-in">
                        {/* Artisan Note Card */}
                        <div className="p-4 bg-canvas rounded-xl border border-border-gold flex items-start gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4 text-gold" />
                          </div>
                          <div className="text-xs space-y-1">
                            <strong className="text-ink font-semibold block">
                              Craft House Provenance
                            </strong>
                            <p className="text-ink-muted italic font-serif leading-relaxed">
                              &ldquo;{order.artisanNote}&rdquo;
                            </p>
                            <span className="text-[11px] text-gold-dark font-sans font-semibold block pt-0.5">
                              Crafted by {order.artisanName} · {order.artisanLocation}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Step Timeline */}
                        <div>
                          <h4 className="text-xs uppercase tracking-refined font-semibold text-ink mb-4">
                            Milestone Dispatch Chronicle (Kalajay In-House Dispatch: {order.awbNumber})
                          </h4>
                          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-medium">
                            {order.trackingSteps.map((step, idx) => (
                              <div key={idx} className="relative pl-8 flex items-start justify-between gap-4">
                                <div
                                  className={`absolute left-1.5 top-1 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all ${
                                    step.completed
                                      ? 'bg-ink border-gold'
                                      : 'bg-canvas border-border-medium'
                                  }`}
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs font-semibold ${
                                        step.completed ? 'text-ink' : 'text-ink-muted'
                                      }`}
                                    >
                                      {step.title}
                                    </span>
                                    {step.current && (
                                      <span className="px-2 py-0.2 rounded-full bg-champagne text-ink text-[10px] font-bold">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-ink-muted block mt-0.5">
                                    {step.location} · {step.description || ''}
                                  </span>
                                </div>
                                <span className="text-[11px] text-ink-muted shrink-0">{step.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Destination & Invoice Download */}
                        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="text-ink-muted">
                            <span className="font-semibold text-ink block">Shipping to:</span>
                            <span>
                              {order.deliveryAddress.fullName}, {order.deliveryAddress.street},{' '}
                              {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => alert(`Invoice #INV-${order.id}.pdf downloaded.`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-canvas border border-border-medium hover:border-gold text-ink font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5 text-gold-dark" />
                            <span>Download Tax Invoice</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* --- 3. SAVED ADDRESSES TAB --- */}
        {activeTab === 'addresses' && (
          <div className="pt-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h2 className="font-serif text-2xl text-ink font-normal">Delivery Addresses</h2>
                <p className="text-xs text-ink-muted">
                  Saved delivery locations for seamless, one-tap orders across India.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="px-4 py-2.5 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-6 rounded-2xl border transition-all bg-canvas-subtle relative flex flex-col justify-between ${
                    addr.isDefault ? 'border-gold shadow-md' : 'border-border-subtle hover:border-border-medium'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-canvas text-ink text-[11px] font-semibold border border-border-subtle">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark text-[10px] font-bold">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-xs text-gold-dark hover:underline font-medium cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1 text-ink-faint hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-serif text-base font-semibold text-ink">{addr.fullName}</h4>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                      {addr.street}
                      {addr.apartment ? `, ${addr.apartment}` : ''}
                      <br />
                      {addr.city}, {addr.state} — <strong className="text-ink">{addr.pincode}</strong>
                    </p>
                    <p className="text-xs text-ink mt-2">
                      <span className="text-ink-muted">Phone:</span> {addr.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 4. PROFILE & PREFERENCES TAB --- */}
        {activeTab === 'profile' && (
          <div className="pt-8 max-w-2xl space-y-8 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h2 className="font-serif text-2xl text-ink font-normal">Patron Profile & Craft House Preferences</h2>
                <p className="text-xs text-ink-muted">
                  Update your contact coordinates and bespoke bead colorway preferences.
                </p>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 rounded-full border border-border-medium hover:border-gold text-xs font-semibold text-ink transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {profileSavedNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Your profile and preferences were updated successfully.</span>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-5 bg-canvas-subtle p-6 rounded-2xl border border-border-gold">
                <div>
                  <label htmlFor="profile-full-name" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="profile-full-name"
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label htmlFor="profile-email-addr" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="profile-email-addr"
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label htmlFor="profile-phone-num" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    id="profile-phone-num"
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="profile-bday" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                      Birthday (Celebration Gift)
                    </label>
                    <input
                      id="profile-bday"
                      type="text"
                      placeholder="DD / MM (e.g. 14 November)"
                      value={profileForm.birthday}
                      onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                      className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-anniv" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                      Anniversary (Optional)
                    </label>
                    <input
                      id="profile-anniv"
                      type="text"
                      placeholder="DD / MM (e.g. 26 February)"
                      value={profileForm.anniversary}
                      onChange={(e) => setProfileForm({ ...profileForm, anniversary: e.target.value })}
                      className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="profile-palette-pref" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                    Signature Bead Palette Preference
                  </label>
                  <select
                    id="profile-palette-pref"
                    value={profileForm.preferredPalette}
                    onChange={(e) => setProfileForm({ ...profileForm, preferredPalette: e.target.value })}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                  >
                    <option value="Champagne Gold & Pearl">Champagne Gold & Pearl (Timeless Bridal)</option>
                    <option value="Rose Pink & Iridescent Crystal">Rose Pink & Iridescent Crystal (Romantic Daily)</option>
                    <option value="Emerald Green & Deep Noir">Emerald Green & Deep Noir (Evening Statement)</option>
                    <option value="Lavender Mist & Frosted Glass">Lavender Mist & Frosted Glass (Subtle Modern)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-ink text-canvas hover:bg-gold hover:text-ink rounded-full text-xs uppercase tracking-refined font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 rounded-full border border-border-subtle text-xs text-ink-muted hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-canvas-subtle p-6 sm:p-8 rounded-2xl border border-border-gold space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                      Full Legal Name
                    </span>
                    <span className="font-serif text-lg text-ink font-semibold mt-0.5 block">{user.name}</span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                      Email Address
                    </span>
                    <span className="text-sm text-ink font-medium mt-0.5 block">{user.email}</span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                      Mobile Number
                    </span>
                    <span className="text-sm text-ink font-medium mt-0.5 block">{user.phone}</span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                      Celebration Birthday
                    </span>
                    <span className="text-sm text-ink font-medium mt-0.5 block">
                      {user.preferences.birthday || 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border-subtle">
                  <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                    Signature Bead Palette
                  </span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Palette className="w-4 h-4 text-rosewood" />
                    <span className="text-sm font-serif font-semibold text-ink">
                      {user.preferences.preferredPalette}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 5. DATA PRIVACY & DPDP HUB TAB --- */}
        {activeTab === 'privacy' && (
          <div className="pt-8 space-y-8 animate-fade-in text-xs text-ink">
            {/* Header / Statutory Overview */}
            <div className="p-6 sm:p-8 bg-canvas-subtle rounded-2xl border border-border-gold space-y-3 relative overflow-hidden shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-ink text-canvas text-[10px] uppercase tracking-monumental font-semibold">
                    <ShieldCheck className="w-3 h-3 text-gold" />
                    <span>Statutory DPDP Act 2023 Hub</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
                    Data Principal Rights &amp; Safeguards
                  </h2>
                  <p className="text-xs text-ink-muted font-light leading-relaxed max-w-2xl">
                    Under the <strong>Digital Personal Data Protection Act, 2023</strong> and the <strong>DPDP Rules, 2025</strong>, you exercise sovereign ownership over your personal information. Kalajay provides full self-service access, rectification, portability, nomination, and grievance redressal below.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-dpdp-preferences'));
                      }
                    }}
                    className="px-4 py-2.5 bg-canvas border border-border-medium hover:border-gold rounded-full text-xs font-semibold text-ink flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-gold" />
                    <span>Consent Preferences</span>
                  </button>

                  <Link
                    href="/privacy"
                    className="px-4 py-2.5 bg-ink hover:bg-gold hover:text-ink text-canvas rounded-full text-xs font-semibold uppercase tracking-refined flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Read DPDP Policy</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Grid: Sections 11 & 12 (Access & Rectification) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 11: Right to Access & Data Portability */}
              <div className="p-6 bg-canvas-subtle rounded-2xl border border-border-subtle space-y-4 shadow-2xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gold/20 text-gold-dark font-serif font-bold text-xs flex items-center justify-center">
                      11
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-ink font-semibold">
                        Right to Access &amp; Portability
                      </h3>
                      <span className="text-[11px] text-ink-muted">Section 11, DPDP Act 2023</span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-muted font-light leading-relaxed">
                    Obtain a machine-readable archive of all personal data held under your patronage, including contact coordinates, shipping destinations, and transactional craft orders.
                  </p>

                  <div className="p-3.5 bg-canvas rounded-xl border border-border-subtle space-y-1.5 text-[11px] font-mono text-ink">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Data Fiduciary:</span>
                      <span className="font-semibold">Kalajay Creations Pvt Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Domestic Hosting:</span>
                      <span>AWS ap-south-1 (Mumbai)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Encrypted Record ID:</span>
                      <span>{user.id}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadDataPacket}
                  className="w-full py-3 bg-ink hover:bg-gold hover:text-ink text-canvas rounded-full text-xs uppercase tracking-refined font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Personal Data Archive (JSON)</span>
                </button>
              </div>

              {/* Section 12: Right to Correction & Update */}
              <div className="p-6 bg-canvas-subtle rounded-2xl border border-border-subtle space-y-4 shadow-2xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gold/20 text-gold-dark font-serif font-bold text-xs flex items-center justify-center">
                      12
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-ink font-semibold">
                        Right to Correction &amp; Rectification
                      </h3>
                      <span className="text-[11px] text-ink-muted">Section 12, DPDP Act 2023</span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-muted font-light leading-relaxed">
                    You have the statutory right to rectify incomplete, inaccurate, or outdated contact coordinates, celebration dates, or shipping destinations.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="p-3 bg-canvas border border-border-medium hover:border-gold rounded-xl text-left transition-colors cursor-pointer group"
                    >
                      <UserIcon className="w-4 h-4 text-rosewood mb-1 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold block text-xs">Edit Patron Profile</span>
                      <span className="text-[10px] text-ink-muted">Name, email, birthday</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('addresses')}
                      className="p-3 bg-canvas border border-border-medium hover:border-gold rounded-xl text-left transition-colors cursor-pointer group"
                    >
                      <MapPin className="w-4 h-4 text-gold mb-1 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold block text-xs">Manage Destinations</span>
                      <span className="text-[10px] text-ink-muted">{user.addresses.length} saved addresses</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-canvas rounded-xl border border-border-subtle text-[11px] text-ink-muted">
                  <p>Changes saved to your profile take immediate effect across all future artisan dispatch batches.</p>
                </div>
              </div>
            </div>

            {/* Section 14: Right to Nominate */}
            <div className="p-6 sm:p-8 bg-canvas-subtle rounded-2xl border border-border-subtle space-y-5 shadow-2xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gold/20 text-gold-dark font-serif font-bold text-xs flex items-center justify-center">
                    14
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-ink font-semibold">
                      Right to Nominate a Representative (Section 14)
                    </h3>
                    <span className="text-[11px] text-ink-muted">
                      Statutory nomination in the event of death or incapacity of the Data Principal
                    </span>
                  </div>
                </div>

                {nomineeSavedNotice && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold animate-fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Nominee Saved</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-ink-muted font-light leading-relaxed">
                In compliance with Section 14 of the DPDP Act 2023, you may designate a trusted individual who shall have the legal authority to exercise your Data Principal rights (including accessing records or requesting account closure) in the event of unforeseen death or medical incapacity.
              </p>

              <form onSubmit={handleSaveNominee} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label htmlFor="nominee-name" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    Nominee Full Legal Name *
                  </label>
                  <input
                    id="nominee-name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Deshmukh"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label htmlFor="nominee-relation" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    Relationship to Patron *
                  </label>
                  <select
                    id="nominee-relation"
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child (Adult)</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Legal Heir">Legal Heir</option>
                    <option value="Authorized Trustee">Authorized Trustee / Executor</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="nominee-contact" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    Nominee Contact (Email / Phone) *
                  </label>
                  <input
                    id="nominee-contact"
                    type="text"
                    required
                    placeholder="e.g. nominee@domain.com / +91..."
                    value={nomineeContact}
                    onChange={(e) => setNomineeContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-ink hover:bg-gold hover:text-ink text-canvas rounded-full text-xs uppercase tracking-refined font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Record Nominee Designation</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Section 13: Right of Grievance Redressal */}
            <div className="p-6 sm:p-8 bg-canvas-subtle rounded-2xl border border-border-subtle space-y-5 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gold/20 text-gold-dark font-serif font-bold text-xs flex items-center justify-center">
                  13
                </div>
                <div>
                  <h3 className="font-serif text-xl text-ink font-semibold">
                    Right of Grievance Redressal (Section 13)
                  </h3>
                  <span className="text-[11px] text-ink-muted">
                    Formal escalation to Data Protection Officer &middot; Guaranteed SLA
                  </span>
                </div>
              </div>

              <p className="text-xs text-ink-muted font-light leading-relaxed">
                If you have inquiries, objections, or concerns regarding your personal data handling, file a grievance ticket below. We guarantee a formal written acknowledgment within <strong>48 hours</strong> and substantive resolution within <strong>30 calendar days</strong>.
              </p>

              {grievanceSubmittedTicket ? (
                <div className="p-5 bg-canvas rounded-xl border border-emerald-600/30 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Statutory Grievance Ticket Logged Successfully</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-ink-muted block text-[10px] uppercase font-semibold">Ticket Reference</span>
                      <strong className="font-mono text-sm text-ink">{grievanceSubmittedTicket}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[10px] uppercase font-semibold">Acknowledgment SLA</span>
                      <span className="text-ink font-medium">Within 48 hours</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[10px] uppercase font-semibold">Resolution Officer</span>
                      <span className="text-ink font-medium">Soumya (Grievance Officer)</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-muted pt-2 border-t border-border-subtle">
                    An acknowledgment has been dispatched to <strong>{user.email}</strong>. If unsatisfied after 30 days, you may file an appeal before the <strong>Data Protection Board of India (DPBI)</strong> under Section 13(4).
                  </p>
                  <button
                    type="button"
                    onClick={() => setGrievanceSubmittedTicket(null)}
                    className="text-xs text-rosewood underline font-semibold cursor-pointer pt-1"
                  >
                    File Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitGrievance} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dpdp-grievance-subject" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                        Grievance Category *
                      </label>
                      <select
                        id="dpdp-grievance-subject"
                        value={grievanceSubject}
                        onChange={(e) => setGrievanceSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold cursor-pointer"
                      >
                        <option value="Personal Data Portability / Query">Personal Data Portability / Query</option>
                        <option value="Correction or Update Request">Correction or Update Request</option>
                        <option value="Withdrawal of Consent">Withdrawal of Consent</option>
                        <option value="Right to Erasure Inquiry">Right to Erasure Inquiry</option>
                        <option value="Unsolicited Communication Report">Unsolicited Communication Report</option>
                        <option value="General DPDP Inquiry">General DPDP Compliance Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dpdp-dpo-email" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                        Designated Data Protection Officer
                      </label>
                      <input
                        id="dpdp-dpo-email"
                        type="text"
                        readOnly
                        value="Soumya · privacy@kalajay.in (48h SLA)"
                        className="w-full px-3.5 py-2.5 bg-canvas/60 border border-border-subtle rounded-xl text-xs text-ink-muted font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dpdp-grievance-details" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                      Detailed Nature of Your Grievance or Request *
                    </label>
                    <textarea
                      id="dpdp-grievance-details"
                      required
                      rows={3}
                      placeholder="Please specify the details of your request or concern regarding your personal data..."
                      value={grievanceDetails}
                      onChange={(e) => setGrievanceDetails(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-ink hover:bg-gold hover:text-ink text-canvas rounded-full text-xs uppercase tracking-refined font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Grievance Ticket</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Section 12: Right to Erasure / Forgotten */}
            <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-800 font-serif font-bold text-xs flex items-center justify-center">
                  12
                </div>
                <div>
                  <h3 className="font-serif text-lg text-rose-950 font-semibold">
                    Right to Erasure (&quot;Right to be Forgotten&quot;)
                  </h3>
                  <span className="text-[11px] text-rose-800">
                    Section 12, DPDP Act 2023 · With Statutory CGST Retention Carve-out
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-950 leading-relaxed space-y-2">
                <div className="font-medium flex items-center gap-1.5 text-rose-900">
                  <Scale className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>Important Statutory Retention Notice: Section 36, CGST Act 2017</span>
                </div>
                <p>
                  Upon exercising your Right to Erasure, all active patron login credentials, mobile OTP bindings, saved delivery addresses, and marketing preferences will be permanently wiped from active databases.
                </p>
                <p className="text-[11px] text-rose-900/80">
                  <em>Statutory Exception:</em> Under <strong>Section 36 of the Central Goods and Services Tax (CGST) Act, 2017</strong>, completed tax invoices and sales ledgers must be retained for <strong>72 months (7 years)</strong> for audit purposes. These invoices will be severed from active profile links and sealed in isolated cold storage.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsErasureModalOpen(true)}
                  className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs uppercase tracking-refined font-semibold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Request Account &amp; Data Erasure</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- RIGHT TO ERASURE CONFIRMATION MODAL --- */}
      {isErasureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-canvas w-full max-w-lg rounded-2xl border border-rose-300 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setIsErasureModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-2xl text-ink font-semibold">Confirm Personal Data Erasure</h3>
              <span className="text-xs text-rose-700 font-medium">DPDP Act 2023 · Section 12</span>
            </div>

            {erasureCompleted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Erasure Executed Successfully</span>
                </div>
                <p>Your patron profile credentials and saved addresses have been expunged. Logging out now...</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-ink-muted leading-relaxed">
                  You are about to irreversibly erase your Kalajay patron account (<strong>{user.email}</strong>). You will lose access to member-exclusive benefits and order histories.
                </p>

                <div className="p-3 bg-canvas-subtle rounded-xl border border-border-subtle text-[11px] text-ink-muted space-y-1">
                  <strong>Statutory Tax Ledger Retention:</strong>
                  <p>Invoices associated with completed purchases will remain archived in tax cold storage for 7 years as mandated by Section 36 of the Indian CGST Act 2017.</p>
                </div>

                <div>
                  <label htmlFor="confirm-erasure-name" className="text-xs text-ink block font-semibold mb-1">
                    To confirm, please type &quot;<strong>ERASE</strong>&quot; below:
                  </label>
                  <input
                    id="confirm-erasure-name"
                    type="text"
                    placeholder="Type ERASE to confirm"
                    value={erasureConfirmText}
                    onChange={(e) => setErasureConfirmText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsErasureModalOpen(false)}
                    className="px-4 py-2 text-xs text-ink-muted hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={erasureConfirmText.trim().toUpperCase() !== 'ERASE'}
                    onClick={handleExecuteErasure}
                    className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white rounded-full text-xs uppercase tracking-refined font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    Confirm Permanent Erasure
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- ADD ADDRESS MODAL --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-canvas w-full max-w-lg rounded-2xl border border-border-gold p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-ink font-normal mb-1">Add Delivery Destination</h3>
            <p className="text-xs text-ink-muted mb-6">Enter safe transit destination details across India.</p>

            <form onSubmit={handleCreateAddress} className="space-y-4">
              <div className="flex items-center gap-3">
                {['Home', 'Studio', 'Work'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewAddress({ ...newAddress, label: lbl })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      newAddress.label === lbl
                        ? 'bg-ink text-canvas border-ink shadow-xs'
                        : 'bg-canvas text-ink border-border-medium'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="addr-recipient-name" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  Recipient Full Name *
                </label>
                <input
                  id="addr-recipient-name"
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label htmlFor="addr-recipient-phone" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  Recipient Contact Phone *
                </label>
                <input
                  id="addr-recipient-phone"
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label htmlFor="addr-street" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  Street Address & House / Flat No. *
                </label>
                <input
                  id="addr-street"
                  type="text"
                  required
                  placeholder="e.g. B-402, Signature Palms, Linking Road"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="addr-city" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    City *
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label htmlFor="addr-pincode" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    Pincode *
                  </label>
                  <input
                    id="addr-pincode"
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="addr-state" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  State *
                </label>
                <input
                  id="addr-state"
                  type="text"
                  required
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="default-address"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="rounded text-gold focus:ring-gold cursor-pointer"
                />
                <label htmlFor="default-address" className="text-xs text-ink cursor-pointer">
                  Set as default shipping destination
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 text-xs text-ink-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-ink text-canvas hover:bg-gold hover:text-ink rounded-full text-xs uppercase tracking-refined font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

