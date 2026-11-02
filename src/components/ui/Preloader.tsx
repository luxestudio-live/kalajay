'use client';

import React, { useEffect, useState } from 'react';

export default function Preloader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('kalajay_preloader_seen');
      if (!seen) {
        setShouldShow(true);
        // Start fade out at 0.5s
        const timer1 = setTimeout(() => {
          setFadeOut(true);
        }, 500);

        // Remove completely at 0.8s
        const timer2 = setTimeout(() => {
          sessionStorage.setItem('kalajay_preloader_seen', 'true');
          setShouldShow(false);
        }, 800);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const handleSkip = () => {
    try {
      sessionStorage.setItem('kalajay_preloader_seen', 'true');
    } catch {}
    setFadeOut(true);
    setTimeout(() => setShouldShow(false), 200);
  };

  if (!shouldShow) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#FAF9F6] flex flex-col items-center justify-center transition-opacity duration-300 ease-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Skip control */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 text-xs text-ink-muted hover:text-ink tracking-editorial uppercase px-3 py-1.5 rounded-full border border-border-subtle hover:border-gold transition-colors"
      >
        Skip
      </button>

      <div className="text-center px-4 max-w-sm">
        {/* Brand Wordmark */}
        <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.24em] text-ink font-normal mb-2">
          KALAJAY
        </h1>

        {/* Animated Thread SVG */}
        <svg
          className="w-48 sm:w-56 h-4 mx-auto my-3 overflow-visible"
          viewBox="0 0 200 12"
          fill="none"
        >
          <path
            d="M 0,6 Q 50,0 100,6 T 200,6"
            stroke="#C5A880"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-[threadDraw_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            style={{
              strokeDasharray: 200,
              strokeDashoffset: 200,
            }}
          />
          <circle cx="100" cy="6" r="3" fill="#141312" />
        </svg>

        {/* Brand Slogan */}
        <p className="text-[11px] uppercase tracking-monumental text-ink-muted font-sans font-medium opacity-85">
          A World of Little Wonders
        </p>
      </div>

      <style jsx>{`
        @keyframes threadDraw {
          0% {
            stroke-dashoffset: 200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

