'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Key,
  Database,
  Truck,
  CreditCard,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Save,
  RefreshCw,
  Code,
  ShieldCheck,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { getFirestoreStoreSettings, saveFirestoreStoreSettings } from '@/lib/firestore';
import { KALAJAY_BUSINESS_PROFILE, validateGstin } from '@/lib/businessProfile';

export default function SettingsStoreView() {
  const { logAction, can } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'identity' | 'seams' | 'security'>('seams');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Store identity form state
  const [storeName, setStoreName] = useState(KALAJAY_BUSINESS_PROFILE.tradeName);
  const [legalEntity, setLegalEntity] = useState(KALAJAY_BUSINESS_PROFILE.legalEntityName);
  const [gstin, setGstin] = useState(KALAJAY_BUSINESS_PROFILE.gstin);
  const [supportEmail, setSupportEmail] = useState(KALAJAY_BUSINESS_PROFILE.contactEmail);
  const [supportPhone, setSupportPhone] = useState(KALAJAY_BUSINESS_PROFILE.supportPhone);
  const [mumbaiAddress, setMumbaiAddress] = useState(KALAJAY_BUSINESS_PROFILE.mumbaiStudioAddress);
  const [biharHubAddress, setBiharHubAddress] = useState(KALAJAY_BUSINESS_PROFILE.atelierHubAddress);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getFirestoreStoreSettings().then((settings) => {
      if (settings && isMounted) {
        if (settings.storeName) setStoreName(settings.storeName);
        if (settings.legalEntity) setLegalEntity(settings.legalEntity);
        if (settings.gstin) setGstin(settings.gstin);
        if (settings.supportEmail) setSupportEmail(settings.supportEmail);
        if (settings.supportPhone) setSupportPhone(settings.supportPhone);
        if (settings.mumbaiAddress) setMumbaiAddress(settings.mumbaiAddress);
        if (settings.biharHubAddress) setBiharHubAddress(settings.biharHubAddress);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Integration simulator state
  const [testingSeam, setTestingSeam] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ seam: string; status: 'ok' | 'error'; message: string; payload: any } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (can && !can('settings.store', 'edit')) {
      showToast('Unauthorized: Modifying legal identity & GSTIN requires settings.store privileges.');
      return;
    }
    const cleanGstin = gstin.trim().toUpperCase();
    if (!validateGstin(cleanGstin)) {
      showToast('Invalid GSTIN format. Expected format: 27AAAAA0000A1Z0 (15 alphanumeric characters).');
      return;
    }
    setIsSaving(true);
    try {
      await saveFirestoreStoreSettings({
        storeName,
        legalEntity,
        gstin: cleanGstin,
        supportEmail,
        supportPhone,
        mumbaiAddress,
        biharHubAddress,
        shippingThreshold: 599,
        standardFreight: 79,
        dispatchHours: 48,
        returnDays: 7,
      });
      logAction('UPDATE_STORE_IDENTITY', 'settings', `Updated registered store identity and GSTIN (${cleanGstin}) in Firestore`);
      showToast('Store identity and registered addresses saved successfully to Firestore');
    } catch (err) {
      showToast('Failed to persist store identity to Firestore');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateHandshake = (seamName: string) => {
    setTestingSeam(seamName);
    setTestResult(null);

    setTimeout(() => {
      setTestingSeam(null);
      if (seamName === 'erp') {
        setTestResult({
          seam: 'Master Inventory ERP Sync (PROPOSED)',
          status: 'ok',
          message: 'HTTP 200 OK — Handshake verified. Connected to mock ERP endpoint. Latency: 42ms.',
          payload: {
            endpoint: 'https://erp.kalajay.internal/api/v1/inventory/reconcile',
            status: 'ONLINE_HEALTHY',
            synced_skus: 69,
            raw_material_items: 5,
            bihar_active_looms: 4,
            timestamp: new Date().toISOString(),
          },
        });
        logAction('SIMULATE_ERP_HANDSHAKE', 'settings', 'Simulated ERP inventory sync handshake');
        showToast('ERP Handshake successful: 69 finished goods & 5 raw materials reconciled.');
      } else if (seamName === 'courier') {
        setTestResult({
          seam: 'Kalajay In-House Atelier Dispatch & Logistics',
          status: 'ok',
          message: 'HTTP 201 Created — In-house consignment generation & dispatch manifest booking valid.',
          payload: {
            carrier: 'Kalajay In-House Logistics Team',
            contract_service: 'Atelier White-Glove Delivery (Pan-India Direct)',
            manifest_pincode_origin: '400018',
            rate_card: 'Luxury Fragile Standard (Wax-Sealed Box)',
            mock_awb_generated: 'KJ-DISP-78902144',
          },
        });
        logAction('SIMULATE_COURIER_HANDSHAKE', 'settings', 'Simulated in-house atelier dispatch handshake');
        showToast('In-House Logistics test passed: Kalajay atelier dispatch manifest contracts verified.');
      } else if (seamName === 'razorpay') {
        setTestResult({
          seam: 'Payment Gateway Webhook Verification (PROPOSED)',
          status: 'ok',
          message: 'HMAC-SHA256 Signature verified — Webhook payload signature validated.',
          payload: {
            gateway: 'Razorpay / UPI Instant',
            signature_algorithm: 'HMAC-SHA256',
            event: 'order.payment.captured',
            idempotency_key: 'idemp_99182a7b8c',
            status: 'VERIFIED',
          },
        });
        logAction('SIMULATE_PAYMENT_WEBHOOK', 'settings', 'Simulated payment gateway webhook validation');
        showToast('Payment webhook verified: HMAC signature validation successful.');
      } else if (seamName === 'whatsapp') {
        setTestResult({
          seam: 'WhatsApp Business Cloud API (PROPOSED)',
          status: 'ok',
          message: 'Meta Graph API v19.0 — HSM Message Template approval verified.',
          payload: {
            provider: 'Meta WhatsApp Cloud API',
            phone_number_id: '919740540847',
            template_name: 'kalajay_loom_milestone_update',
            sample_recipient: '+91 98201 44892',
            delivery_status: 'SENT_MOCK',
          },
        });
        logAction('SIMULATE_WHATSAPP_HANDSHAKE', 'settings', 'Simulated WhatsApp Cloud API milestone dispatch');
        showToast('WhatsApp API verified: Artisan loom video milestone template active.');
      }
    }, 900);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#372921] text-white px-5 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 flex items-center gap-3 text-xs animate-slide-up">
          <Sparkles className="w-4 h-4 text-[#C49A45]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Architecture &amp; Seams</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Store Identity &amp; System Integration Seams
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Registered business compliance, and integration contracts for Master ERP, In-House Dispatch, Razorpay, and WhatsApp Cloud API.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold">
            PROPOSED / SUBJECT TO FUNCTIONAL REVIEW
          </span>
        </div>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('seams')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'seams'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backend &amp; ERP Integration Seams</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'identity'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Store Identity &amp; Legal Entity</span>
        </button>
      </div>

      {/* 3. SEAMS TAB (ARCHITECTURAL CONTRACTS) */}
      {activeTab === 'seams' && (
        <div className="space-y-6">
          {/* Architecture Banner */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Architectural Handover Seams — Typed Mock Repository Layer</span>
            </div>
            <p className="leading-relaxed text-[11px] text-blue-800">
              The unified management console is built UI-first with fully typed domain models. The 4 seams below document the exact data contracts, endpoints, and event structures required when connecting this frontend prototype to Kalajay's production PostgreSQL/Supabase database and Bihar atelier operations ERP.
            </p>
          </div>

          {/* Seams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SEAM 1: ERP INVENTORY SYNC */}
            <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#9E5430]" />
                    <h3 className="font-serif text-sm font-semibold text-[#372921]">
                      1. Master Inventory &amp; Loom ERP Sync
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    ERP Hook
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <p className="text-[#76695F] text-[11px] leading-relaxed">
                    Bi-directional sync between ecommerce available stock and the Bihar production loom ledger. Orders place a reservation hold on finished goods; loom completions credit inventory.
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE2D8] font-mono text-[10.5px] text-[#372921]">
                    POST /api/v1/erp/inventory/reconcile<br />
                    GET /api/v1/erp/looms/active-status
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE2D8] flex items-center justify-between">
                <span className="text-[10.5px] text-[#76695F]">Status: Simulated Mock Store</span>
                <button
                  type="button"
                  disabled={testingSeam === 'erp'}
                  onClick={() => handleSimulateHandshake('erp')}
                  className="px-3 py-1.5 rounded-lg bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {testingSeam === 'erp' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Test Handshake</span>
                </button>
              </div>
            </div>

            {/* SEAM 2: IN-HOUSE ATELIER LOGISTICS */}
            <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#9E5430]" />
                    <h3 className="font-serif text-sm font-semibold text-[#372921]">
                      2. Kalajay In-House Logistics &amp; Dispatch Seam
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Self-Managed Logistics
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <p className="text-[#76695F] text-[11px] leading-relaxed">
                    Self-managed shipment manifest booking, custom consignment generation, direct atelier team coordination, and live patron timeline milestone transitions.
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE2D8] font-mono text-[10.5px] text-[#372921]">
                    POST /api/v1/logistics/in-house/manifest<br />
                    POST /api/v1/logistics/dispatch/milestone
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE2D8] flex items-center justify-between">
                <span className="text-[10.5px] text-[#76695F]">Carrier: Kalajay Direct (In-House Team)</span>
                <button
                  type="button"
                  disabled={testingSeam === 'courier'}
                  onClick={() => handleSimulateHandshake('courier')}
                  className="px-3 py-1.5 rounded-lg bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {testingSeam === 'courier' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Test Handshake</span>
                </button>
              </div>
            </div>

            {/* SEAM 3: RAZORPAY PAYMENT WEBHOOKS */}
            <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#9E5430]" />
                    <h3 className="font-serif text-sm font-semibold text-[#372921]">
                      3. Razorpay &amp; UPI Webhook Verification
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Payment Gateway
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <p className="text-[#76695F] text-[11px] leading-relaxed">
                    Cryptographic HMAC-SHA256 signature verification on payment callbacks. Transitions order status to `paid` and allocates materials without race conditions.
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE2D8] font-mono text-[10.5px] text-[#372921]">
                    POST /api/v1/payments/razorpay/webhook<br />
                    Header: X-Razorpay-Signature: [HMAC_SHA256]
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE2D8] flex items-center justify-between">
                <span className="text-[10.5px] text-[#76695F]">Auth: HMAC-SHA256</span>
                <button
                  type="button"
                  disabled={testingSeam === 'razorpay'}
                  onClick={() => handleSimulateHandshake('razorpay')}
                  className="px-3 py-1.5 rounded-lg bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {testingSeam === 'razorpay' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Test Handshake</span>
                </button>
              </div>
            </div>

            {/* SEAM 4: WHATSAPP BUSINESS CLOUD API */}
            <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#9E5430]" />
                    <h3 className="font-serif text-sm font-semibold text-[#372921]">
                      4. WhatsApp Business Cloud API (Meta)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Concierge API
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <p className="text-[#76695F] text-[11px] leading-relaxed">
                    Automated milestone updates with patron opted-in templates: Order confirmation, artisan loom weaving video snippet, and dispatch AWB tracking link.
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE2D8] font-mono text-[10.5px] text-[#372921]">
                    POST https://graph.facebook.com/v19.0/{'{phone_id}'}/messages<br />
                    Template: kalajay_loom_milestone_update
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE2D8] flex items-center justify-between">
                <span className="text-[10.5px] text-[#76695F]">Line: +91 97405 40847</span>
                <button
                  type="button"
                  disabled={testingSeam === 'whatsapp'}
                  onClick={() => handleSimulateHandshake('whatsapp')}
                  className="px-3 py-1.5 rounded-lg bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {testingSeam === 'whatsapp' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Test Handshake</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Payload Inspector (When test clicked) */}
          {testResult && (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-2 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{testResult.seam}: {testResult.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTestResult(null)}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  Clear
                </button>
              </div>
              <pre className="p-3 bg-stone-900 text-stone-100 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto">
{JSON.stringify(testResult.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 4. STORE IDENTITY TAB */}
      {activeTab === 'identity' && (
        <form onSubmit={handleSaveIdentity} className="bg-white p-6 rounded-2xl border border-[#DED3C5] shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#372921] mb-1">Brand Public Name</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#372921] mb-1">Legal Registered Entity</label>
              <input
                type="text"
                value={legalEntity}
                onChange={e => setLegalEntity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#372921] mb-1">GSTIN (Maharashtra &amp; Pan-India)</label>
              <input
                type="text"
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs font-mono font-bold text-[#9E5430]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#372921] mb-1">Official Concierge Support Line</label>
              <input
                type="text"
                value={supportPhone}
                onChange={e => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#372921] mb-1">Principal Office &amp; Packing Studio (Mumbai)</label>
            <input
              type="text"
              value={mumbaiAddress}
              onChange={e => setMumbaiAddress(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#372921] mb-1">Artisan Loom Cluster Hub (Bihar)</label>
            <input
              type="text"
              value={biharHubAddress}
              onChange={e => setBiharHubAddress(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
            />
          </div>

          <div className="pt-4 border-t border-[#DED3C5] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Registered Details</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

