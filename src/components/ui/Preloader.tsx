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

        // Smooth progress count up over 2.4 seconds
        const startTime = Date.now();
        const duration = 2400;
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const nextVal = Math.min(100, Math.round((elapsed / duration) * 100));
          setProgress(nextVal);
          if (nextVal >= 100) {
            clearInterval(progressInterval);
          }
        }, 30);

        // Hold complete assembled emblem until exactly 2.5s as requested by user,
        // then initiate the graceful curtain lift / fade
        const timer1 = setTimeout(() => {
          setFadeOut(true);
        }, 2500);

        // Remove completely from DOM after smooth 650ms fade
        const timer2 = setTimeout(() => {
          sessionStorage.setItem('kalajay_preloader_seen', 'true');
          setShouldShow(false);
        }, 3150);

        return () => {
          clearInterval(progressInterval);
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } catch {
      // Storage restricted contexts fallback
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
      className={`fixed inset-0 z-50 bg-[#F7F3EC] flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        fadeOut ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
      aria-hidden="true"
    >
      {/* Editorial Frame Borders (luxury hairline border) */}
      <div className="absolute inset-4 sm:inset-6 border border-[#EAE2D8] pointer-events-none rounded-2xl" />

      {/* Skip control */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-7 right-7 sm:top-9 sm:right-9 z-10 text-[11px] text-[#76695F] hover:text-[#372921] tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-[#EAE2D8] hover:border-[#9E5430] transition-all duration-300 bg-[#F7F3EC]/80 backdrop-blur-xs cursor-pointer font-sans"
      >
        Skip
      </button>

      <div className="relative z-10 text-center px-6 max-w-md flex flex-col items-center select-none">
        {/* Craft House Heritage Badge */}
        <div className="mb-2 sm:mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0E9DF] border border-[#DED3C5] text-[10px] uppercase tracking-monumental text-[#9E5430] font-sans font-medium animate-badge-fade">
          <span>The Craft House</span>
          <span className="w-1 h-1 rounded-full bg-[#9E5430]" />
          <span>Bihar & Mumbai</span>
        </div>

        {/* Animated Favicon Assembly Stage */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-1 select-none flex items-center justify-center">
          {/* Layer 1: Mother Elephant entering majestically from the left */}
          <img
            src="/loader/big_elephant_full.png"
            alt="Big Elephant"
            loading="eager"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-walk-big"
          />

          {/* Layer 2: Baby Elephant trotting playfully from the right */}
          <img
            src="/loader/small_elephant_full.png"
            alt="Small Elephant"
            loading="eager"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-walk-small"
          />

          {/* Aura / Sparkle behind the lotus when the elephants meet */}
          <div className="absolute left-[65%] top-[35%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-radial from-[#9E5430]/30 to-transparent pointer-events-none animate-sparkle-pulse" />

          {/* Layer 3: The Lotus Flower descending and blossoming right above them */}
          <img
            src="/loader/flower_full.png"
            alt="Lotus Crown"
            loading="eager"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-bloom-flower"
          />
        </div>

        {/* Brand Wordmark & Tagline: Fades up in harmony with assembled emblem */}
        <div className="mt-1 flex flex-col items-center animate-brand-fade">
          <h2 className="font-serif text-2xl sm:text-[28px] tracking-[0.24em] text-[#372921] font-medium uppercase mb-1">
            KALAJAY
          </h2>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#8C7A6B] font-sans font-medium">
            A World of Little Wonders
          </p>
        </div>

        {/* Refined Progress Line */}
        <div className="flex items-center gap-3 text-[10px] text-[#8C7A6B] font-mono tracking-widest mt-4 opacity-80">
          <div className="w-28 sm:w-36 h-[2px] bg-[#EAE2D8] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C27448] via-[#9E5430] to-[#874427] transition-all duration-100 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-7 text-left">{progress}%</span>
        </div>
      </div>

      <style jsx>{`
        /* Stride Choreography */
        .animate-badge-fade {
          opacity: 0;
          animation: badgeFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
        }

        .animate-walk-big {
          opacity: 0;
          animation: walkBigElephant 1.05s cubic-bezier(0.25, 1, 0.35, 1) 0.1s forwards;
        }

        .animate-walk-small {
          opacity: 0;
          animation: walkSmallElephant 1.05s cubic-bezier(0.25, 1, 0.35, 1) 0.1s forwards;
        }

        .animate-bloom-flower {
          opacity: 0;
          transform: translateY(-28px) scale(0.35);
          transform-origin: 65% 35%;
          animation: bloomFlower 0.65s cubic-bezier(0.34, 1.45, 0.64, 1) 1.08s forwards;
        }

        .animate-sparkle-pulse {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.2);
          animation: sparklePulse 0.7s ease-out 1.25s forwards;
        }

        .animate-brand-fade {
          opacity: 0;
          transform: translateY(10px);
          animation: brandFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.35s forwards;
        }

        @keyframes badgeFadeIn {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes walkBigElephant {
          0% {
            opacity: 0;
            transform: translateX(-180px) translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateX(-110px) translateY(-3px);
          }
          60% {
            opacity: 1;
            transform: translateX(-45px) translateY(0);
          }
          85% {
            opacity: 1;
            transform: translateX(4px) translateY(-1px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes walkSmallElephant {
          0% {
            opacity: 0;
            transform: translateX(180px) translateY(0);
          }
          25% {
            opacity: 1;
            transform: translateX(120px) translateY(-4px);
          }
          55% {
            opacity: 1;
            transform: translateX(50px) translateY(0);
          }
          85% {
            opacity: 1;
            transform: translateX(-4px) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes bloomFlower {
          0% {
            opacity: 0;
            transform: translateY(-28px) scale(0.35);
          }
          65% {
            opacity: 1;
            transform: translateY(2px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes sparklePulse {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.3);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.8);
          }
        }

        @keyframes brandFadeUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-walk-big,
          .animate-walk-small,
          .animate-bloom-flower,
          .animate-brand-fade,
          .animate-badge-fade {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .animate-sparkle-pulse {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
