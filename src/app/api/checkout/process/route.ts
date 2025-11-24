import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import openpay from '@/lib/openpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentMethod, planId, userId, token, deviceSessionId } = body;

    // Validar datos requeridos
    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Obtener el plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error('❌ Plan no encontrado:', planId);
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

   

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (paymentMethod === 'card') {
      // Procesar pago con tarjeta usando token de OpenPay
      
      
      const chargeRequest = {
        source_id: token,
        method: 'card',
        amount: Number(plan.price),
        currency: 'MXN',
        description: `Suscripción ${plan.name} - ${plan.durationDays} días`,
        order_id: `${user.id}_${Date.now()}`,
        device_session_id: deviceSessionId,
        customer: {
          name: user.name || 'Usuario',
          email: user.email,
        },
      };

      // Crear cargo en OpenPay
      const charge = await new Promise((resolve, reject) => {
        openpay.charges.create(chargeRequest, (error: any, body: any) => {
          if (error) {
            console.error('❌ Error de OpenPay:', error);
            reject(error);
          } else {
            resolve(body);
          }
        });
      });

      // Calcular fecha de fin de suscripción
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      // Generar folio único para facturación
      const timestamp = Date.now();
      const invoiceNumber = `SUB-${timestamp}`;

      // Crear suscripción en la base de datos
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'active',
          startDate,
          endDate,
          paymentMethod: 'card',
          openpayOrderId: (charge as any).id,
          invoiceNumber,
        },
      });
      
      // IMPORTANTE: Invalidar el JWT actual para forzar recarga en el siguiente request
      // Esto se hace automáticamente porque al crear la suscripción,
      // el siguiente request del servidor verificará la DB y actualizará el token

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        message: 'Pago procesado exitosamente',
        // Agregar flag para que el cliente sepa que debe recargar la sesión
        shouldRefreshSession: true,
      });
    } else if (paymentMethod === 'oxxo') {
      // Generar ficha de pago OXXO
      const chargeRequest = {
        method: 'store',
        amount: Number(plan.price),
        currency: 'MXN',
        description: `Suscripción ${plan.name} - ${plan.durationDays} días`,
        customer: {
          name: user.name || 'Usuario',
          email: user.email,
        },
      };

      // Crear cargo en OpenPay
      const charge = await new Promise((resolve, reject) => {
        openpay.charges.create(chargeRequest, (error: any, body: any) => {
          if (error) {
            console.error('Error de OpenPay:', error);
            reject(error);
          } else {
            resolve(body);
          }
        });
      });

      const chargeData = charge as any;

      // Generar folio único para facturación
      const timestamp = Date.now();
      const invoiceNumber = `SUB-${timestamp}`;

      // Crear suscripción pendiente
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'pending',
          startDate: new Date(),
          endDate: new Date(), // Se actualizará cuando se confirme el pago
          paymentMethod: 'oxxo',
          openpayOrderId: chargeData.id,
          invoiceNumber,
        },
      });

      return NextResponse.json({
        success: true,
        reference: chargeData.payment_method.reference,
        barcode_url: chargeData.payment_method.barcode_url,
        amount: chargeData.amount,
        due_date: chargeData.due_date,
        subscriptionId: subscription.id,
      });
    }

    return NextResponse.json(
      { error: 'Método de pago no soportado' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error procesando pago:', error);
    
    // Errores específicos de OpenPay
    if (error.http_code) {
      return NextResponse.json(
        { error: error.description || 'Error al procesar el pago' },
        { status: error.http_code }
      );
    }

    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}
