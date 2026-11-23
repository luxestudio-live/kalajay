import { NextResponse } from 'next/server';
import { GET as getById } from '@/app/api/orders/[id]/invoice/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId') || searchParams.get('order') || searchParams.get('id') || '';
  if (!orderId) {
    return NextResponse.json(
      { success: false, error: 'Query parameter orderId is required. Example: /api/orders/invoice?orderId=KJ-8924' },
      { status: 400 }
    );
  }
  return getById(request, { params: { id: orderId } });
}
