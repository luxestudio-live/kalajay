'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, Gem, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA service worker registration failed:', err);
      });
    }

    // 2. Check if already running in standalone mode (installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) setIsInstalled(true);
    };
    checkStandalone();

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Capture native beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Check if user previously dismissed in last 7 days
      const lastDismissed = localStorage.getItem('kalajay_pwa_dismissed');
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed, 10);
        const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) return;
      }

      // Show banner after 3.5 seconds of browsing
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3500);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen to custom event from mobile menu or button
    const handleTriggerCustomInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            setIsInstalled(true);
            setShowBanner(false);
          }
          setDeferredPrompt(null);
        });
      } else if (isAppleDevice) {
        setShowIOSModal(true);
      } else {
        // Fallback for browsers without beforeinstallprompt
        alert('To install Kalajay on your device, tap your browser menu (⋮) and select "Add to Home screen" or "Install app".');
      }
    };

    window.addEventListener('kalajay:trigger-install', handleTriggerCustomInstall);

    // Check if installed via appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('kalajay:trigger-install', handleTriggerCustomInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('kalajay_pwa_dismissed', Date.now().toString());
  };

  // If already running standalone or installed, don't show the banner
  if (isStandalone || isInstalled) return null;

  return (
    <>
      {/* Mobile Floating Install Banner */}
      {showBanner && (
        <aside
          role="region"
          aria-label="App install prompt"
          className="fixed bottom-4 inset-x-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 animate-fade-up"
        >
          <div className="bg-canvas border border-border-gold rounded-image p-4 shadow-2xl backdrop-blur-md relative flex items-center gap-3.5">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-ink border border-gold/40 flex items-center justify-center shrink-0 shadow-md">
              <Gem className="w-6 h-6 text-gold" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm text-ink font-semibold truncate">
                  Kalajay Atelier
                </span>
                <span className="text-[11px] uppercase tracking-refined bg-ink text-champagne font-sans font-medium px-2 py-0.5 rounded-full">
                  App
                </span>
              </div>
              <p className="text-xs text-ink-muted leading-tight mt-0.5 truncate">
                Install for faster browsing & instant access.
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 rounded-full text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 p-1 text-ink-faint hover:text-ink cursor-pointer"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* iOS "Add to Home Screen" Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-ink/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-canvas w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-border-gold p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-ink border border-gold/40 flex items-center justify-center shrink-0">
                <Gem className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-ink font-normal">Install Kalajay</h4>
                <p className="text-xs text-ink-muted">Add to your iPhone Home Screen</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-ink-muted border-t border-border-subtle pt-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-canvas-subtle border border-border-medium flex items-center justify-center text-xs font-semibold text-ink shrink-0">
                  1
                </span>
                <p className="pt-0.5 leading-relaxed">
                  In Safari, tap the <strong className="text-ink inline-flex items-center gap-1 mx-1 font-semibold"><Share className="w-3.5 h-3.5 text-rosewood inline" /> Share</strong> button at the bottom of your screen.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-canvas-subtle border border-border-medium flex items-center justify-center text-xs font-semibold text-ink shrink-0">
                  2
                </span>
                <p className="pt-0.5 leading-relaxed">
                  Scroll down the share sheet and tap <strong className="text-ink inline-flex items-center gap-1 mx-1 font-semibold"><PlusSquare className="w-3.5 h-3.5 text-gold inline" /> Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-canvas-subtle border border-border-medium flex items-center justify-center text-xs font-semibold text-ink shrink-0">
                  3
                </span>
                <p className="pt-0.5 leading-relaxed">
                  Tap <strong className="text-ink font-semibold">Add</strong> in the top right. Kalajay will appear right on your home screen with zero browser bars!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full py-2.5 bg-ink text-canvas text-xs uppercase tracking-refined font-semibold rounded-full hover:bg-gold hover:text-ink transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

