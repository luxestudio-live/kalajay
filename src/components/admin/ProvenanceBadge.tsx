'use client';

import React from 'react';
import type { DataProvenance } from '@/lib/dataProvenance';

interface ProvenanceBadgeProps {
  provenance?: DataProvenance;
  isDemo?: boolean;
  className?: string;
  size?: 'xs' | 'sm';
}

/**
 * Subtle luxury provenance badge for the preproduction administrative console.
 * Clearly differentiates live authoritative data from demo / seed fallback data.
 */
export default function ProvenanceBadge({
  provenance,
  isDemo,
  className = '',
  size = 'xs',
}: ProvenanceBadgeProps) {
  const isLive = provenance === 'live' && isDemo !== true;
  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]';

  if (isLive) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-semibold tracking-wider uppercase rounded-xs border transition-colors ${padding} bg-emerald-50 text-emerald-800 border-emerald-200/80 ${className}`}
        title="Authoritative live record sourced from Cloud Firestore / live backend"
        aria-label="Provenance: Live authoritative record"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
        <span>LIVE</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold tracking-wider uppercase rounded-xs border transition-colors ${padding} bg-amber-50 text-amber-800 border-amber-200/80 ${className}`}
      title="Demo / synthetic fallback record for preproduction completeness"
      aria-label="Provenance: Demo fallback record"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
      <span>DEMO</span>
    </span>
  );
}

export { ProvenanceBadge };

