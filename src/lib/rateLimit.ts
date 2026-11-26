/**
 * KALAJAY HANDCRAFTED LUXURIES — DISTRIBUTED RATE LIMITER & ABUSE SHIELD
 * Protects checkout, payment initiation, and administrative endpoints from abuse.
 * Provides fallback in-memory cache and Firestore-backed rate limiter.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

// In-memory sliding window cache for fast zero-cost checks
const memoryWindowCache = new Map<string, { count: number; expiresAt: number }>();

export async function checkRateLimit(
  identifier: string,
  prefix: string,
  config: RateLimitConfig = { maxRequests: 20, windowSeconds: 60 }
): Promise<{ allowed: boolean; remaining: number; resetSeconds: number }> {
  const now = Date.now();
  const key = `${prefix}:${identifier}`;
  const windowMs = config.windowSeconds * 1000;

  // 1. In-memory check
  const mem = memoryWindowCache.get(key);
  if (mem) {
    if (now < mem.expiresAt) {
      if (mem.count >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetSeconds: Math.ceil((mem.expiresAt - now) / 1000),
        };
      }
      mem.count += 1;
      return {
        allowed: true,
        remaining: config.maxRequests - mem.count,
        resetSeconds: Math.ceil((mem.expiresAt - now) / 1000),
      };
    } else {
      memoryWindowCache.delete(key);
    }
  }

  // Set new window in memory
  memoryWindowCache.set(key, { count: 1, expiresAt: now + windowMs });

  // Clean memory cache if it grows large
  if (memoryWindowCache.size > 2000) {
    const expiredKeys: string[] = [];
    memoryWindowCache.forEach((val, k) => {
      if (now >= val.expiresAt) expiredKeys.push(k);
    });
    expiredKeys.forEach((k) => memoryWindowCache.delete(k));
  }

  // 2. Persistent Firestore rate-limit bucket (for multi-instance serverless)
  const adminDb = getAdminFirestore();
  if (adminDb) {
    try {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
      const bucketRef = adminDb.collection('rate_limit_buckets').doc(sanitizedKey);
      const bucketSnap = await bucketRef.get();

      if (bucketSnap.exists) {
        const bData = bucketSnap.data()!;
        const bExpiresAt = Number(bData.expiresAt || 0);

        if (now < bExpiresAt) {
          const bCount = Number(bData.count || 0);
          if (bCount >= config.maxRequests) {
            return {
              allowed: false,
              remaining: 0,
              resetSeconds: Math.ceil((bExpiresAt - now) / 1000),
            };
          }
          await bucketRef.update({
            count: FieldValue.increment(1),
          });
          return {
            allowed: true,
            remaining: config.maxRequests - (bCount + 1),
            resetSeconds: Math.ceil((bExpiresAt - now) / 1000),
          };
        }
      }

      await bucketRef.set({
        key: sanitizedKey,
        count: 1,
        expiresAt: now + windowMs,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // If Firestore write fails, in-memory tier already granted access
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - 1,
    resetSeconds: config.windowSeconds,
  };
}

/**
 * Extracts a normalized client IP from standard reverse-proxy headers.
 * Prioritizes trusted provider headers (Netlify, Cloudflare, standard X-Forwarded-For).
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // 1. Netlify trusted client IP
  const netlifyIp = headers.get('x-nf-client-connection-ip');
  if (netlifyIp && netlifyIp.trim().length > 0) return netlifyIp.trim();

  // 2. Cloudflare Connecting IP
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp && cfConnectingIp.trim().length > 0) return cfConnectingIp.trim();

  // 3. X-Real-IP
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp && xRealIp.trim().length > 0) return xRealIp.trim();

  // 4. Standard X-Forwarded-For (first hop is client)
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',');
    if (ips[0] && ips[0].trim().length > 0) return ips[0].trim();
  }

  return '127.0.0.1';
}
