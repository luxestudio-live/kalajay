'use client';

import React, { useEffect, useState } from 'react';
import { BIG_ELEPHANT_SRC, SMALL_ELEPHANT_SRC, FLOWER_SRC } from './loaderAssets';

export default function Preloader() {
  const [dismissed, setDismissed] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('kalajay_preloader_seen');
      if (seen) {
        setDismissed(true);
        return;
      }

      // Preloader runs for exactly 2.5s as requested by user,
      // then smoothly fades out
      const timer1 = setTimeout(() => {
        setFadeOut(true);
      }, 2500);

      // Remove from DOM at 3.1s (after 600ms curtain transition)
      const timer2 = setTimeout(() => {
        sessionStorage.setItem('kalajay_preloader_seen', 'true');
        setDismissed(true);
      }, 3100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } catch {
      setDismissed(true);
    }
  }, []);

  const handleSkip = () => {
    try {
      sessionStorage.setItem('kalajay_preloader_seen', 'true');
    } catch {}
    setFadeOut(true);
    setTimeout(() => setDismissed(true), 250);
  };

  if (dismissed) return null;

  return (
    <div
      id="kalajay-preloader"
      className={`fixed inset-0 z-50 bg-[#F7F3EC] flex flex-col items-center justify-center select-none ${
        fadeOut ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
      style={{
        transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
      }}
      aria-hidden="true"
    >
      {/* Editorial Luxury Border */}
      <div className="absolute inset-4 sm:inset-6 border border-[#EAE2D8] pointer-events-none rounded-2xl" />

      {/* Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10 text-[11px] text-[#76695F] hover:text-[#372921] tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-[#EAE2D8] hover:border-[#9E5430] transition-colors duration-200 bg-[#F7F3EC]/80 backdrop-blur-xs cursor-pointer font-sans"
      >
        Skip
      </button>

      <div className="relative z-10 text-center px-6 max-w-md flex flex-col items-center">
        {/* Heritage Badge */}
        <div className="mb-2 sm:mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0E9DF] border border-[#DED3C5] text-[10px] uppercase tracking-monumental text-[#9E5430] font-sans font-medium animate-badge-fade">
          <span>The Craft House</span>
          <span className="w-1 h-1 rounded-full bg-[#9E5430]" />
          <span>Bihar & Mumbai</span>
        </div>

        {/* Animated Favicon Canvas Stage */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-1 flex items-center justify-center overflow-visible">
          {/* Layer 1: Big Elephant (Glides smoothly from left on GPU compositor) */}
          <img
            src={BIG_ELEPHANT_SRC}
            alt=""
            className="emblem-layer layer-big"
          />

          {/* Layer 2: Small Elephant (Glides smoothly from right on GPU compositor) */}
          <img
            src={SMALL_ELEPHANT_SRC}
            alt=""
            className="emblem-layer layer-small"
          />

          {/* Lotus Flower Glow Aura */}
          <div className="flower-sparkle" />

          {/* Layer 3: Lotus Flower (Blooms and descends from above once they meet) */}
          <img
            src={FLOWER_SRC}
            alt=""
            className="emblem-layer layer-flower"
          />
        </div>

        {/* Brand Identity Wordmark */}
        <div className="mt-1 flex flex-col items-center animate-brand-fade">
          <h2 className="font-serif text-2xl sm:text-[28px] tracking-[0.24em] text-[#372921] font-medium uppercase mb-1">
            KALAJAY
          </h2>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#8C7A6B] font-sans font-medium">
            A World of Little Wonders
          </p>
        </div>

        {/* Pure CSS GPU Hardware-Accelerated Progress Indicator (0 React re-renders) */}
        <div className="w-28 sm:w-36 h-[2px] bg-[#EAE2D8] rounded-full overflow-hidden mt-4 opacity-80 animate-progress-container">
          <div className="h-full w-full bg-gradient-to-r from-[#C27448] via-[#9E5430] to-[#874427] rounded-full animate-progress-fill" />
        </div>
      </div>

      <style jsx>{`
        /* Base shared layer styles with full GPU hardware acceleration */
        .emblem-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          will-change: transform, opacity;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }

        /* 1. Big Elephant: 100% buttery smooth slide from left */
        .layer-big {
          opacity: 0;
          transform: translate3d(-140px, 0, 0);
          animation: slideBigElephant 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
        }

        /* 2. Small Elephant: 100% buttery smooth slide from right */
        .layer-small {
          opacity: 0;
          transform: translate3d(140px, 0, 0);
          animation: slideSmallElephant 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
        }

        /* 3. Lotus Flower: Drops & blooms gently centered right above meeting point */
        .layer-flower {
          opacity: 0;
          transform: translate3d(0, -24px, 0) scale3d(0.5, 0.5, 1);
          transform-origin: 65% 35%;
          animation: bloomFlower 0.65s cubic-bezier(0.34, 1.3, 0.64, 1) 0.95s forwards;
        }

        /* Sparkle pulse right as flower locks into place */
        .flower-sparkle {
          position: absolute;
          left: 65%;
          top: 35%;
          width: 80px;
          height: 80px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(158, 84, 48, 0.35) 0%, rgba(158, 84, 48, 0) 70%);
          pointer-events: none;
          opacity: 0;
          transform: translate3d(-50%, -50%, 0) scale3d(0.3, 0.3, 1);
          animation: sparkleGlow 0.65s ease-out 1.1s forwards;
          will-change: transform, opacity;
        }

        /* Brand text fade up */
        .animate-brand-fade {
          opacity: 0;
          transform: translate3d(0, 8px, 0);
          animation: brandFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 1.25s forwards;
          will-change: transform, opacity;
        }

        /* Badge fade */
        .animate-badge-fade {
          opacity: 0;
          animation: badgeFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
        }

        /* Progress line container */
        .animate-progress-container {
          opacity: 0;
          animation: progressFadeIn 0.4s ease 0.2s forwards;
        }

        /* Hardware-accelerated GPU progress bar using scaleX (no width layout reflows) */
        .animate-progress-fill {
          transform-origin: left center;
          transform: scale3d(0, 1, 1);
          animation: progressFill 2.4s cubic-bezier(0.1, 0, 0.2, 1) 0.1s forwards;
          will-change: transform;
        }

        /* Keyframes */
        @keyframes slideBigElephant {
          0% {
            opacity: 0;
            transform: translate3d(-140px, 0, 0);
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes slideSmallElephant {
          0% {
            opacity: 0;
            transform: translate3d(140px, 0, 0);
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes bloomFlower {
          0% {
            opacity: 0;
            transform: translate3d(0, -24px, 0) scale3d(0.5, 0.5, 1);
          }
          70% {
            opacity: 1;
            transform: translate3d(0, 2px, 0) scale3d(1.04, 1.04, 1);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
        }

        @keyframes sparkleGlow {
          0% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) scale3d(0.3, 0.3, 1);
          }
          50% {
            opacity: 0.8;
            transform: translate3d(-50%, -50%, 0) scale3d(1.2, 1.2, 1);
          }
          100% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) scale3d(1.8, 1.8, 1);
          }
        }

        @keyframes brandFadeUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 8px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes badgeFadeIn {
          0% {
            opacity: 0;
            transform: translate3d(0, -6px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes progressFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes progressFill {
          0% {
            transform: scale3d(0, 1, 1);
          }
          100% {
            transform: scale3d(1, 1, 1);
          }
        }

        /* Accessibility: Instant static display if user prefers reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .layer-big,
          .layer-small,
          .layer-flower,
          .animate-brand-fade,
          .animate-badge-fade,
          .animate-progress-fill {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .flower-sparkle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
