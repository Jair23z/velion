import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    

    // Verificar que sea una notificación de cargo
    if (body.type !== 'charge.succeeded') {
      return NextResponse.json({ received: true });
    }

    const transaction = body.transaction;
    const openpayOrderId = transaction.id;


    // Buscar la suscripción pendiente
    const subscription = await prisma.subscription.findFirst({
      where: {
        openpayOrderId: openpayOrderId,
        status: 'pending',
      },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!subscription) {
      console.error('❌ Suscripción no encontrada para:', openpayOrderId);
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }


    // Calcular fechas de activación
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + subscription.plan.durationDays);

    // Actualizar suscripción a activa
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        startDate,
        endDate,
      },
    });


    // Enviar email de confirmación al usuario
    try {
      await sendEmail({
        to: subscription.user.email,
        subject: '¡Tu suscripción ha sido activada! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Pago Confirmado!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Hola <strong>${subscription.user.name || 'Usuario'}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                ¡Excelentes noticias! Tu pago en OXXO ha sido confirmado y tu suscripción está ahora activa.
              </p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #16a34a;">
                <h3 style="margin: 0 0 15px 0; color: #16a34a;">Detalles de tu suscripción</h3>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Plan:</strong> ${subscription.plan.name}</p>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Inicio:</strong> ${startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Vence:</strong> ${endDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Folio:</strong> ${subscription.invoiceNumber || 'N/A'}</p>
              </div>

              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Ya puedes disfrutar de todo nuestro contenido sin restricciones.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://velion.app" style="background: #16a34a; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Ir a Velion
                </a>
              </div>

              <p style="font-size: 14px; color: #9ca3af; margin-top: 30px; text-align: center;">
                Si necesitas factura, puedes generarla desde tu cuenta con el folio de suscripción.
              </p>
            </div>
          </div>
        `,
      });

    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      // No fallar el webhook si el email falla
    }

    return NextResponse.json({ 
      success: true,
      subscriptionId: subscription.id,
    });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

// Permitir verificación de OpenPay
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook endpoint de OpenPay funcionando',
  });
}
