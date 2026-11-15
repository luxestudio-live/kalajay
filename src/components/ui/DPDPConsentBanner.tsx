'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSmoothScroll } from '@/components/motion/SmoothScroll';
import {
  ShieldCheck,
  Lock,
  Sliders,
  Check,
  X,
  Languages,
  MessageCircle,
  BarChart3,
  FileText,
  ExternalLink,
} from 'lucide-react';

export interface DPDPPreferences {
  version: string;
  essential: boolean; // Always true
  concierge: boolean; // WhatsApp & SMS order transit updates
  analytics: boolean; // Anonymous atelier catalogue browsing
  timestamp: string;
  language: 'en' | 'hi';
}

const STORAGE_KEY = 'kalajay_dpdp_consent_v1';

const STRINGS = {
  en: {
    bannerTitle: 'Patron Privacy & DPDP Notice',
    bannerText:
      'In compliance with India’s DPDP Act (2023), we process minimal data strictly required for crafting, tax invoicing, and transit.',
    acceptAll: 'Accept All',
    customize: 'Preferences',
    essentialOnly: 'Essential Only',
    privacyLink: 'Policy',
    modalTitle: 'Data Principal Consent Preferences',
    modalSubtitle:
      'Manage how Kalajay Craft House processes your personal information. You may modify or withdraw your affirmative consent at any time.',
    statutoryNotice:
      'Digital Personal Data Protection Act, 2023 (Section 5 & 6) · Data Fiduciary: Kalajay Creations Pvt Ltd',
    langToggle: 'हिन्दी में देखें (Hindi)',
    essentialTitle: 'Essential Operational & Security Data',
    essentialDesc:
      'Strictly necessary to maintain your handcrafted shopping bag, authenticate patron sessions, secure checkout, and comply with Indian GST tax invoicing mandates (Section 36, CGST Act 2017). Cannot be disabled.',
    alwaysActive: 'Always Active',
    conciergeTitle: 'Artisan Concierge & Transit Dispatch (WhatsApp / SMS)',
    conciergeDesc:
      'Allows our studio to transmit real-time loom weaving photographs, wax-seal verification, and Kalajay in-house dispatch transit milestones directly to your mobile device.',
    analyticsTitle: 'Anonymous Atelier Navigation Insights',
    analyticsDesc:
      'Helps us understand which hand-strung collections require loom re-orders and queue allocation. Aggregated, strictly privacy-preserving, and never shared with commercial advertising brokers.',
    savePreferences: 'Save My Choices',
    close: 'Close',
    withdrawnNotice: 'Preferences saved. Your consent record has been updated.',
    dpoContact: 'Grievance Officer: privacy@kalajay.in · SLA: 48h acknowledgment',
  },
  hi: {
    bannerTitle: 'संरक्षक गोपनीयता (DPDP सूचना)',
    bannerText:
      'DPDP अधिनियम (2023) के तहत हम केवल ऑर्डर, बिलिंग और डिलीवरी हेतु आवश्यक न्यूनतम डेटा संसाधित करते हैं।',
    acceptAll: 'सभी स्वीकारें',
    customize: 'वरीयताएँ',
    essentialOnly: 'केवल आवश्यक',
    privacyLink: 'नीति',
    modalTitle: 'डेटा स्वामी सहमति प्राथमिकताएँ',
    modalSubtitle:
      'कलाजय क्राफ्ट हाउस आपके व्यक्तिगत विवरण को कैसे संसाधित करता है, इसे प्रबंधित करें। आप किसी भी समय अपनी सहमति संशोधित या वापस ले सकते हैं।',
    statutoryNotice:
      'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (धारा 5 एवं 6) · डेटा प्रत्ययी: कलाजय क्रिएशन्स प्रा. लि.',
    langToggle: 'Switch to English',
    essentialTitle: 'अनिवार्य परिचालन एवं सुरक्षा डेटा',
    essentialDesc:
      'आपके शॉपिंग बैग को बनाए रखने, सत्र प्रमाणित करने, सुरक्षित चेकआउट और भारतीय जीएसटी कर चालान (धारा 36, सीजीएसटी अधिनियम 2017) का अनुपालन करने के लिए नितांत आवश्यक। इसे निष्क्रिय नहीं किया जा सकता।',
    alwaysActive: 'सदैव सक्रिय',
    conciergeTitle: 'कारीगर दरबान एवं पारगमन सूचनाएँ (व्हाट्सएप / एसएमएस)',
    conciergeDesc:
      'हमारे स्टूडियो को सीधे आपके फोन पर वास्तविक समय में करघा बुनाई, पैकेजिंग और कलाजय आंतरिक डिलीवरी मील के पत्थर साझा करने की अनुमति देता है।',
    analyticsTitle: 'गुमनाम शिल्प नेविगेशन विश्लेषण',
    analyticsDesc:
      'हमें यह समझने में मदद करता है कि किन हस्तनिर्मित कृतियों के लिए करघा पुनः आवंटन आवश्यक है। यह पूरी तरह गोपनीय है और विज्ञापन दलालों के साथ कभी साझा नहीं किया जाता।',
    savePreferences: 'मेरी पसंद सहेजें',
    close: 'बंद करें',
    withdrawnNotice: 'वरीयताएँ सहेजी गईं। आपका सहमति रिकॉर्ड अद्यतन कर दिया गया है।',
    dpoContact: 'शिकायत अधिकारी: privacy@kalajay.in · पावती: 48 घंटे के भीतर',
  },
};

export default function DPDPConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Granular toggles
  const [conciergeConsent, setConciergeConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { lenis } = useSmoothScroll();

  // Scroll lock and Lenis pause when Preferences modal is open
  useEffect(() => {
    if (!showModal) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    lenis?.stop();
    const winLenis = typeof window !== 'undefined'
      ? (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis
      : undefined;
    winLenis?.stop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
      lenis?.start();
      winLenis?.start();
    };
  }, [showModal, lenis]);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: DPDPPreferences = JSON.parse(stored);
        setConciergeConsent(parsed.concierge);
        setAnalyticsConsent(parsed.analytics);
        if (parsed.language) setLanguage(parsed.language);

        // Sync stored consent choice with Microsoft Clarity (DPDP compliance)
        try {
          const clarityFn = (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity;
          if (typeof clarityFn === 'function') {
            clarityFn('consentv2', {
              ad_Storage: 'denied',
              analytics_Storage: parsed.analytics ? 'granted' : 'denied',
            });
          }
        } catch {
          // ignore clarity sync error
        }
      } else {
        // First visit: show polite non-intrusive banner
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }

    // Global listener so user can re-open consent anytime from footer or account
    const handleOpenPreferences = () => {
      setShowModal(true);
      setShowBanner(false);
    };

    window.addEventListener('open-dpdp-preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('open-dpdp-preferences', handleOpenPreferences);
    };
  }, []);

  const saveConsent = (essentialOnly = false, acceptAll = false) => {
    const preferences: DPDPPreferences = {
      version: '2025.1',
      essential: true,
      concierge: acceptAll ? true : essentialOnly ? false : conciergeConsent,
      analytics: acceptAll ? true : essentialOnly ? false : analyticsConsent,
      timestamp: new Date().toISOString(),
      language,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // storage unavailable fallback
    }

    // Sync updated consent choice with Microsoft Clarity (DPDP compliance)
    try {
      const clarityFn = (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity;
      if (typeof clarityFn === 'function') {
        clarityFn('consentv2', {
          ad_Storage: 'denied',
          analytics_Storage: preferences.analytics ? 'granted' : 'denied',
        });
      }
    } catch {
      // ignore clarity sync error
    }

    setShowBanner(false);
    setShowModal(false);

    // Show luxury feedback pill
    setToastMessage(STRINGS[language].withdrawnNotice);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  if (!mounted) return null;

  const t = STRINGS[language];

  return (
    <>
      {/* Toast Notification upon Saving */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#372921] text-[#F7F3EC] px-5 py-2.5 rounded-full border border-[#D4AF37]/40 shadow-2xl text-xs font-sans flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Bottom Statutory Banner (Refined, Compact Luxury Badge) */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Data Privacy and DPDP Consent Banner"
          className="fixed bottom-3 sm:bottom-6 left-3 sm:left-6 z-40 w-auto max-w-[calc(100vw-84px)] sm:max-w-[380px] bg-[#372921]/95 text-[#F7F3EC] backdrop-blur-md p-3 sm:p-3.5 rounded-xl border border-[#D4AF37]/35 shadow-[0_12px_36px_rgba(0,0,0,0.35)] animate-fade-in"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-4.5 h-4.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                <ShieldCheck className="w-2.5 h-2.5" />
              </span>
              <h2 className="font-serif text-[11.5px] sm:text-xs text-[#F7F3EC] font-normal tracking-wide leading-none truncate">
                {t.bannerTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={toggleLanguage}
              className="text-[9px] text-[#D4AF37] hover:text-[#F7F3EC] flex items-center gap-1 border border-[#D4AF37]/30 px-1.5 py-0.5 rounded-full transition-colors cursor-pointer shrink-0"
              title="Toggle English / Hindi"
            >
              <Languages className="w-2.5 h-2.5" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>

          <p className="text-[10.5px] sm:text-[11px] text-[#DED3C5] font-light leading-snug mb-2">
            {t.bannerText}{' '}
            <Link
              href="/privacy"
              className="text-[#D4AF37] hover:underline font-normal inline-flex items-center gap-0.5 whitespace-nowrap"
            >
              <span>{t.privacyLink}</span>
              <ExternalLink className="w-2 h-2 inline" />
            </Link>
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#DED3C5]/15 text-xs">
            <button
              type="button"
              onClick={() => saveConsent(false, true)}
              className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#C29D26] text-[#372921] font-semibold rounded-full uppercase tracking-wider text-[9px] transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              {t.acceptAll}
            </button>
            <button
              type="button"
              onClick={() => saveConsent(true, false)}
              className="px-2 py-1 bg-transparent hover:bg-white/10 text-[#F7F3EC] border border-[#DED3C5]/30 rounded-full uppercase tracking-wider text-[9px] transition-all cursor-pointer whitespace-nowrap"
            >
              {t.essentialOnly}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-1.5 py-0.5 text-[#DED3C5] hover:text-[#F7F3EC] underline underline-offset-2 text-[9px] transition-colors cursor-pointer ml-auto whitespace-nowrap"
            >
              {t.customize}
            </button>
          </div>
        </aside>
      )}

      {/* Deep Preferences Management Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dpdp-modal-heading"
          data-lenis-prevent="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in overflow-hidden"
        >
          <div
            data-lenis-prevent="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF7F2] text-[#372921] w-full max-w-xl max-h-[min(90vh,680px)] rounded-2xl border border-[#D4AF37]/40 shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Sticky Header - never clipped, always pinned to top */}
            <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-[#DED3C5] bg-[#FAF7F2] shrink-0">
              <div className="space-y-1 pr-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#372921] text-[#FAF7F2] text-[10px] uppercase tracking-monumental font-semibold">
                  <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                  <span>DPDP Act 2023 & Rules 2025</span>
                </div>
                <h2 id="dpdp-modal-heading" className="font-serif text-xl sm:text-2xl text-[#372921] font-medium leading-tight">
                  {t.modalTitle}
                </h2>
                <p className="text-xs text-[#76695F] font-light leading-relaxed">
                  {t.modalSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 text-xs border border-[#372921]/30 hover:border-[#372921] rounded-full text-[#372921] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Languages className="w-3 h-3" />
                  <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-[#76695F] hover:text-[#372921] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                  aria-label={t.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body - captures all wheel/touch interactions inside modal */}
            <div
              data-lenis-prevent="true"
              className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4"
            >
              {/* Statutory Legal Badge */}
              <div className="p-3 bg-[#F0EAE1] rounded-lg border border-[#DED3C5] text-[11px] text-[#503A2E] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#9E5430] shrink-0" />
                <span>{t.statutoryNotice}</span>
              </div>

              {/* Granular Purpose Toggles */}
              <div className="space-y-3">
                {/* 1. Essential / Legal Mandate (Locked) */}
                <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#DED3C5] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-serif text-base text-[#372921] font-medium">
                      <FileText className="w-4 h-4 text-[#9E5430]" />
                      <span>{t.essentialTitle}</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider bg-[#372921]/10 text-[#503A2E] px-2.5 py-0.5 rounded-full">
                      {t.alwaysActive}
                    </span>
                  </div>
                  <p className="text-xs text-[#76695F] leading-relaxed font-light">
                    {t.essentialDesc}
                  </p>
                </div>

                {/* 2. WhatsApp Concierge & Order Transit */}
                <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#DED3C5] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-serif text-base text-[#372921] font-medium">
                      <MessageCircle className="w-4 h-4 text-[#9E5430]" />
                      <span>{t.conciergeTitle}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conciergeConsent}
                        onChange={(e) => setConciergeConsent(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9E5430]"></div>
                    </label>
                  </div>
                  <p className="text-xs text-[#76695F] leading-relaxed font-light">
                    {t.conciergeDesc}
                  </p>
                </div>

                {/* 3. Anonymous Atelier Analytics */}
                <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#DED3C5] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-serif text-base text-[#372921] font-medium">
                      <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t.analyticsTitle}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analyticsConsent}
                        onChange={(e) => setAnalyticsConsent(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9E5430]"></div>
                    </label>
                  </div>
                  <p className="text-xs text-[#76695F] leading-relaxed font-light">
                    {t.analyticsDesc}
                  </p>
                </div>
              </div>

              {/* DPO SLA Footer Note inside scroll area */}
              <div className="pt-2 text-[11px] text-[#76695F] flex items-center justify-between flex-wrap gap-2">
                <span>{t.dpoContact}</span>
                <Link
                  href="/privacy"
                  onClick={() => setShowModal(false)}
                  className="text-[#9E5430] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>{t.privacyLink}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Sticky Action Footer - always visible */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-[#DED3C5] bg-[#FAF7F2] shrink-0">
              <button
                type="button"
                onClick={() => saveConsent(true, false)}
                className="px-4 py-2 text-xs text-[#503A2E] hover:text-[#372921] font-medium transition-colors cursor-pointer"
              >
                {t.essentialOnly}
              </button>
              <button
                type="button"
                onClick={() => saveConsent(false, false)}
                className="px-6 py-2.5 bg-[#372921] hover:bg-[#503A2E] text-[#FAF7F2] rounded-full text-xs uppercase tracking-refined font-semibold transition-all shadow-md cursor-pointer"
              >
                {t.savePreferences}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

