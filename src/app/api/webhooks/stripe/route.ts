import { NextRequest, NextResponse } from 'next/server';
import { constructEvent } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const sig = request.headers.get('stripe-signature') || '';
    const arrayBuffer = await request.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    let event;
    try {
      event = constructEvent(buf, sig);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }


    // Idempotency: check if we've already processed this event
    const eventId = event.id as string;
    try {
      const existing = await prisma.webhookEvent.findUnique({ where: { eventId } });
      if (existing) {
        return NextResponse.json({ received: true });
      }
    } catch (e) {
      console.error('Error checking webhookEvent table:', e);
      // proceed - we don't want to fail just because of monitoring problems
    }

    // Manejar eventos relevantes
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        try {
          // Dump the session payload for debugging (trim large objects if necessary)
          try {
          } catch (e) {
            console.warn('Could not stringify session payload for logging');
          }

          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;

          // Ensure metadata exists; if not, log metadata specifically for debugging
          if (!userId || !planId) {
            console.warn('Session missing metadata.userId or metadata.planId');
            console.warn('Session.metadata:', JSON.stringify(session.metadata));
            console.warn('Session.payment_status:', session.payment_status, 'mode:', session.mode);
            console.warn('Session.customer:', session.customer);
            console.warn('Session.description:', session.description);
          } else {
            // Find plan to determine duration/price
            const plan = await prisma.subscriptionPlan.findUnique({ where: { id: String(planId) } });

            // Check for existing active subscription for this user+plan
            const existingSub = await prisma.subscription.findFirst({
              where: { userId: String(userId), planId: String(planId), status: 'active' }
            });

            if (existingSub) {
            } else {
              const now = new Date();
              const durationDays = plan?.durationDays ?? 30;
              const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

              const invoiceNumber = `SUB-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

              await prisma.subscription.create({
                data: {
                  userId: String(userId),
                  planId: String(planId),
                  status: 'active',
                  startDate: now,
                  endDate,
                  paymentMethod: 'card',
                  openpayOrderId: session.id,
                  invoiceNumber,
                }
              });

            }
          }
        } catch (e) {
          console.error('Error handling checkout.session.completed webhook:', e);
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        try {
          const userId = pi.metadata?.userId;
          const planId = pi.metadata?.planId;

          if (!userId || !planId) {
            console.warn('PaymentIntent missing metadata.userId or metadata.planId, payload:', JSON.stringify(pi));
          } else {
            const plan = await prisma.subscriptionPlan.findUnique({ where: { id: String(planId) } });

            const existingSub = await prisma.subscription.findFirst({
              where: { userId: String(userId), planId: String(planId), status: 'active' }
            });

            if (existingSub) {
            } else {
              const now = new Date();
              const durationDays = plan?.durationDays ?? 30;
              const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

              const invoiceNumber = `SUB-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

              await prisma.subscription.create({
                data: {
                  userId: String(userId),
                  planId: String(planId),
                  status: 'active',
                  startDate: now,
                  endDate,
                  paymentMethod: 'card',
                  openpayOrderId: pi.id,
                  invoiceNumber,
                }
              });

            }
          }
        } catch (e) {
          console.error('Error handling payment_intent.succeeded webhook:', e);
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as any;
        try {
          console.log('[webhook] charge.refunded received', { chargeId: charge.id, paymentIntent: charge.payment_intent });

          // Buscar la suscripción por PaymentIntent ID
          const subscription = await prisma.subscription.findFirst({
            where: { openpayOrderId: String(charge.payment_intent) }
          });

          if (subscription) {
            // Actualizar suscripción con datos del reembolso
            const now = new Date();
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'refunded',
                refundedAt: now,
                refundId: charge.refunds?.data?.[0]?.id || null,
                updatedAt: now,
              }
            });
            console.log('[webhook] Subscription marked as refunded', { subscriptionId: subscription.id });
          } else {
            console.warn('[webhook] No subscription found for refunded charge', { paymentIntent: charge.payment_intent });
          }
        } catch (e) {
          console.error('[webhook] Error handling charge.refunded:', e);
        }
        break;
      }
      default:
    }

    // Record that we've processed this event (idempotency)
    try {
      // Ensure payload is a plain JSON value (Prisma Json field expects JSON-compatible data)
      const safePayload = JSON.parse(JSON.stringify(event));
      await prisma.webhookEvent.create({ data: { eventId: eventId, eventType: event.type, payload: safePayload } });
    } catch (e) {
      console.error('Error saving webhookEvent:', e);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error en webhook de Stripe:', error);
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}
