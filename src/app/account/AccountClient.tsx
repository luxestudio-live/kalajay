'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Award,
  LayoutDashboard,
  Package,
  MapPin,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ShoppingBag,
  ExternalLink,
  X,
  Check,
  ArrowRight,
  Lock,
  Palette,
  Download,
} from 'lucide-react';
import { useAuth, Address, Order, OrderItem } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/catalogue';
import { getPatronOrders } from '@/lib/firestore';
import { validateAddress } from '@/lib/checkout/addressModel';

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const {
    user,
    isAuthenticated,
    isLoading,
    getIdToken,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();
  const { formatINR, addToCart, openCart } = useCart();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Guest Order Claiming States
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimOrderId, setClaimOrderId] = useState('');
  const [claimOtp, setClaimOtp] = useState('');
  const [claimStep, setClaimStep] = useState<'input' | 'otp'>('input');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSaveAddress, setClaimSaveAddress] = useState(true);

  // Address Modal & Action States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressActionError, setAddressActionError] = useState<string | null>(null);
  const [addressActionSuccess, setAddressActionSuccess] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    apartment: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    isDefault: false,
  });

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: user?.preferences?.birthday || '',
    anniversary: user?.preferences?.anniversary || '',
  });
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== 'privacy') setActiveTab(tab);
    const claimCode = searchParams.get('claim');
    if (claimCode) {
      setClaimOrderId(claimCode);
      setIsClaimModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthday: user.preferences?.birthday || '',
        anniversary: user.preferences?.anniversary || '',
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

  // Lock body scroll and pause Lenis when Address or Claim modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(isAddressModalOpen || isClaimModalOpen);
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && (window as unknown as { __lenis?: { stop: () => void } }).__lenis) {
        (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop();
      }
    } else {
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && (window as unknown as { __lenis?: { start: () => void } }).__lenis) {
        (window as unknown as { __lenis?: { start: () => void } }).__lenis?.start();
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && (window as unknown as { __lenis?: { start: () => void } }).__lenis) {
        (window as unknown as { __lenis?: { start: () => void } }).__lenis?.start();
      }
    };
  }, [isAddressModalOpen, isClaimModalOpen]);

  if (isLoading) {
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
    if (!user) return;
    updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      preferences: {
        ...user.preferences,
        birthday: profileForm.birthday,
        anniversary: profileForm.anniversary,
      },
    });
    setIsEditingProfile(false);
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3000);
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressActionError(null);
    setNewAddress({
      label: 'Home',
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      apartment: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      isDefault: (user?.addresses || []).length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressActionError(null);
    setNewAddress({
      label: addr.label || 'Home',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      street: addr.street || '',
      apartment: addr.apartment || '',
      city: addr.city || '',
      state: addr.state || 'Maharashtra',
      pincode: addr.pincode || '',
      isDefault: Boolean(addr.isDefault),
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressActionError(null);

    const validation = validateAddress(newAddress);
    if (!validation.valid) {
      setAddressActionError(validation.errors.join(' '));
      return;
    }

    setIsSavingAddress(true);
    try {
      if (editingAddressId) {
        const res = await updateAddress(editingAddressId, newAddress);
        if (!res.success) {
          setAddressActionError(res.error || 'Failed to update delivery destination.');
          setIsSavingAddress(false);
          return;
        }
        setAddressActionSuccess('Delivery destination updated successfully.');
      } else {
        const res = await addAddress(newAddress);
        if (!res.success) {
          setAddressActionError(res.error || 'Failed to save delivery destination.');
          setIsSavingAddress(false);
          return;
        }
        setAddressActionSuccess('New delivery destination added to your profile.');
      }
      setIsAddressModalOpen(false);
      setTimeout(() => setAddressActionSuccess(null), 3500);
    } catch (err: any) {
      setAddressActionError(err?.message || 'Network error saving delivery destination.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await deleteAddress(id);
      if (!res.success) {
        setAddressActionError(res.error || 'Failed to delete address.');
        setTimeout(() => setAddressActionError(null), 3500);
      } else {
        setAddressActionSuccess('Address removed from your profile.');
        setTimeout(() => setAddressActionSuccess(null), 3500);
      }
    } catch (err: any) {
      setAddressActionError(err?.message || 'Network error removing address.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await setDefaultAddress(id);
      if (!res.success) {
        setAddressActionError(res.error || 'Failed to set default address.');
        setTimeout(() => setAddressActionError(null), 3500);
      } else {
        setAddressActionSuccess('Default delivery destination updated.');
        setTimeout(() => setAddressActionSuccess(null), 3500);
      }
    } catch (err: any) {
      setAddressActionError(err?.message || 'Network error updating default address.');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleInitiateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = claimOrderId.trim().toUpperCase();
    if (!cleanId) {
      setClaimError('Please enter an order reference number (e.g. KJ-216626).');
      return;
    }
    setIsClaiming(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setClaimError('Authentication token expired. Please re-authenticate.');
        setIsClaiming(false);
        return;
      }

      const res = await fetch('/api/orders/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: cleanId,
          action: 'claim',
          saveAddressToProfile: claimSaveAddress,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClaimSuccess(data.message || 'Order successfully linked to your portfolio.');
        setIsClaiming(false);
        if (user && user.id) {
          getPatronOrders(user.id).then((ords) => {
            if (ords) updateProfile({ orders: ords });
          });
        }
        setTimeout(() => {
          setIsClaimModalOpen(false);
          setClaimOrderId('');
          setClaimSuccess(null);
        }, 1500);
      } else if (data.requiresOtpChallenge) {
        setClaimStep('otp');
        setClaimError(null);
        await fetch('/api/orders/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: cleanId,
            action: 'request_otp',
          }),
        });
        setIsClaiming(false);
      } else {
        setClaimError(data.error || 'Failed to claim guest order.');
        setIsClaiming(false);
      }
    } catch (err: any) {
      setClaimError(err?.message || 'Network error claiming order.');
      setIsClaiming(false);
    }
  };

  const handleVerifyOtpAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimOtp.trim()) {
      setClaimError('Please enter the 6-digit verification code.');
      return;
    }
    setIsClaiming(true);
    setClaimError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setClaimError('Authentication token expired. Please re-authenticate.');
        setIsClaiming(false);
        return;
      }

      const res = await fetch('/api/orders/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: claimOrderId.trim().toUpperCase(),
          action: 'verify_otp_and_claim',
          otp: claimOtp.trim(),
          saveAddressToProfile: claimSaveAddress,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClaimSuccess(data.message || 'Order successfully linked to your portfolio.');
        setIsClaiming(false);
        if (user && user.id) {
          getPatronOrders(user.id).then((ords) => {
            if (ords) updateProfile({ orders: ords });
          });
        }
        setTimeout(() => {
          setIsClaimModalOpen(false);
          setClaimOrderId('');
          setClaimOtp('');
          setClaimStep('input');
          setClaimSuccess(null);
        }, 1500);
      } else {
        setClaimError(data.error || 'Invalid verification code.');
        setIsClaiming(false);
      }
    } catch (err: any) {
      setClaimError(err?.message || 'Network error verifying claim code.');
      setIsClaiming(false);
    }
  };

  const handleBuyAgain = (item: OrderItem) => {
    const product = PRODUCTS.find((p) => p.code === item.code || p.id === item.id) || PRODUCTS[0];
    addToCart(product);
    openCart();
  };

  if (isLoading) {
    return (
      <div className="bg-canvas min-h-screen flex items-center justify-center py-24 selection:bg-champagne selection:text-ink">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-rosewood border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg text-ink">Opening your Kalajay Portfolio...</p>
          <p className="text-xs text-ink-muted">Verifying patron security credentials</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-canvas min-h-screen flex items-center justify-center py-24 selection:bg-champagne selection:text-ink">
        <div className="text-center space-y-5 max-w-md mx-auto px-4 bg-canvas-subtle p-8 rounded-2xl border border-border-subtle shadow-xs">
          <div className="w-12 h-12 rounded-full bg-champagne flex items-center justify-center mx-auto text-rosewood">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-ink font-normal">Patron Sign In Required</h2>
            <p className="text-xs text-ink-muted leading-relaxed font-light">
              Please authenticate to access your handcrafted jewelry portfolio, artisan dispatch chronicle, and delivery coordinates.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?redirect=/account"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold transition-all shadow-xs inline-flex items-center justify-center gap-2"
            >
              <span>Sign In to Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-canvas border border-border-medium hover:border-gold text-ink text-xs uppercase tracking-refined font-medium transition-all inline-flex items-center justify-center"
            >
              Register Patron Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userOrders = user.orders || [];
  const userAddresses = user.addresses || [];
  const userPreferences = user.preferences || { preferredPalette: 'Champagne Gold & Pearl' };

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
            <span>Orders & Provenance ({userOrders.length})</span>
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
            <span>Saved Addresses ({userAddresses.length})</span>
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
            <span>Profile &amp; Preferences</span>
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
                  {userOrders.reduce((sum, ord) => sum + (ord.items || []).reduce((acc, it) => acc + it.quantity, 0), 0)}
                </div>
                <span className="text-[11px] text-gold-dark mt-1 block">Across {userOrders.length} orders</span>
              </div>

              <div className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xs">
                <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                  Craft House Points
                </span>
                <div className="font-serif text-3xl text-rosewood font-semibold mt-1">
                  ₹{user.rewardPoints ?? 0}
                </div>
                <span className="text-[11px] text-ink-muted mt-1 block">Usable at checkout</span>
              </div>

              {(() => {
                const customPiece = userOrders.find(
                  (o) =>
                    (o as any).isCustom ||
                    o.status === 'Hand-Stringing in Bihar' ||
                    o.items?.some((i) => i.category?.toLowerCase().includes('custom'))
                );
                if (customPiece) {
                  return (
                    <div className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xs">
                      <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                        Custom Piece
                      </span>
                      <div className="font-serif text-lg text-ink font-semibold mt-1 truncate">
                        {customPiece.items?.[0]?.name || 'Bespoke Loom Piece'}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium mt-1 block flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{customPiece.status}</span>
                      </span>
                    </div>
                  );
                }
                return (
                  <Link
                    href="/customise"
                    className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xs block hover:border-gold transition-colors group"
                  >
                    <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                      Custom Piece
                    </span>
                    <div className="font-serif text-lg text-ink font-semibold mt-1 group-hover:text-rosewood transition-colors">
                      None In-Loom
                    </div>
                    <span className="text-[11px] text-gold-dark font-medium mt-1 flex items-center gap-1">
                      <span>Design Bespoke Piece</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                );
              })()}

              <div className="bg-canvas-subtle p-5 rounded-2xl border border-border-gold shadow-2xl">
                <span className="text-[11px] uppercase tracking-refined text-ink-muted font-sans font-medium block">
                  Member Status
                </span>
                <div className="font-serif text-xl text-ink font-semibold mt-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-gold" />
                  <span>Circle Patron</span>
                </div>
                <span className="text-[11px] text-ink-muted mt-1 block">Since {user.memberSince || '2026'}</span>
              </div>
            </div>

            {/* Active Order Spotlight Banner */}
            {userOrders.length > 0 && (
              <div className="bg-gradient-to-r from-canvas-subtle to-canvas rounded-2xl border border-border-gold p-6 sm:p-8 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-refined text-rosewood font-bold">
                        Live Tracking Spotlight
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-champagne/20 text-ink text-[10px] font-semibold border border-gold/40">
                        {userOrders[0].status}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl text-ink font-normal mt-1">
                      Order #{userOrders[0].id}
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Estimated Arrival: <strong className="text-ink">{userOrders[0].estimatedDelivery || 'In Transit'}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(userOrders[0]);
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
                      &ldquo;{userOrders[0].artisanNote}&rdquo; —{' '}
                      <span className="text-gold-dark font-medium">
                        {userOrders[0].artisanName} ({userOrders[0].artisanLocation})
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
                    {(userOrders[0].items || []).map((item) => (
                      <div
                        key={item.id}
                        className="w-16 h-20 rounded-xl overflow-hidden bg-canvas border border-border-medium shrink-0 shadow-2xs"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="text-xs">
                      <span className="font-serif text-sm font-semibold text-ink block">
                        {userOrders[0].items?.[0]?.name || 'Kalajay Creation'}
                      </span>
                      <span className="text-[11px] text-ink-muted">
                        {formatINR(userOrders[0].totalAmount)} · {userOrders[0].paymentMethod}
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
                  <span>Manage {userAddresses.length} Addresses</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-3">
              <div>
                <h2 className="font-serif text-2xl text-ink font-normal">Order Chronicle & Provenance</h2>
                <p className="text-xs text-ink-muted">
                  Every order includes authentic artisan notes and calibrated transit milestones.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsClaimModalOpen(true);
                    setClaimError(null);
                    setClaimSuccess(null);
                    setClaimStep('input');
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-rosewood/40 hover:border-rosewood bg-blush/30 hover:bg-blush/50 text-rosewood text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Guest Order</span>
                </button>
                <span className="text-xs text-ink-muted">
                  Showing <strong className="text-ink">{userOrders.length}</strong> orders
                </span>
              </div>
            </div>

            {userOrders.length === 0 ? (
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
                {userOrders.map((order) => {
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

                        {/* Interactive Step Timeline & Shipment Information */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <h4 className="text-xs uppercase tracking-refined font-semibold text-ink">
                              Milestone Dispatch Chronicle {order.courier ? `(${order.courier}${order.awbNumber ? ` · AWB: ${order.awbNumber}` : ''})` : (order.awbNumber ? `(AWB: ${order.awbNumber})` : '')}
                            </h4>
                            {order.trackingUrl && (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[#9E5430] hover:underline font-semibold"
                              >
                                <span>Track on Carrier Website</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {order.customerShippingNote && (
                            <div className="mb-4 p-3 bg-canvas rounded-xl border border-border-gold text-xs text-ink-muted italic">
                              <strong className="text-ink not-italic">Delivery Note: </strong>
                              &ldquo;{order.customerShippingNote}&rdquo;
                            </div>
                          )}

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
                              {order.deliveryAddress?.fullName || 'Patron'}, {order.deliveryAddress?.street || ''},{' '}
                              {order.deliveryAddress?.city || ''} - {order.deliveryAddress?.pincode || ''}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              if (typeof window !== 'undefined') {
                                let authParam = '';
                                try {
                                  const idToken = await getIdToken();
                                  if (idToken) {
                                    authParam = `&auth=${encodeURIComponent(idToken)}`;
                                  }
                                } catch {}
                                window.open(`/api/orders/${order.id}/invoice?download=1${authParam}`, '_blank');
                              }
                            }}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-4">
              <div>
                <h2 className="font-serif text-2xl text-ink font-normal">Delivery Destinations</h2>
                <p className="text-xs text-ink-muted">
                  Saved delivery locations for seamless, one-tap orders across India.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="px-4 py-2.5 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {addressActionSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{addressActionSuccess}</span>
              </div>
            )}

            {addressActionError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <X className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addressActionError}</span>
              </div>
            )}

            {userAddresses.length === 0 ? (
              <div className="text-center py-12 bg-canvas-subtle rounded-2xl border border-dashed border-border-medium space-y-3">
                <MapPin className="w-8 h-8 text-rosewood mx-auto" />
                <p className="font-serif text-base text-ink">No Saved Destinations</p>
                <p className="text-xs text-ink-muted max-w-xs mx-auto">
                  Add your primary residence or studio delivery coordinates for swift handcrafted order dispatch.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-6 rounded-2xl border transition-all bg-canvas-subtle relative flex flex-col justify-between ${
                      addr.isDefault ? 'border-gold shadow-md ring-1 ring-gold/30' : 'border-border-subtle hover:border-border-medium'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-canvas text-ink text-[11px] font-semibold border border-border-subtle">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-gold-dark" />
                              <span>Default Destination</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs text-gold-dark hover:underline font-medium cursor-pointer"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-1.5 text-ink-faint hover:text-ink transition-colors cursor-pointer rounded-md hover:bg-canvas"
                            title="Edit address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(addr.id)}
                            className="p-1.5 text-ink-faint hover:text-rose-600 transition-colors cursor-pointer rounded-md hover:bg-canvas"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {confirmDeleteId === addr.id && (
                        <div className="mb-3 p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-xs space-y-2 animate-fade-in">
                          <p className="text-rose-900 font-medium">Remove this delivery destination?</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-semibold text-[11px] transition-colors"
                            >
                              Yes, Remove
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1 bg-canvas border border-border-medium hover:border-ink text-ink rounded-full font-medium text-[11px] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

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
            )}
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
                      {userPreferences.birthday || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- ADD / EDIT ADDRESS MODAL --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-canvas w-full max-w-lg rounded-2xl border border-border-gold p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain"
            data-lenis-prevent="true"
            style={{ WebkitOverflowScrolling: 'touch' }}
            role="dialog"
            aria-modal="true"
            aria-label={editingAddressId ? 'Edit Delivery Destination' : 'Add Delivery Destination'}
          >
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-ink font-normal mb-1">
              {editingAddressId ? 'Edit Delivery Destination' : 'Add Delivery Destination'}
            </h3>
            <p className="text-xs text-ink-muted mb-6">Enter safe transit destination details across India.</p>

            {addressActionError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addressActionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="flex items-center gap-3">
                {['Home', 'Studio', 'Work', 'Other'].map((lbl) => (
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
                  placeholder="e.g. Radhika Kapoor"
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
                  placeholder="+91 98765 43210"
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

              <div>
                <label htmlFor="addr-apartment" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  Apartment, Suite, Landmark (Optional)
                </label>
                <input
                  id="addr-apartment"
                  type="text"
                  placeholder="e.g. Landmark near Linking Road Police Station"
                  value={newAddress.apartment || ''}
                  onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
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
                    placeholder="e.g. Mumbai"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label htmlFor="addr-pincode" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    id="addr-pincode"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="400050"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="addr-state" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                  State / Union Territory *
                </label>
                <select
                  id="addr-state"
                  required
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs text-ink focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Other">Other State / UT</option>
                </select>
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
                  disabled={isSavingAddress}
                  className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-refined font-semibold transition-all shadow-xs cursor-pointer ${
                    isSavingAddress
                      ? 'bg-ink/60 text-canvas cursor-wait'
                      : 'bg-ink text-canvas hover:bg-gold hover:text-ink'
                  }`}
                >
                  {isSavingAddress
                    ? 'Saving Destination...'
                    : editingAddressId
                    ? 'Update Address'
                    : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LINK GUEST ORDER MODAL --- */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-canvas w-full max-w-md rounded-2xl border border-border-gold p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain"
            data-lenis-prevent="true"
            style={{ WebkitOverflowScrolling: 'touch' }}
            role="dialog"
            aria-modal="true"
            aria-label="Link a Previous Guest Order"
          >
            <button
              type="button"
              onClick={() => {
                setIsClaimModalOpen(false);
                setClaimOrderId('');
                setClaimOtp('');
                setClaimStep('input');
                setClaimError(null);
                setClaimSuccess(null);
              }}
              className="absolute top-5 right-5 p-1.5 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-ink font-normal mb-1">
              Link a Previous Guest Order
            </h3>
            <p className="text-xs text-ink-muted mb-6">
              Bind any order placed as a guest into your permanent patron portfolio and track artisan milestones.
            </p>

            {claimSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{claimSuccess}</span>
              </div>
            )}

            {claimError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{claimError}</span>
              </div>
            )}

            {claimStep === 'input' ? (
              <form onSubmit={handleInitiateClaim} className="space-y-4">
                <div>
                  <label htmlFor="claim-order-id" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    Order Reference Code *
                  </label>
                  <input
                    id="claim-order-id"
                    type="text"
                    required
                    placeholder="e.g. KJ-216626"
                    value={claimOrderId}
                    onChange={(e) => setClaimOrderId(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-xs font-mono uppercase text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="claim-save-addr"
                    type="checkbox"
                    checked={claimSaveAddress}
                    onChange={(e) => setClaimSaveAddress(e.target.checked)}
                    className="w-4 h-4 rounded text-rosewood accent-rosewood cursor-pointer"
                  />
                  <label htmlFor="claim-save-addr" className="text-xs text-ink cursor-pointer">
                    Save order's delivery destination to my saved addresses
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    className="px-4 py-2 text-xs text-ink-muted hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isClaiming}
                    className="px-6 py-2.5 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isClaiming ? 'Verifying Ownership...' : 'Link to Portfolio'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndClaim} className="space-y-4">
                <p className="text-xs text-ink-muted">
                  A 6-digit verification code was sent to the contact coordinates on file for order <strong>{claimOrderId}</strong>.
                </p>

                <div>
                  <label htmlFor="claim-otp-code" className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1">
                    Enter 6-Digit Verification Code *
                  </label>
                  <input
                    id="claim-otp-code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={claimOtp}
                    onChange={(e) => setClaimOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border-medium rounded-xl text-sm font-mono tracking-widest text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setClaimStep('input')}
                    className="text-xs text-rosewood hover:underline cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isClaiming}
                    className="px-6 py-2.5 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isClaiming ? 'Confirming...' : 'Verify & Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

