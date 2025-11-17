import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { invoiceNumber } = await request.json();

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Folio requerido' },
        { status: 400 }
      );
    }

    // Buscar la suscripción por folio
    const subscription = await prisma.subscription.findUnique({
      where: {
        invoiceNumber,
      },
      include: {
        plan: true,
        user: {
          select: {
            rfc: true,
            razonSocial: true,
            regimenFiscal: true,
            usoCfdi: true,
            codigoPostal: true,
            calle: true,
            numeroExterior: true,
            numeroInterior: true,
            colonia: true,
            municipio: true,
            estado: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Folio no encontrado. Verifica que sea correcto.' },
        { status: 404 }
      );
    }

    // Verificar que la suscripción pertenece al usuario
    if (subscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Este folio no pertenece a tu cuenta' },
        { status: 403 }
      );
    }

    // Verificar que la suscripción no esté ya facturada
    if (subscription.invoiceIssued) {
      return NextResponse.json(
        { error: 'Esta suscripción ya tiene una factura generada' },
        { status: 400 }
      );
    }

    // Verificar que la suscripción esté activa o pagada
    if (subscription.status === 'pending') {
      return NextResponse.json(
        { error: 'El pago de esta suscripción aún está pendiente' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        invoiceNumber: subscription.invoiceNumber,
        createdAt: subscription.createdAt,
        paymentMethod: subscription.paymentMethod,
        plan: {
          name: subscription.plan.name,
          price: subscription.plan.price,
        },
      },
      userData: subscription.user,
    });
  } catch (error) {
    console.error('Error validando folio:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
