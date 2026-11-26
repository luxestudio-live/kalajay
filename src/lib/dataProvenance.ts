/**
 * KALAJAY V2 — UNIFIED GLOBAL DATA PROVENANCE & RESOLUTION ENGINE
 *
 * Implements the application-wide Priority 1 (Actual Data) vs Priority 2 (Dummy / Seed Data)
 * architecture across the entire website and admin panel.
 *
 * Guarantees:
 * 1. Actual data always takes strict precedence.
 * 2. Dummy / seed data fills missing records or missing content in preproduction.
 * 3. Every resolved record carries a standardized provenance marker: 'live' | 'demo'.
 * 4. Configurable via APP_DEMO_FALLBACK_ENABLED / NEXT_PUBLIC_APP_DEMO_FALLBACK_ENABLED.
 * 5. Production mode (fallback disabled) cleanly serves actual-only data without seed pollution.
 * 6. Demo records are strictly prohibited from participating in genuine transactions.
 */

export type DataProvenance = 'live' | 'demo';

export interface WithProvenance {
  provenance: DataProvenance;
  _source?: 'live' | 'demo';
  isDemo?: boolean;
}

/**
 * Checks whether demo fallback is enabled in the current environment.
 * Default: true (for preproduction / development).
 * In production (when APP_DEMO_FALLBACK_ENABLED=false), only actual data is used.
 */
export function isDemoFallbackEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.APP_DEMO_FALLBACK_ENABLED !== undefined) {
      return process.env.APP_DEMO_FALLBACK_ENABLED !== 'false';
    }
    if (process.env.NEXT_PUBLIC_APP_DEMO_FALLBACK_ENABLED !== undefined) {
      return process.env.NEXT_PUBLIC_APP_DEMO_FALLBACK_ENABLED !== 'false';
    }
  }
  return true;
}

export interface MergeOptions<T> {
  primaryKey: (item: T) => string | undefined;
  secondaryKey?: (item: T) => string | undefined;
  sort?: (a: T & WithProvenance, b: T & WithProvenance) => number;
  allowFallback?: boolean;
}

/**
 * Universal resolution function:
 * Merges actual (live) records with dummy (demo) records.
 * Live records ALWAYS win on identity collision.
 * Non-conflicting demo records fill gaps when fallback is enabled.
 */
export function resolveLiveWithDemoFallback<T extends Record<string, any>>(
  liveRecords: T[] | null | undefined,
  demoRecords: T[] | null | undefined,
  options: MergeOptions<T>
): (T & WithProvenance)[] {
  const liveList = Array.isArray(liveRecords) ? liveRecords : [];
  const demoList = Array.isArray(demoRecords) ? demoRecords : [];

  // Tag all live records with provenance: 'live'
  const taggedLive: (T & WithProvenance)[] = liveList.map((item) => ({
    ...item,
    provenance: 'live' as DataProvenance,
    _source: 'live' as const,
    isDemo: false,
  }));

  // If demo fallback is disabled or explicitly disallowed, return only live records
  const fallbackPermitted = options.allowFallback !== false && isDemoFallbackEnabled();
  if (!fallbackPermitted || demoList.length === 0) {
    if (options.sort) {
      return [...taggedLive].sort(options.sort);
    }
    return taggedLive;
  }

  // Build sets of live primary and secondary identifiers for collision detection
  const livePrimaryKeys = new Set<string>();
  const liveSecondaryKeys = new Set<string>();

  for (const item of liveList) {
    const pKey = options.primaryKey(item);
    if (pKey) livePrimaryKeys.add(String(pKey).trim().toLowerCase());

    if (options.secondaryKey) {
      const sKey = options.secondaryKey(item);
      if (sKey) liveSecondaryKeys.add(String(sKey).trim().toLowerCase());
    }
  }

  // Filter non-conflicting demo records
  const nonConflictingDemo: (T & WithProvenance)[] = [];
  const seenDemoPrimaryKeys = new Set<string>();

  for (const item of demoList) {
    const pKey = options.primaryKey(item);
    const normalizedPKey = pKey ? String(pKey).trim().toLowerCase() : undefined;

    // Discard demo item if its primary key matches an actual live item or an already included demo item
    if (normalizedPKey && (livePrimaryKeys.has(normalizedPKey) || seenDemoPrimaryKeys.has(normalizedPKey))) {
      continue;
    }

    if (options.secondaryKey) {
      const sKey = options.secondaryKey(item);
      const normalizedSKey = sKey ? String(sKey).trim().toLowerCase() : undefined;
      // Discard demo item if its secondary key matches an actual live item
      if (normalizedSKey && liveSecondaryKeys.has(normalizedSKey)) {
        continue;
      }
    }

    if (normalizedPKey) seenDemoPrimaryKeys.add(normalizedPKey);

    nonConflictingDemo.push({
      ...item,
      provenance: 'demo' as DataProvenance,
      _source: 'demo' as const,
      isDemo: true,
    });
  }

  const combined = [...taggedLive, ...nonConflictingDemo];

  if (options.sort) {
    return combined.sort(options.sort);
  }

  return combined;
}

/**
 * Universal single-entity resolver:
 * Given a live entity (or null) and a fallback entity (or null).
 */
export function resolveSingleEntity<T extends Record<string, any>>(
  liveEntity: T | null | undefined,
  demoEntity: T | null | undefined
): (T & WithProvenance) | null {
  if (liveEntity) {
    return {
      ...liveEntity,
      provenance: 'live' as DataProvenance,
      _source: 'live' as const,
      isDemo: false,
    };
  }

  if (demoEntity && isDemoFallbackEnabled()) {
    return {
      ...demoEntity,
      provenance: 'demo' as DataProvenance,
      _source: 'demo' as const,
      isDemo: true,
    };
  }

  return null;
}

// =========================================================================
// ENTITY-SPECIFIC RESOLVERS
// =========================================================================

/**
 * Resolves Products (Catalogue, Storefront, Search, Rail, Admin)
 * Primary Key: code / id / sku
 * Secondary Key: slug
 */
export function resolveProducts<T extends Record<string, any>>(
  liveProducts: T[] | null | undefined,
  demoProducts: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveProducts, demoProducts, {
    primaryKey: (p) => p.code || p.id || p.sku,
    secondaryKey: (p) => p.slug,
    sort: (a, b) => {
      // Prioritize live products first, then preserve existing order
      if (a.provenance === 'live' && b.provenance === 'demo') return -1;
      if (a.provenance === 'demo' && b.provenance === 'live') return 1;
      return 0;
    },
  });
}

/**
 * Resolves Orders (Customer Account, Admin Orders, Reporting)
 * Primary Key: id / orderId
 * Secondary Key: razorpayOrderId / orderNumber
 * Sort: Newest created date first
 */
export function resolveOrders<T extends Record<string, any>>(
  liveOrders: T[] | null | undefined,
  demoOrders: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveOrders, demoOrders, {
    primaryKey: (o) => o.id || o.orderId,
    secondaryKey: (o) => o.razorpayOrderId || o.orderNumber,
    sort: (a, b) => {
      const timeA = new Date(a.createdAt || a.createdAtServer || 0).getTime();
      const timeB = new Date(b.createdAt || b.createdAtServer || 0).getTime();
      return timeB - timeA;
    },
  });
}

/**
 * Resolves Customers & Patrons (Admin Customers, Directory)
 * Primary Key: id / uid
 * Secondary Key: email
 */
export function resolveCustomers<T extends Record<string, any>>(
  liveCustomers: T[] | null | undefined,
  demoCustomers: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveCustomers, demoCustomers, {
    primaryKey: (c) => c.id || c.uid,
    secondaryKey: (c) => c.email?.toLowerCase(),
  });
}

/**
 * Resolves Inventory Items (Inventory ERP, Stock Ledger)
 * Primary Key: sku / id
 */
export function resolveInventory<T extends Record<string, any>>(
  liveInventory: T[] | null | undefined,
  demoInventory: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveInventory, demoInventory, {
    primaryKey: (i) => i.sku || i.id,
  });
}

/**
 * Resolves Categories and Collections (Navigation, Shop, Filters)
 * Primary Key: slug / id
 */
export function resolveCollections<T extends Record<string, any>>(
  liveCollections: T[] | null | undefined,
  demoCollections: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveCollections, demoCollections, {
    primaryKey: (c) => c.slug || c.id,
  });
}

/**
 * Resolves Promotional Banners & Hero Carousels
 * Primary Key: id
 */
export function resolveBanners<T extends Record<string, any>>(
  liveBanners: T[] | null | undefined,
  demoBanners: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveBanners, demoBanners, {
    primaryKey: (b) => b.id,
  });
}

/**
 * Resolves Coupons & Discount Offers
 * Primary Key: code / id
 */
export function resolveCoupons<T extends Record<string, any>>(
  liveCoupons: T[] | null | undefined,
  demoCoupons: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveCoupons, demoCoupons, {
    primaryKey: (c) => c.code?.toUpperCase() || c.id,
  });
}

/**
 * Resolves Product Reviews & Testimonials
 * Primary Key: id
 */
export function resolveReviews<T extends Record<string, any>>(
  liveReviews: T[] | null | undefined,
  demoReviews: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveReviews, demoReviews, {
    primaryKey: (r) => r.id,
    sort: (a, b) => {
      const timeA = new Date(a.date || a.createdAt || 0).getTime();
      const timeB = new Date(b.date || b.createdAt || 0).getTime();
      return timeB - timeA;
    },
  });
}

/**
 * Resolves Work Orders (Production, Looms)
 * Primary Key: id / orderId
 */
export function resolveWorkOrders<T extends Record<string, any>>(
  liveWorkOrders: T[] | null | undefined,
  demoWorkOrders: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveWorkOrders, demoWorkOrders, {
    primaryKey: (w) => w.id || w.orderId,
  });
}

/**
 * Resolves Offline Orders
 * Primary Key: id / orderId
 */
export function resolveOfflineOrders<T extends Record<string, any>>(
  liveOffline: T[] | null | undefined,
  demoOffline: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveOffline, demoOffline, {
    primaryKey: (o) => o.id || o.orderId,
  });
}

/**
 * Resolves Support & Concierge Tickets
 * Primary Key: id / ticketId
 */
export function resolveSupportTickets<T extends Record<string, any>>(
  liveTickets: T[] | null | undefined,
  demoTickets: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveTickets, demoTickets, {
    primaryKey: (t) => t.id || t.ticketId,
  });
}

/**
 * Resolves Custom Orders & Bespoke Requests
 * Primary Key: id
 */
export function resolveCustomRequests<T extends Record<string, any>>(
  liveRequests: T[] | null | undefined,
  demoRequests: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveRequests, demoRequests, {
    primaryKey: (r) => r.id,
  });
}

/**
 * Resolves Corporate & Gifting Enquiries
 * Primary Key: id
 */
export function resolveCorporateEnquiries<T extends Record<string, any>>(
  liveEnquiries: T[] | null | undefined,
  demoEnquiries: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveEnquiries, demoEnquiries, {
    primaryKey: (e) => e.id,
  });
}

/**
 * Resolves Artisan Profiles
 * Primary Key: id
 */
export function resolveArtisans<T extends Record<string, any>>(
  liveArtisans: T[] | null | undefined,
  demoArtisans: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveArtisans, demoArtisans, {
    primaryKey: (a) => a.id,
  });
}

/**
 * Resolves Expenses (Finance Ledger)
 * Primary Key: id
 */
export function resolveExpenses<T extends Record<string, any>>(
  liveExpenses: T[] | null | undefined,
  demoExpenses: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveExpenses, demoExpenses, {
    primaryKey: (e) => e.id,
  });
}

/**
 * Resolves Vendors (Procurement)
 * Primary Key: id
 */
export function resolveVendors<T extends Record<string, any>>(
  liveVendors: T[] | null | undefined,
  demoVendors: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveVendors, demoVendors, {
    primaryKey: (v) => v.id,
  });
}

/**
 * Resolves Category Budgets
 * Primary Key: category / id
 */
export function resolveBudgets<T extends Record<string, any>>(
  liveBudgets: T[] | null | undefined,
  demoBudgets: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveBudgets, demoBudgets, {
    primaryKey: (b) => b.category || b.id,
  });
}

/**
 * Resolves Tax Slabs
 * Primary Key: id
 */
export function resolveTaxSlabs<T extends Record<string, any>>(
  liveSlabs: T[] | null | undefined,
  demoSlabs: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveSlabs, demoSlabs, {
    primaryKey: (t) => t.id,
  });
}

/**
 * Resolves Audit Logs
 * Primary Key: id
 */
export function resolveAuditLogs<T extends Record<string, any>>(
  liveLogs: T[] | null | undefined,
  demoLogs: T[] | null | undefined
): (T & WithProvenance)[] {
  return resolveLiveWithDemoFallback(liveLogs, demoLogs, {
    primaryKey: (l) => l.id,
    sort: (a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    },
  });
}

// =========================================================================
// FINANCIAL & OPERATIONAL METRICS SEPARATION
// =========================================================================

export interface MetricSummary {
  liveTotal: number;
  demoTotal: number;
  combinedTotal: number;
  liveCount: number;
  demoCount: number;
  totalCount: number;
}

/**
 * Separates financial and operational metrics to guarantee actual revenue and
 * transaction totals are NEVER inflated by dummy/demo records.
 */
export function calculateSeparatedMetrics<T extends WithProvenance>(
  items: T[],
  valueExtractor: (item: T) => number
): MetricSummary {
  let liveTotal = 0;
  let demoTotal = 0;
  let liveCount = 0;
  let demoCount = 0;

  for (const item of items) {
    const val = valueExtractor(item) || 0;
    if (item.provenance === 'live') {
      liveTotal += val;
      liveCount += 1;
    } else {
      demoTotal += val;
      demoCount += 1;
    }
  }

  return {
    liveTotal,
    demoTotal,
    combinedTotal: liveTotal + demoTotal,
    liveCount,
    demoCount,
    totalCount: liveCount + demoCount,
  };
}

// =========================================================================
// BUSINESS OPERATION SECURITY GUARDS
// =========================================================================

/**
 * Throws a Security Exception if a business transaction is attempted on a demo record.
 * Protects payments, checkout, refunds, shipments, and inventory deductions.
 */
export function assertLiveForTransaction(
  item: { provenance?: DataProvenance; isDemo?: boolean; id?: string },
  operation: string
): void {
  if (item.provenance === 'demo' || item.isDemo === true) {
    throw new Error(
      `[SECURITY EXCEPTION] Cannot perform irreversible operational action "${operation}" on demo/synthetic entity "${item.id || 'unidentified'}". Real business operations are strictly reserved for verified live records.`
    );
  }
}

/**
 * Non-throwing check to verify if a record is eligible for real business mutations.
 */
export function isActionAllowedOnRecord(item: { provenance?: DataProvenance; isDemo?: boolean }): boolean {
  return item.provenance === 'live' && item.isDemo !== true;
}
