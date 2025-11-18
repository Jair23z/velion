import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';
import Header from '@/components/Header';

export default async function CheckoutPage() {
  const session = await auth();

  console.log('🟦 [SERVER CHECKOUT] Session:', {
    exists: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    timestamp: new Date().toISOString()
  });

  // Verificar que el usuario esté logueado
  if (!session?.user?.id) {
    console.log('❌ [SERVER CHECKOUT] No session - redirecting to login');
    redirect('/login?callbackUrl=/checkout');
  }

  // Verificar si ya tiene suscripción activa
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: 'active',
      endDate: {
        gte: new Date(),
      },
    },
  });



  // Obtener el plan Premium
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { name: 'Premium' },
  });

  if (!plan) {
    redirect('/?error=Plan no encontrado');
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      <div className="pt-25 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              Completa tu Suscripción
            </h1>
            <p className="text-gray-300 text-lg">
              Estás a un paso de disfrutar todo el contenido sin límites
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Resumen del plan */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-white">Resumen</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Plan</p>
                    <p className="text-white font-semibold">{plan.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Duración</p>
                    <p className="text-white font-semibold">{plan.durationDays} días</p>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-gray-400 text-sm mb-2">Incluye:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-400">Total</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-white">${Number(plan.price).toFixed(2)}</span>
                        <span className="text-gray-400 ml-1">MXN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de pago */}
            <div className="lg:col-span-2">
              <CheckoutForm 
                plan={{
                  id: plan.id,
                  name: plan.name,
                  price: Number(plan.price),
                  durationDays: plan.durationDays,
                }}
                userEmail={session.user.email!}
                userId={session.user.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
