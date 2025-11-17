import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import ReloadButton from '@/components/ReloadButton';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ subscriptionId?: string }>;
}) {
  const session = await auth();
  const { subscriptionId } = await searchParams;

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (!subscriptionId) {
    redirect('/');
  }

  // Obtener detalles de la suscripción
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: true,
    },
  });

  if (!subscription || subscription.userId !== session.user.id) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
          {/* Icono de éxito */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold mb-3 bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-gray-300 mb-6">
            Tu suscripción ha sido activada correctamente
          </p>

          {/* Detalles de la suscripción */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="text-white font-semibold">{subscription.plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monto:</span>
                <span className="text-white font-semibold">
                  ${subscription.plan.price.toFixed(2)} MXN
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Válido hasta:</span>
                <span className="text-white font-semibold">
                  {subscription.endDate.toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                  Activa
                </span>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-3">Ahora puedes disfrutar de:</p>
            <ul className="space-y-2 text-left">
              {subscription.plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <ReloadButton
              href="/"
              className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Comenzar a Ver
            </ReloadButton>
            <Link
              href="/mi-cuenta"
              className="block w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Ver Mi Cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
