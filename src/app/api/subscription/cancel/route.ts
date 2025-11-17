import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

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

    // Cancelar la suscripción
    // La suscripción permanece activa hasta la fecha de finalización
    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { 
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada. Tendrás acceso hasta ' + 
               activeSubscription.endDate.toLocaleDateString('es-MX', {
                 year: 'numeric',
                 month: 'long',
                 day: 'numeric',
               }),
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Error al cancelar la suscripción' },
      { status: 500 }
    );
  }
}
