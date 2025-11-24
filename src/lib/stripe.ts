import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.warn('STRIPE_SECRET_KEY no está configurada. Configura la variable de entorno para usar Stripe.');
}

const stripe = new Stripe(secret || '');

export async function createCheckoutSession(params: {
  lineItems: Array<{ price_data?: any; price?: string; quantity?: number }>,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  metadata?: Record<string, string>
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'oxxo'],
    mode: 'payment',
    line_items: params.lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: params.metadata,
  });

  return session;
}

export function constructEvent(payload: Buffer, sig: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET no configurado');
  return stripe.webhooks.constructEvent(payload, sig, webhookSecret);
}

export default stripe;
