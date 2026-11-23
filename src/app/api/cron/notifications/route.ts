import { NextResponse } from 'next/server';
import { processPendingNotificationOutbox } from '@/lib/orderEmailDispatcher';

export const dynamic = 'force-dynamic';

/**
 * Validates that the cron trigger request is authentic and authorized.
 * Supports:
 * 1. Bearer token matching CRON_SECRET
 * 2. x-cron-secret header matching CRON_SECRET
 * 3. Platform cron signatures (e.g. Vercel Cron x-vercel-cron: 1)
 */
function verifyCronAuthorization(request: Request): { authorized: boolean; reason?: string } {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') || '';
  const customSecretHeader = request.headers.get('x-cron-secret') || '';
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  // 1. If CRON_SECRET is configured, strictly enforce cryptographic match
  if (cronSecret) {
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (bearerToken === cronSecret || customSecretHeader === cronSecret) {
      return { authorized: true };
    }
    return { authorized: false, reason: 'Invalid or missing CRON_SECRET authorization token.' };
  }

  // 2. Vercel Cron header verification if secret is omitted
  if (isVercelCron) {
    return { authorized: true };
  }

  // 3. Development / Sandbox fallback
  if (process.env.NODE_ENV !== 'production') {
    return { authorized: true };
  }

  return { authorized: false, reason: 'CRON_SECRET must be configured in production environment.' };
}

async function handleSweep(request: Request) {
  try {
    const auth = verifyCronAuthorization(request);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: auth.reason,
          code: 'CRON_UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxAttempts = Number(searchParams.get('maxAttempts') || 3);
    const limit = Number(searchParams.get('limit') || 50);

    const stats = await processPendingNotificationOutbox({ maxAttempts, limit });

    return NextResponse.json({
      success: true,
      stats,
      message: `Notification outbox automatic recovery sweep executed: ${stats.processed} processed, ${stats.succeeded} recovered/sent, ${stats.failed} failed.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Cron notification sweep error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Server error during outbox recovery sweep.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleSweep(request);
}

export async function POST(request: Request) {
  return handleSweep(request);
}
