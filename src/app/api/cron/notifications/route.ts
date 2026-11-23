import { NextResponse } from 'next/server';
import {
  processPendingNotificationOutbox,
  verifyCronAuthorization,
} from '@/lib/orderEmailDispatcher';

export const dynamic = 'force-dynamic';

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
