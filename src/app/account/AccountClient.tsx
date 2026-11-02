'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Gem,
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
} from 'lucide-react';
import { useAuth, Address, Order, OrderItem } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/catalogue';

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

  if (isLoading || !user) {
    return (
      <div className="bg-canvas min-h-screen py-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-ink flex items-center justify-center animate-pulse">
            <Gem className="w-6 h-6 text-gold" />
          </div>
          <p className="font-serif text-lg text-ink">Opening Your Atelier Portfolio...</p>
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

  return (
    <div className="bg-canvas min-h-screen pb-24 selection:bg-champagne selection:text-ink">
      {/* Editorial Member Hero Banner */}
      <div className="bg-canvas-subtle/90 border-b border-border-subtle py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink text-canvas text-[11px] uppercase tracking-monumental font-sans font-semibold">
                <Gem className="w-3 h-3 text-gold" />
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
            <Gem className="w-3.5 h-3.5 text-gold" />
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
                  Atelier Points
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
                  <span>Wax-Sealed in Atelier</span>
                </span>
              </div>

              <div className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xl">
                <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                  Member Status
                </span>
                <div className="font-serif text-xl text-ink font-semibold mt-1 flex items-center gap-1.5">
                  <Gem className="w-4 h-4 text-gold" />
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
                        <span className="font-semibold text-gold-dark">Atelier Wax-Sealed</span>
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
                <Gem className="w-6 h-6 text-gold mb-3 group-hover:scale-110 transition-transform" />
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
                Showing <strong className="text-ink">{user.orders.length}</strong> orders
              </span>
            </div>

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
                            <Gem className="w-4 h-4 text-gold" />
                          </div>
                          <div className="text-xs space-y-1">
                            <strong className="text-ink font-semibold block">
                              Atelier Hand-Crafting Provenance
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
                            Milestone Dispatch Chronicle (BlueDart Air: {order.awbNumber})
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
                <h2 className="font-serif text-2xl text-ink font-normal">Patron Profile & Atelier Preferences</h2>
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
                <span>Your atelier profile and preferences were updated successfully.</span>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-5 bg-canvas-subtle p-6 rounded-2xl border border-border-gold">
                <div>
                  <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                      Birthday (Celebration Gift)
                    </label>
                    <input
                      type="text"
                      placeholder="DD / MM (e.g. 14 November)"
                      value={profileForm.birthday}
                      onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                      className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                      Anniversary (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="DD / MM (e.g. 26 February)"
                      value={profileForm.anniversary}
                      onChange={(e) => setProfileForm({ ...profileForm, anniversary: e.target.value })}
                      className="w-full px-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                    Signature Bead Palette Preference
                  </label>
                  <select
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
                    <Gem className="w-4 h-4 text-gold" />
                    <span className="text-sm font-serif font-semibold text-ink">
                      {user.preferences.preferredPalette}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
                <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  Recipient Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  Street Address & House / Flat No. *
                </label>
                <input
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
                  <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    Pincode *
                  </label>
                  <input
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
                <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  State *
                </label>
                <input
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

