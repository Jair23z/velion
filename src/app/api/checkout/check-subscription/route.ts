import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const paymentIntentId = url.searchParams.get('paymentIntentId') || url.searchParams.get('pi');
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
    }

    const sub = await prisma.subscription.findFirst({ where: { openpayOrderId: String(paymentIntentId) } });
    if (!sub) return NextResponse.json({ found: false });
    return NextResponse.json({ found: true, subscriptionId: sub.id });
  } catch (err: any) {
    console.error('[check-subscription] error', err);
    return NextResponse.json({ error: err?.message || 'Error' }, { status: 500 });
  }
}
