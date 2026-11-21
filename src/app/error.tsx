'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, ShoppingBag } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception safely without exposing internal details to client
    console.error('Kalajay Flagship Runtime Exception captured:', error);
  }, [error]);

  return (
    <div className="bg-canvas min-h-[75vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-xl mx-auto text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas-subtle rounded-full border border-rose-300 text-rose-800 text-[10px] font-sans uppercase tracking-monumental font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
          <span>Temporary Craft Interruption</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl text-ink font-normal tracking-tight">
          Pardon Our Pause
        </h1>

        <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-md mx-auto">
          An unexpected interruption occurred while weaving this page. Our atelier systems have safely contained the exception.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-7 py-3 bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3 bg-canvas border border-border-medium hover:border-gold text-ink text-xs uppercase tracking-refined font-medium rounded-full transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5 text-rosewood" />
            <span>Return to Flagship Home</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-7 py-3 bg-canvas border border-border-medium hover:border-gold text-ink text-xs uppercase tracking-refined font-medium rounded-full transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-gold-dark" />
            <span>Browse The Vault</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
