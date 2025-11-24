import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
    }

    // Retrieve PaymentIntent from Stripe to verify and read metadata
    const pi = await stripe.paymentIntents.retrieve(String(paymentIntentId));

    const userId = pi.metadata?.userId;
    const planId = pi.metadata?.planId;

    if (!userId || !planId) {
      return NextResponse.json({ error: 'PaymentIntent missing metadata' }, { status: 400 });
    }

    // Idempotency: don't create duplicate subscriptions
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: String(userId), planId: String(planId), status: 'active' }
    });

    if (existingSub) {
      return NextResponse.json({ subscriptionId: existingSub.id });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: String(planId) } });
    const now = new Date();
    const durationDays = plan?.durationDays ?? 30;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Generate a unique invoice/folio for this subscription
    const invoiceNumber = `SUB-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

    const created = await prisma.subscription.create({
      data: {
        userId: String(userId),
        planId: String(planId),
        status: 'active',
        startDate: now,
        endDate,
        paymentMethod: 'card',
        openpayOrderId: String(paymentIntentId),
        invoiceNumber,
      }
    });
    return NextResponse.json({ subscriptionId: created.id });
  } catch (err: any) {
    console.error('Error finalizing subscription:', err);
    return NextResponse.json({ error: err?.message || 'Error' }, { status: 500 });
  }
}
