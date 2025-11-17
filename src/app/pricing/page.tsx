import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import Header from '@/components/Header';

export default async function PricingPage() {
  const session = await auth();

  // Obtener los planes de suscripción
  const plans = await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      price: 'asc',
    },
  });

  // Verificar si el usuario ya tiene una suscripción activa
  let activeSubscription = null;
  if (session?.user?.id) {
    activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        plan: true,
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
          Elige el plan perfecto para ti
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Disfruta de todo nuestro catálogo sin límites. Cancela cuando quieras.
        </p>
      </section>

      {/* Suscripción activa */}
      {activeSubscription && (
        <section className="max-w-4xl mx-auto px-8 mb-12">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-2xl font-bold text-green-500">
                Suscripción Activa
              </h2>
            </div>
            <p className="text-gray-300">
              Plan actual: <span className="font-semibold">{activeSubscription.plan.name}</span>
            </p>
            <p className="text-gray-300">
              Válido hasta:{' '}
              <span className="font-semibold">
                {new Date(activeSubscription.endDate).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>
          </div>
        </section>
      )}

      {/* Planes */}
      <section className="max-w-xl mx-auto px-8 pb-20">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-lg p-8 bg-linear-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50"
          >
            <div className="bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
              PLAN ÚNICO
            </div>
            <h3 className="text-4xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-6xl font-bold">${plan.price.toString()}</span>
              <span className="text-gray-300 text-xl">/mes</span>
            </div>
            <p className="text-gray-300 mb-8 text-lg">{plan.description}</p>
            
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-500 mt-0.5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-lg">{feature}</span>
                </li>
              ))}
            </ul>

            {session ? (
              activeSubscription?.planId === plan.id ? (
                <button
                  disabled
                  className="w-full py-4 bg-gray-600 rounded-lg font-semibold cursor-not-allowed text-lg"
                >
                  ✓ Ya tienes este plan
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="block w-full py-4 rounded-lg font-semibold text-center transition bg-green-600 hover:bg-green-700 text-white text-lg"
                >
                  Suscribirse por $1 MXN
                </Link>
              )
            ) : (
              <Link
                href="/checkout"
                className="block w-full py-4 rounded-lg font-semibold text-center transition bg-green-600 hover:bg-green-700 text-white text-lg"
              >
                Empezar Ahora
              </Link>
            )}
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-8 pb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">
              ¿Puedo cancelar en cualquier momento?
            </h3>
            <p className="text-gray-300">
              Sí, puedes cancelar tu suscripción en cualquier momento sin penalización.
              Tu acceso continuará hasta el final del período que ya pagaste.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">
              ¿Hay contenido gratis?
            </h3>
            <p className="text-gray-300">
              Sí, puedes ver los primeros 15 segundos de cualquier contenido sin necesidad
              de suscribirte. Solo necesitas crear una cuenta gratuita.
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">
              ¿Qué métodos de pago aceptan?
            </h3>
            <p className="text-gray-300">
              Aceptamos tarjetas de crédito, débito, OXXO y transferencias SPEI a través
              de Openpay.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-8 text-center text-gray-400">
        <p>&copy; 2024 Velion. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
