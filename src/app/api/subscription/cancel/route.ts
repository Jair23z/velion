import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener feedback del body
    const body = await request.json();
    const { reason, feedback } = body;

    // Buscar la suscripción activa del usuario
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    if (!activeSubscription) {
      return NextResponse.json(
        { error: 'No tienes una suscripción activa' },
        { status: 404 }
      );
    }

    // Procesar reembolso si hay un PaymentIntent asociado
    let refundId = null;
    if (activeSubscription.openpayOrderId) {
      try {
        // Intentar procesar reembolso en Stripe
        const refund = await stripe.refunds.create({
          payment_intent: activeSubscription.openpayOrderId,
          reason: 'requested_by_customer',
          metadata: {
            subscriptionId: activeSubscription.id,
            userId: session.user.id,
            cancellationReason: reason || 'No especificado',
          },
        });
        refundId = refund.id;
        console.log('[subscription/cancel] Refund created:', refundId);
      } catch (refundError: any) {
        console.error('[subscription/cancel] Error creating refund:', refundError);
        // Si el reembolso falla, aún cancelamos la suscripción pero no la marcamos como refunded
        // El usuario puede contactar soporte para resolverlo
      }
    }

    // Cancelar la suscripción y guardar feedback
    const now = new Date();
    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { 
        status: refundId ? 'refunded' : 'cancelled',
        cancelledAt: now,
        cancellationReason: reason,
        cancellationFeedback: feedback || null,
        refundId: refundId,
        refundedAt: refundId ? now : null,
        updatedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      refunded: !!refundId,
      message: refundId 
        ? 'Suscripción cancelada y reembolso procesado. El dinero aparecerá en tu cuenta en 5-10 días hábiles.'
        : 'Suscripción cancelada. Tendrás acceso hasta ' + 
          activeSubscription.endDate.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
    });
  } catch (error: any) {
    console.error('[subscription/cancel] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al cancelar la suscripción' },
      { status: 500 }
    );
  }
}
