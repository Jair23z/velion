import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'mxn', userId, planId, paymentMethod = 'card' } = body;

    if (!amount || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Convert to cents
    const amountCents = Math.round(Number(amount) * 100);

    // Force payment method types depending on requested method.
    // This prevents PaymentElement from showing optional wallet methods like Link.
    const paymentIntentParams: any = {
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata: { userId: String(userId), planId: String(planId || '') },
    };

    if (paymentMethod === 'card') {
      paymentIntentParams.payment_method_types = ['card'];
    } else if (paymentMethod === 'oxxo') {
      // OXXO requires specific payment method types
      paymentIntentParams.payment_method_types = ['oxxo'];
    }

    // Debugging: log paymentMethod in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[create-payment-intent] paymentMethod:', paymentMethod, 'params:', paymentIntentParams);
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating PaymentIntent:', error);
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}
