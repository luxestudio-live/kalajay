'use client';

import React, { useEffect, useState } from 'react';

export default function Preloader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('kalajay_preloader_seen');
      if (!seen) {
        setShouldShow(true);

        // Smooth progress count up over 1.8 seconds
        const startTime = Date.now();
        const duration = 1800;
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const nextVal = Math.min(100, Math.round((elapsed / duration) * 100));
          setProgress(nextVal);
          if (nextVal >= 100) {
            clearInterval(progressInterval);
          }
        }, 30);

        // Hold full view comfortably until 2.2s, then start graceful curtain lift / fade
        const timer1 = setTimeout(() => {
          setFadeOut(true);
        }, 2200);

        // Remove completely at 2.9s after smooth 700ms transition
        const timer2 = setTimeout(() => {
          sessionStorage.setItem('kalajay_preloader_seen', 'true');
          setShouldShow(false);
        }, 2900);

        return () => {
          clearInterval(progressInterval);
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
    setTimeout(() => setShouldShow(false), 300);
  };

  if (!shouldShow) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#FAF9F6] flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        fadeOut ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
      aria-hidden="true"
    >
      {/* Editorial Frame Borders (subtle luxury hairline border) */}
      <div className="absolute inset-4 sm:inset-6 border border-border-subtle/70 pointer-events-none rounded-xl" />

      {/* Skip control */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-7 right-7 sm:top-9 sm:right-9 z-10 text-[11px] text-ink-muted hover:text-ink tracking-editorial uppercase px-3.5 py-1.5 rounded-full border border-border-subtle hover:border-gold transition-all duration-300 bg-canvas/80 backdrop-blur-xs cursor-pointer"
      >
        Skip
      </button>

      <div className="relative z-10 text-center px-6 max-w-md flex flex-col items-center">
        {/* Craft House Heritage Badge */}
        <div className="mb-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/25 border border-gold/30 text-[10px] uppercase tracking-monumental text-gold-dark font-sans font-medium animate-fade-in">
          <span>The Craft House</span>
          <span className="w-1 h-1 rounded-full bg-gold" />
          <span>Bihar & Mumbai</span>
        </div>

        {/* Brand Logo */}
        <div className="mb-3 transition-transform duration-1000 ease-out select-none">
          <img
            src="/logo.png"
            alt="Kalajay — A World of Little Wonders"
            className="h-20 sm:h-24 w-auto object-contain mx-auto"
          />
        </div>

        {/* Animated Thread SVG */}
        <div className="relative w-52 sm:w-64 h-6 mx-auto my-2 overflow-visible flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 240 16"
            fill="none"
          >
            {/* Background hairline guide path */}
            <path
              d="M 0,8 Q 60,0 120,8 T 240,8"
              stroke="#EBE6DE"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* Animated drawing golden thread */}
            <path
              d="M 0,8 Q 60,0 120,8 T 240,8"
              stroke="#C5A880"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-[threadDraw_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              style={{
                strokeDasharray: 240,
                strokeDashoffset: 240,
              }}
            />
            {/* Central obsidian bead with glowing pulse */}
            <circle
              cx="120"
              cy="8"
              r="4"
              fill="#141312"
              className="animate-[beadPop_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            />
            <circle
              cx="120"
              cy="8"
              r="7"
              stroke="#C5A880"
              strokeWidth="1"
              className="opacity-40 animate-ping"
              style={{ animationDuration: '2.5s' }}
            />
          </svg>
        </div>

        {/* Brand Slogan */}
        <p className="text-xs uppercase tracking-monumental text-ink font-sans font-medium opacity-90 mt-2 mb-4">
          A World of Little Wonders
        </p>

        {/* Subtle Artisan Progress Meter */}
        <div className="flex items-center gap-3 text-[11px] text-ink-light font-mono tracking-widest mt-1">
          <div className="w-24 sm:w-32 h-[2px] bg-border-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold/50 via-gold to-rosewood transition-all duration-100 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-8 text-left text-ink-muted">{progress}%</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes threadDraw {
          0% {
            strokeDashoffset: 240;
          }
          100% {
            strokeDashoffset: 0;
          }
        }
        @keyframes beadPop {
          0%, 40% {
            transform: scale(0);
            opacity: 0;
            transform-origin: 120px 8px;
          }
          70% {
            transform: scale(1.3);
            opacity: 1;
            transform-origin: 120px 8px;
          }
          100% {
            transform: scale(1);
            opacity: 1;
            transform-origin: 120px 8px;
          }
        }
      `}</style>
    </div>
  );
}
