'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Check,
  CreditCard,
  Truck,
  MessageCircle,
  Zap,
  ArrowLeft,
  AlertCircle,
  Compass,
  Package,
  Clock,
  CheckCircle2,
  Plus,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth, Order } from '@/context/AuthContext';
import { BRAND_CONFIG, PRODUCTS } from '@/data/catalogue';
import { Address, areAddressesEqual } from '@/lib/checkout/addressModel';

const loadRazorpaySdk = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const existing = document.getElementById('razorpay-checkout-sdk');
    if (existing) {
      if ((window as any).Razorpay) return resolve(true);
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      setTimeout(() => resolve(Boolean((window as any).Razorpay)), 500);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, subtotal, deliveryFee, total, formatINR, clearCart } = useCart();
  const {
    user,
    firebaseUser,
    authStatus,
    isAuthenticated,
    isLoading,
    getIdToken,
    refreshSession,
    addAddress,
    addPatronOrder,
  } = useAuth();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'whatsapp'>('upi');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderGuestToken, setOrderGuestToken] = useState<string | null>(null);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Authentication Choice & Recovery States
  const [isExplicitGuest, setIsExplicitGuest] = useState(false);
  const [reauthNeeded, setReauthNeeded] = useState(false);

  // Address Selector & Save Checkbox States
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'custom'>('');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [addressSaveNotice, setAddressSaveNotice] = useState<string | null>(null);

  // Promotional Coupon Code State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponNotice, setCouponNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Preload Razorpay Checkout SDK on mount for instant zero-lag gateway opening
  useEffect(() => {
    loadRazorpaySdk().catch(() => {});
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponNotice(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'FIRST10') {
      const disc = Math.min(500, Math.round(subtotal * 0.1));
      setDiscountAmount(disc);
      setAppliedCoupon(code);
      setCouponNotice({ type: 'success', message: `Promo code "${code}" applied: ₹${disc} privilege discount.` });
    } else if (code === 'DIWALI15') {
      const disc = Math.min(1000, Math.round(subtotal * 0.15));
      setDiscountAmount(disc);
      setAppliedCoupon(code);
      setCouponNotice({ type: 'success', message: `Festive code "${code}" applied: ₹${disc} privilege discount.` });
    } else if (code === 'HEIRLOOM20') {
      const disc = Math.min(2000, Math.round(subtotal * 0.2));
      setDiscountAmount(disc);
      setAppliedCoupon(code);
      setCouponNotice({ type: 'success', message: `Patron privilege code "${code}" applied: ₹${disc} discount.` });
    } else {
      setCouponNotice({ type: 'error', message: `Promo code "${code}" is unrecognised, expired, or threshold not met.` });
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount) + deliveryFee;

  // Auto-populate and preselect default address from authenticated patron profile
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone.replace('+91', '').trim());

      const addresses = user.addresses || [];
      if (addresses.length > 0 && !selectedAddressId) {
        const def = addresses.find((a) => a.isDefault) || addresses[0];
        setSelectedAddressId(def.id);
        setName(def.fullName || user.name || '');
        setPhone((def.phone || user.phone || '').replace('+91', '').trim());
        setStreet(def.street || '');
        setApartment(def.apartment || '');
        setAddress([def.street, def.apartment].filter(Boolean).join(', '));
        setCity(def.city || '');
        setStateName(def.state || 'Maharashtra');
        setPincode(def.pincode || '');
      } else if (!street && !address && addresses.length > 0) {
        const def = addresses.find((a) => a.isDefault) || addresses[0];
        setStreet(def.street || '');
        setApartment(def.apartment || '');
        setAddress([def.street, def.apartment].filter(Boolean).join(', '));
        setCity(def.city || '');
        setStateName(def.state || 'Maharashtra');
        setPincode(def.pincode || '');
      }
    }
  }, [user, selectedAddressId]);

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setName(addr.fullName || user?.name || '');
    setPhone((addr.phone || user?.phone || '').replace('+91', '').trim());
    setStreet(addr.street || '');
    setApartment(addr.apartment || '');
    setAddress([addr.street, addr.apartment].filter(Boolean).join(', '));
    setCity(addr.city || '');
    setStateName(addr.state || 'Maharashtra');
    setPincode(addr.pincode || '');
    setSaveAddressToProfile(false);
  };

  const handleSelectCustomAddress = () => {
    setSelectedAddressId('custom');
    setStreet('');
    setApartment('');
    setAddress('');
    setCity('');
    setPincode('');
    setSaveAddressToProfile(false);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (authStatus === 'loading' || isLoading) {
      setSubmitError('Securing patron authentication credentials. Please wait a moment...');
      return;
    }
    setSubmitError(null);
    setReauthNeeded(false);

    // 1. Client pre-validation
    if (!name.trim()) {
      setSubmitError('Please enter your full name for the dispatch manifest.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number for courier SMS coordinates.');
      return;
    }

    const finalStreet = street.trim() || address.trim();
    const finalApartment = apartment.trim();
    const combinedAddressLine = [finalStreet, finalApartment].filter(Boolean).join(', ');

    if (!finalStreet || !city.trim() || !pincode.trim()) {
      setSubmitError('Please complete your delivery street address, city, and 6-digit postal pincode.');
      return;
    }
    if (cart.length === 0) {
      setSubmitError('Your shopping bag is empty. Please add handcrafted pieces before proceeding.');
      return;
    }

    setIsSubmitting(true);

    // 2. Transmit to Trusted Server Endpoint for Authoritative Price, Tax, Shipping & Inventory Check
    try {
      // 2. Check for cached profile without genuine Firebase session (Phase 2 & 3)
      if (!isExplicitGuest && user && !firebaseUser && authStatus !== 'authenticated') {
        setReauthNeeded(true);
        setSubmitError(
          'Patron Session Expired: Your portfolio profile is cached, but a verified Firebase authentication session is required to link this order to your account. Please sign in, or choose "Proceed as Guest Order".'
        );
        setIsSubmitting(false);
        return;
      }

      let authToken = '';
      const shouldAttemptAuth = !isExplicitGuest && (authStatus === 'authenticated' || Boolean(firebaseUser));

      if (shouldAttemptAuth && firebaseUser) {
        try {
          authToken = (await getIdToken()) || '';
          if (!authToken) {
            const refreshRes = await refreshSession();
            if (refreshRes.success && refreshRes.token) {
              authToken = refreshRes.token;
            } else {
              setReauthNeeded(true);
              setSubmitError(
                'Patron Session Expired: Your security session could not be refreshed. Please sign in to link this order to your portfolio, or explicitly proceed as a guest order.'
              );
              setIsSubmitting(false);
              return;
            }
          }
        } catch {
          const refreshRes = await refreshSession();
          if (refreshRes.success && refreshRes.token) {
            authToken = refreshRes.token;
          } else {
            setReauthNeeded(true);
            setSubmitError(
              'Patron Session Expired: Your security session could not be refreshed. Please sign in to link this order to your portfolio, or explicitly proceed as a guest order.'
            );
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Background save address to profile if checked by authenticated customer
      if (saveAddressToProfile && firebaseUser && authToken) {
        try {
          const addrToSave: Omit<Address, 'id'> = {
            label: 'Home',
            fullName: name.trim(),
            phone: cleanPhone.length === 10 ? `+91 ${cleanPhone}` : cleanPhone,
            street: finalStreet,
            apartment: finalApartment || undefined,
            city: city.trim(),
            state: stateName,
            pincode: pincode.trim(),
            isDefault: (user?.addresses || []).length === 0,
          };
          const isDuplicate = (user?.addresses || []).some(existing => areAddressesEqual(existing, addrToSave));
          if (!isDuplicate) {
            addAddress(addrToSave).catch(err => {
              console.warn('Deferred address save error:', err);
            });
          }
        } catch (saveErr) {
          console.warn('Deferred address save error:', saveErr);
        }
      }

      const clientOrderIdemp = `idemp_${name.trim().toLowerCase().replace(/\s+/g, '_')}_${cleanPhone}_${cart.map(i => i.code || i.id).join('_')}_${finalTotal}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-idempotency-key': clientOrderIdemp,
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const orderPayloadObj = {
        customerName: name.trim(),
        customerEmail: email.trim() || 'guest@kalajay.in',
        customerPhone: cleanPhone,
        shippingAddress: {
          addressLine: combinedAddressLine,
          city: city.trim(),
          state: stateName,
          pincode: pincode.trim(),
        },
        paymentMethod,
        items: cart.map(item => ({
          productId: item.code || item.id,
          variantCode: item.variantCode,
          variantId: item.variantId,
          variantLabel: item.variantLabel,
          attributes: item.attributes,
          quantity: item.quantity,
        })),
        ...(authToken && firebaseUser?.uid ? { userId: firebaseUser.uid } : {}),
        ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
        idempotencyKey: clientOrderIdemp,
      };

      let response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayloadObj),
      });

      // Controlled retry if token expired in-flight
      if (response.status === 401 && shouldAttemptAuth) {
        const refreshRes = await refreshSession();
        if (refreshRes.success && refreshRes.token) {
          headers['Authorization'] = `Bearer ${refreshRes.token}`;
          response = await fetch('/api/orders', {
            method: 'POST',
            headers,
            body: JSON.stringify(orderPayloadObj),
          });
        }
      }

      const res = await response.json();

      if (!response.ok || !res.success) {
        if (res.code === 'UNAUTHENTICATED_USER_ID_CLAIM' || res.code === 'AUTH_TOKEN_INVALID') {
          setReauthNeeded(true);
        }
        setSubmitError(
          res.error || 'Failed to record order in atelier database. Your card was not charged. Please try again.'
        );
        setIsSubmitting(false);
        return;
      }

      if (res.guestAccessToken) {
        setOrderGuestToken(res.guestAccessToken);
      }

      // 3. Initiate Razorpay Gateway Order for UPI & Card Payments
      let razorpayOpened = false;
      if (paymentMethod === 'upi' || paymentMethod === 'card') {
        try {
          const rzpInitRes = await fetch('/api/payment/razorpay/order', {
            method: 'POST',
            headers,
            body: JSON.stringify({ orderId: res.orderId }),
          });
          const rzpData = await rzpInitRes.json();

          if (rzpInitRes.ok && rzpData.success && rzpData.keyId) {
            const isSdkLoaded = await loadRazorpaySdk();
            if (isSdkLoaded && (window as any).Razorpay) {
              razorpayOpened = true;
              const options = {
                key: rzpData.keyId,
                amount: rzpData.amountPaise,
                currency: rzpData.currency || 'INR',
                name: 'Kalajay Craft House',
                description: `Handcrafted Luxury Heirloom · Order #${res.orderId}`,
                image: '/icon.png',
                order_id: rzpData.razorpayOrderId,
                handler: async function (paymentResponse: any) {
                  try {
                    const verifyRes = await fetch('/api/payment/razorpay/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: res.orderId,
                        razorpayOrderId: paymentResponse.razorpay_order_id,
                        razorpayPaymentId: paymentResponse.razorpay_payment_id,
                        razorpaySignature: paymentResponse.razorpay_signature,
                      }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                      setOrderNumber(res.orderId);
                      setIsPaymentVerified(true);
                      if (user) {
                        syncPatronOrder(res.orderId, res.total, res.order?.trackingAwb);
                      }
                      setStep('success');
                      clearCart();
                    } else {
                      setSubmitError(verifyData.error || 'Payment verification could not be confirmed.');
                    }
                  } catch {
                    setSubmitError('Verification network timeout. Your payment is being reconciled with the Craft House.');
                    setOrderNumber(res.orderId);
                    setStep('success');
                    clearCart();
                  } finally {
                    setIsSubmitting(false);
                  }
                },
                prefill: {
                  name: name.trim(),
                  email: email.trim() || undefined,
                  contact: cleanPhone,
                  method: paymentMethod === 'upi' ? 'upi' : paymentMethod === 'card' ? 'card' : undefined,
                },
                theme: {
                  color: '#9E5430',
                },
                modal: {
                  ondismiss: function () {
                    setIsSubmitting(false);
                  },
                },
              };

              const rzp = new (window as any).Razorpay(options);
              rzp.on('payment.failed', function (failResp: any) {
                setSubmitError(
                  failResp?.error?.description ||
                    'Payment was declined by your financial provider. You may retry or select another payment mode.'
                );
                setIsSubmitting(false);
              });
              rzp.open();
              return;
            }
          }
        } catch (gatewayErr) {
          console.warn('Razorpay initiation fallback notice:', gatewayErr);
        }
      }

      // 4. Default / Fallback Flow (WhatsApp Concierge or Mock Mode)
      setOrderNumber(res.orderId);
      if (user) {
        syncPatronOrder(res.orderId, res.total, res.order?.trackingAwb);
      }
      setStep('success');
      setIsSubmitting(false);
      clearCart();
    } catch (err: any) {
      setSubmitError(err?.message || 'Network error connecting to atelier server. Please try again.');
      setIsSubmitting(false);
    }
  };

  const syncPatronOrder = (id: string, amount: number, awb?: string) => {
    if (!user) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const newPatronOrder: Order = {
      id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalAmount: amount,
      status: 'Hand-Stringing in Bihar',
      estimatedDelivery: '3 to 5 Business Days',
      paymentMethod: paymentMethod === 'upi' ? 'UPI Instant' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'WhatsApp Direct',
      deliveryAddress: {
        id: `addr-${Date.now()}`,
        label: 'Home',
        fullName: name.trim(),
        phone: cleanPhone,
        street: address.trim(),
        city: city.trim(),
        state: stateName,
        pincode: pincode.trim(),
        isDefault: false,
      },
      items: cart.map(item => ({
        id: item.code || item.id,
        name: item.name,
        code: item.variantCode || item.code,
        category: item.category || 'Atelier',
        colorway: item.variantLabel || 'Classic Heirloom',
        variantLabel: item.variantLabel,
        attributes: item.attributes,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      trackingSteps: [
        {
          title: 'Ordered & Handcrafted to Order',
          location: 'Kalajay Digital Flagship',
          date: 'Just now',
          completed: true,
          description: 'Order confirmed and bead lot reserved.',
        },
        {
          title: 'Beads Counted & Hand-Strung',
          location: 'Kalajay Artisan Studio',
          date: 'Allocated to Loom',
          completed: false,
          current: true,
          description: 'Hand-strung by master artisan with tensioned crystal fiber.',
        },
        {
          title: 'Quality Check & Wax-Sealed',
          location: 'Craft House Finishing Studio',
          date: 'Scheduled',
          completed: false,
          description: 'Inspected under calibrated light, packed with canvas dust bag and wax seal.',
        },
        {
          title: 'Dispatched via Kalajay Atelier Team',
          location: 'Mumbai Hub',
          date: 'Pending',
          completed: false,
          description: 'Direct courier delivery with real-time tracking.',
        },
        {
          title: 'Delivered to Doorstep',
          location: `${city.trim()}, ${stateName}`,
          date: 'Expected in 3-5 days',
          completed: false,
          description: 'Safe hand-to-hand delivery with signature.',
        },
      ],
      artisanName: 'Master Artisan',
      artisanLocation: 'Bihar Craft Cluster',
      artisanNote: 'Queued for artisan loom allocation with tensioned 8-cord crystal fiber.',
      awbNumber: awb || `KJ-DISP-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };
    addPatronOrder(newPatronOrder);
  };

  if (step === 'success') {
    return (
      <div className="bg-canvas min-h-screen py-20 px-4">
        <div className="max-w-2xl mx-auto bg-canvas-subtle p-8 sm:p-12 rounded-sm border border-border-medium shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-blush text-rosewood flex items-center justify-center">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <span
              className={`text-[11px] uppercase tracking-refined font-bold block mb-1 ${
                isPaymentVerified ? 'text-emerald-700' : 'text-rosewood'
              }`}
            >
              {isPaymentVerified ? 'Payment Confirmed · Loom Allocated' : 'Order Confirmed · Loom Allocated'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-plum">
              Thank You for Supporting Handcrafted Art
            </h1>
            <p className="text-xs text-ink-light font-mono mt-2">
              Order Reference: <strong className="text-plum">{orderNumber}</strong>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-lg mx-auto">
            Your piece is now scheduled on our Craft House artisan loom. A confirmation letter with tracking details has been simulated for{' '}
            <strong className="text-plum">{email || 'your email'}</strong> and SMS updates to{' '}
            <strong className="text-plum">{phone || '+91 97405 40847'}</strong>.
          </p>

          <div className="p-5 bg-canvas rounded-sm border border-border-subtle text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-border-subtle/80 pb-2 font-medium text-plum">
              <span>Delivery Destination</span>
              <span>Kalajay Craft House Dispatch</span>
            </div>
            <p className="text-ink-muted">
              {name || 'Honoured Guest'} <br />
              {address ? `${address}, ${city}, ${stateName} - ${pincode}` : '14 Altamount Road, Mumbai, Maharashtra - 400026'}
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-border-subtle/80 text-[11px]">
              <span className="text-ink-muted">Payment Status:</span>
              {isPaymentVerified ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Payment Confirmed · {paymentMethod === 'upi' ? 'UPI Instant' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Online Gateway'}
                  </span>
                </span>
              ) : paymentMethod === 'whatsapp' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium font-sans">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Artisan Concierge Review (WhatsApp Direct)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium font-sans">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    Awaiting Payment Verification · {paymentMethod === 'upi' ? 'Instant UPI' : 'Card & Net Banking'}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {/* Primary Action: Prominent Track Creation Pill (Safe URL Fragment Hand-off Phase 4.2) */}
            <Link
              href={`/track?orderId=${orderNumber}${orderGuestToken ? `#token=${orderGuestToken}` : ''}`}
              className="w-full h-12 px-6 bg-[#9E5430] hover:bg-[#854526] text-[#FDFBF7] text-xs uppercase tracking-widest font-semibold rounded-full flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              <Compass className="w-4 h-4 text-[#E2B774]" />
              <span className="whitespace-nowrap">Track Creation on Artisan Loom</span>
            </Link>

            {orderGuestToken && (
              <div className="p-3 bg-blush/20 rounded-sm border border-border-subtle text-[11.5px] text-ink-muted text-center space-y-1">
                <span className="font-semibold text-rosewood block">Guest Order Placed</span>
                <p>
                  You can track this order at any time using your reference code, or link it directly into your Kalajay account when you sign in.
                </p>
              </div>
            )}

            {/* Secondary Actions: Harmonious Two-Column Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/account?tab=orders"
                className="w-full h-11 px-5 bg-[#FFFCF7] hover:bg-[#F5EFE6] border border-[#DED3C5] hover:border-[#9E5430] text-[#372921] hover:text-[#9E5430] text-xs uppercase tracking-wider font-medium rounded-full flex items-center justify-center gap-2 transition-colors"
              >
                <Package className="w-4 h-4 text-[#9E5430]" />
                <span className="whitespace-nowrap">View in My Portfolio</span>
              </Link>
              <Link
                href="/shop"
                className="w-full h-11 px-5 bg-[#372921] hover:bg-[#503A2E] text-[#FDFBF7] text-xs uppercase tracking-wider font-semibold rounded-full flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
              >
                <span className="whitespace-nowrap">Explore More Heirlooms</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E2B774]" />
              </Link>
            </div>

            {/* Support / Concierge Link: Refined and tasteful */}
            <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-center">
              <a
                href={`https://wa.me/919740540847?text=Hi%20Kalajay!%20I%20just%20placed%20order%20${orderNumber}%20on%20your%20digital%20flagship.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs text-emerald-800 hover:text-emerald-950 font-medium py-1 transition-colors group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Need artisan assistance? Chat with our liaison on WhatsApp →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Checkout Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs text-ink-light hover:text-rosewood">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Bag</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-ink-light">
            <Lock className="w-3.5 h-3.5 text-rosewood" />
            <span>Secure 256-Bit SSL Prototype Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Form Area (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Contact Details */}
            <div className="bg-canvas p-6 sm:p-8 rounded-sm border border-border-medium shadow-xs space-y-4">
              <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block">
                01 · Customer Contact
              </span>
              <h2 className="font-serif text-2xl text-plum">Where Should We Send Order Updates?</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label htmlFor="checkout-email" className="block text-ink-light font-medium mb-1">Email Address</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-ink-light font-medium mb-1">Mobile Number (For WhatsApp Tracking)</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-canvas p-6 sm:p-8 rounded-sm border border-border-medium shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block mb-0.5">
                    02 · Pan-India Delivery Destination
                  </span>
                  <h2 className="font-serif text-2xl text-plum">Shipping Address</h2>
                </div>
                {firebaseUser && (
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Patron Synchronized</span>
                  </span>
                )}
              </div>

              {/* Saved Address Selector for Authenticated Patrons */}
              {Array.isArray(user?.addresses) && user.addresses.length > 0 && (
                <div className="space-y-2.5 pb-2 border-b border-border-subtle">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs uppercase tracking-refined font-semibold text-plum">
                      Saved Delivery Destinations ({user.addresses.length})
                    </label>
                    <Link
                      href="/account?tab=addresses"
                      target="_blank"
                      className="text-[11px] text-rosewood hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>Manage Destinations</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {user.addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-sm border text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                            isSelected
                              ? 'border-rosewood bg-blush/20 ring-1 ring-rosewood shadow-2xs'
                              : 'border-border-subtle bg-canvas hover:border-border-medium'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-xs text-plum">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[9.5px] bg-gold/15 text-gold-dark font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-serif text-plum font-medium truncate">{addr.fullName}</h4>
                            <p className="text-[11px] text-ink-muted leading-tight mt-1 line-clamp-2">
                              {addr.street}
                              {addr.apartment ? `, ${addr.apartment}` : ''}
                            </p>
                            <p className="text-[11px] text-ink-light font-mono mt-1">
                              {addr.city}, {addr.pincode}
                            </p>
                          </div>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleSelectCustomAddress}
                      className={`p-3.5 rounded-sm border text-left transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer min-h-[100px] ${
                        selectedAddressId === 'custom'
                          ? 'border-rosewood bg-blush/20 ring-1 ring-rosewood'
                          : 'border-dashed border-border-medium bg-canvas hover:border-rosewood text-ink-muted hover:text-rosewood'
                      }`}
                    >
                      <Plus className="w-4 h-4 text-rosewood" />
                      <span className="text-xs font-semibold text-plum">Enter a Different Address</span>
                      <span className="text-[10px] text-ink-light text-center">Dispatch to new residence or studio</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <label htmlFor="checkout-recipient-name" className="block text-ink-light font-medium mb-1">
                    Full Name of Recipient *
                  </label>
                  <input
                    id="checkout-recipient-name"
                    type="text"
                    required
                    placeholder="e.g. Radhika Kapoor"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-street" className="block text-ink-light font-medium mb-1">
                    Street Address & House / Flat / Suite No. *
                  </label>
                  <input
                    id="checkout-street"
                    type="text"
                    required
                    placeholder="e.g. B-402, Signature Palms, Linking Road"
                    value={street || address}
                    onChange={e => {
                      setStreet(e.target.value);
                      setAddress(e.target.value);
                    }}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-apartment" className="block text-ink-light font-medium mb-1">
                    Apartment, Suite, Landmark (Optional)
                  </label>
                  <input
                    id="checkout-apartment"
                    type="text"
                    placeholder="e.g. Landmark near Linking Road Police Station"
                    value={apartment}
                    onChange={e => setApartment(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="checkout-city" className="block text-ink-light font-medium mb-1">City *</label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-state" className="block text-ink-light font-medium mb-1">State / UT *</label>
                    <select
                      id="checkout-state"
                      value={stateName}
                      onChange={e => setStateName(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] cursor-pointer transition-colors"
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
                  <div>
                    <label htmlFor="checkout-pincode" className="block text-ink-light font-medium mb-1">PIN Code *</label>
                    <input
                      id="checkout-pincode"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="400050"
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-3 bg-[#FFFCF7] border border-[#DED3C5] hover:border-[#A99583] rounded-sm text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Save Address to Profile Checkbox (Authenticated Patrons) or Guest Info */}
                {firebaseUser ? (
                  <div className="pt-2">
                    <label htmlFor="checkout-save-address" className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        id="checkout-save-address"
                        type="checkbox"
                        checked={saveAddressToProfile}
                        onChange={e => setSaveAddressToProfile(e.target.checked)}
                        className="w-4 h-4 rounded text-rosewood accent-rosewood focus:ring-rosewood cursor-pointer"
                      />
                      <span className="text-xs text-plum font-medium">
                        Save this delivery destination to my profile for future handcrafted orders
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2 text-[11px] text-ink-muted">
                    <Lock className="w-3.5 h-3.5 text-rosewood shrink-0" />
                    <span>
                      Checking out as Guest. <Link href="/login?redirect=/checkout" className="text-rosewood underline font-medium hover:text-plum">Sign in</Link> or create an account to save delivery destinations to your profile.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Payment Method Prototype */}
            <div className="bg-canvas p-6 sm:p-8 rounded-sm border border-border-medium shadow-xs space-y-4">
              <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block">
                03 · Payment Method Simulation
              </span>
              <h2 className="font-serif text-2xl text-plum">Select Payment Mode</h2>

              <div className="space-y-3 text-xs font-sans">
                <label
                  htmlFor="pay-upi"
                  className={`p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-rosewood bg-blush/20 ring-1 ring-rosewood' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="pay-upi"
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-rosewood"
                    />
                    <div>
                      <span className="font-semibold text-plum block">Instant UPI (GPay, PhonePe, Paytm, BHIM)</span>
                      <span className="text-ink-light">Zero transaction fees. Instant QR code generation.</span>
                    </div>
                  </div>
                  <Zap className="w-4 h-4 text-rosewood" />
                </label>

                <label
                  htmlFor="pay-card"
                  className={`p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-rosewood bg-blush/20 ring-1 ring-rosewood' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="pay-card"
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-rosewood"
                    />
                    <div>
                      <span className="font-semibold text-plum block">Credit / Debit Card & Net Banking</span>
                      <span className="text-ink-light">Visa, MasterCard, RuPay, Amex accepted across India.</span>
                    </div>
                  </div>
                  <CreditCard className="w-4 h-4 text-ink-light" />
                </label>

                <label
                  htmlFor="pay-whatsapp"
                  className={`p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'whatsapp' ? 'border-rosewood bg-blush/20 ring-1 ring-rosewood' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="pay-whatsapp"
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="accent-rosewood"
                    />
                    <div>
                      <span className="font-semibold text-plum block">WhatsApp Direct Confirmation</span>
                      <span className="text-ink-light">Review order with an artisan liaison before paying.</span>
                    </div>
                  </div>
                  <MessageCircle className="w-4 h-4 text-rosewood" />
                </label>
              </div>

              <div className="pt-2 space-y-3">
                {reauthNeeded && (
                  <div className="p-4 bg-amber-50/95 border border-amber-300 rounded-sm space-y-3 animate-fade-in text-xs text-[#372921]">
                    <div className="flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-amber-900 mb-0.5">Patron Session Expired</strong>
                        <p className="text-[11.5px] text-[#503A2E] leading-relaxed">
                          Your security session has ended. To bind this order to your portfolio and access live loom tracking, please sign in. Alternatively, you may proceed immediately as an unlinked guest order.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Link
                        href="/login?redirect=/checkout"
                        className="px-4 py-2 bg-[#9E5430] hover:bg-[#854526] text-white text-[11px] uppercase tracking-wider font-semibold rounded-full transition-colors"
                      >
                        Sign In to Portfolio
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExplicitGuest(true);
                          setReauthNeeded(false);
                          setSubmitError(null);
                        }}
                        className="px-4 py-2 bg-transparent hover:bg-black/5 border border-[#DED3C5] text-[#372921] text-[11px] uppercase tracking-wider font-medium rounded-full transition-colors cursor-pointer"
                      >
                        Proceed as Guest Order
                      </button>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-sm text-xs flex items-center gap-2.5 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 text-xs uppercase tracking-monumental font-semibold rounded-full transition-all shadow-md flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-[#76695F] text-white/80 cursor-not-allowed opacity-90'
                      : 'bg-[#372921] hover:bg-[#503A2E] text-[#F7F3EC] cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E2B774]" />
                      <span>
                        {paymentMethod === 'upi'
                          ? 'Opening UPI Payment Gateway...'
                          : paymentMethod === 'card'
                          ? 'Connecting to Card Gateway...'
                          : 'Securing Atelier Loom Reservation...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{`Place Order & Confirm Handcraft · ${formatINR(finalTotal)}`}</span>
                    </>
                  )}
                </button>

                {/* DPDP Act 2023 Transaction Notice */}
                <div className="p-3 bg-canvas rounded-sm border border-border-subtle flex items-start gap-2.5 text-[11px] text-ink-muted leading-relaxed">
                  <Lock className="w-3.5 h-3.5 text-rosewood shrink-0 mt-0.5" />
                  <p>
                    <strong>Statutory DPDP Notice:</strong> Your shipping destination and contact details are processed strictly for handcraft loom allocation, GST tax invoicing (Sec 36, CGST Act 2017), and in-house courier transit. Payments are secured via 256-bit encrypted, PCI-DSS Level 1 RBI-compliant gateways.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Preview (Span 5) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-canvas-subtle p-6 sm:p-8 rounded-sm border border-border-medium shadow-xl space-y-6">
              <h3 className="font-serif text-2xl text-plum border-b border-border-subtle pb-4">
                Items in This Shipment ({cart.length})
              </h3>

              <div className="max-h-72 overflow-y-auto divide-y divide-border-subtle/70 space-y-3">
                {cart.map(item => (
                  <div key={item.key} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-canvas rounded-sm overflow-hidden shrink-0 border border-border-subtle">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm text-plum truncate max-w-[160px]">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-ink-light block">
                          Qty: {item.quantity} {item.variantLabel ? `· ${item.variantLabel}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif font-semibold text-plum shrink-0">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promotional Coupon Box */}
              <div className="border-t border-border-subtle pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-plum font-semibold uppercase tracking-wider text-[10.5px]">Promotional Voucher / Privilege Code</span>
                  {appliedCoupon && (
                    <span className="text-emerald-700 font-mono text-[10.5px] font-bold">
                      {appliedCoupon} ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. FIRST10, DIWALI15"
                    className="flex-1 px-3 py-2 bg-canvas border border-border-medium rounded-sm text-xs font-mono uppercase text-plum focus:outline-none focus:border-rosewood"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {couponNotice && (
                  <p className={`text-[11px] leading-tight ${couponNotice.type === 'success' ? 'text-emerald-800 font-medium' : 'text-rose-700'}`}>
                    {couponNotice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 text-xs text-ink border-t border-border-subtle pt-4">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-medium text-plum">{formatINR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Privilege Discount ({appliedCoupon})</span>
                    <span className="font-medium font-serif">- {formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink-muted">Pan-India Delivery</span>
                  <span className="font-medium text-plum">
                    {deliveryFee === 0 ? <span className="text-rosewood font-semibold">FREE</span> : formatINR(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-plum border-t border-border-subtle pt-3">
                  <span>Grand Total</span>
                  <span className="font-serif text-2xl text-rosewood">{formatINR(finalTotal)}</span>
                </div>
              </div>

              <div className="p-4 bg-canvas rounded-sm border border-border-subtle text-[11px] text-ink-light space-y-1">
                <span className="font-medium text-plum block">Authentic Handmade Notice</span>
                <p>
                  As each piece is made to order, please allow 3-5 business days for hand-weaving before dispatch.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

