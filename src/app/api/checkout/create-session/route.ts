import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'mxn', planId, userId, successUrl, cancelUrl, description } = body;

    if (!amount || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Build line item with price_data for one-time payment
    const lineItems = [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: description || `Pago ${planId || ''}` },
          unit_amount: Math.round(Number(amount) * 100), // amount in cents
        },
        quantity: 1,
      },
    ];

    const session = await createCheckoutSession({
      lineItems,
      successUrl,
      cancelUrl,
      customerEmail: body.customerEmail,
      metadata: {
        planId: String(planId || ''),
        userId: String(userId || ''),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creando sesión de Stripe:', error);
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}
