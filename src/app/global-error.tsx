'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Kalajay Root Global Error captured:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#FAF7F2] text-[#2C2420] min-h-screen flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full text-center space-y-6 bg-[#F4EFE6] p-8 rounded-2xl border border-[#E8DFD1] shadow-lg">
          <div className="w-12 h-12 rounded-full bg-[#EADFD0] text-[#9E5430] flex items-center justify-center mx-auto text-xl font-serif">
            ✦
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-[#2C2420] font-normal">
              Atelier Interruption
            </h1>
            <p className="text-xs text-[#76695F] leading-relaxed">
              We encountered an unforeseen system interruption. Your session and credentials remain secure.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#2C2420] hover:bg-[#9E5430] text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold rounded-full transition-colors cursor-pointer"
            >
              Retry
            </button>
            <a
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#FAF7F2] border border-[#D5C7B5] hover:border-[#9E5430] text-[#2C2420] text-xs uppercase tracking-wider font-medium rounded-full transition-colors inline-block"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
