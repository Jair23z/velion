import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ isPremium: false });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: {
            status: 'active',
            endDate: {
              gte: new Date(), // Solo suscripciones que no han expirado
            },
          },
          orderBy: {
            endDate: 'desc',
          },
          take: 1,
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ isPremium: false });
    }

    const activeSubscription = user.subscriptions[0];

    return NextResponse.json({
      isPremium: !!activeSubscription,
      subscription: activeSubscription
        ? {
            planName: activeSubscription.plan.name,
            endDate: activeSubscription.endDate,
            status: activeSubscription.status,
          }
        : null,
    });
  } catch (error) {
    console.error('Error verificando suscripción:', error);
    return NextResponse.json({ isPremium: false });
  }
}
