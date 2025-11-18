import Header from "@/components/Header";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import EditableName from "@/components/EditableName";
import AccountActions, {
  CancelSubscriptionButton,
} from "@/components/AccountActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MiCuentaPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Obtener datos del usuario con su suscripción
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: {
          OR: [{ status: "active" }, { status: "cancelled" }],
          endDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          endDate: "desc",
        },
        take: 1,
        include: {
          plan: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const activeSubscription = user.subscriptions[0];
  const hasActiveSubscriptions =
    activeSubscription && activeSubscription.plan.isActive;
  const isCancelled = activeSubscription?.status === "cancelled";

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <div className="max-w-4xl mx-auto mt-10 px-4 py-12">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mi Cuenta</h1>
          <p className="text-sm md:text-base text-gray-400">
            Gestiona tu información personal y suscripción
          </p>
        </div>

        {/* Información Personal */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Información Personal
          </h2>

          <div className="space-y-4">
            {/* Imagen de perfil */}
            <ProfileImageUpload
              currentImage={user.image}
              userName={user.name}
            />

            {/* Nombre editable */}
            <EditableName initialName={user.name} />

            <div>
              <label className="text-sm text-gray-400">
                Correo Electrónico
              </label>
              <p className="text-white text-base md:text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Cuenta verificada</label>
              <div className="flex items-center gap-2">
                {user.emailVerified ? (
                  <>
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-500">Verificado</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-yellow-500">
                      Pendiente de verificación
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Suscripción */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Suscripción</h2>
            <Link
              href="/mi-cuenta/suscripciones"
              className="text-green-500 hover:text-green-400 text-sm font-semibold flex items-center gap-1 transition"
            >
              Ver historial
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {hasActiveSubscriptions && activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Plan Actual</p>
                  <p className="text-xl md:text-2xl font-bold text-green-500">
                    {activeSubscription.plan.name}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full ${
                    isCancelled ? "bg-yellow-500/10" : "bg-green-500/10"
                  }`}
                >
                  <span
                    className={`font-semibold ${
                      isCancelled ? "text-yellow-500" : "text-green-500"
                    }`}
                  >
                    {isCancelled ? "Cancelada" : "Activo"}
                  </span>
                </div>
              </div>

              {isCancelled && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg
                      className="w-6 h-6 text-yellow-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Suscripción cancelada
                      </h4>
                      <p className="text-sm text-gray-300">
                        Tu suscripción se canceló y tendrás acceso hasta el{" "}
                        {new Date(
                          activeSubscription.endDate
                        ).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        . Después de esa fecha, perderás el acceso al contenido
                        premium.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <label className="text-sm text-gray-400">Precio</label>
                  <p className="text-white text-base md:text-lg font-semibold">
                    ${activeSubscription.plan.price.toFixed(2)} MXN / mes
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    Próxima renovación
                  </label>
                  <p className="text-white text-base md:text-lg">
                    {activeSubscription.endDate
                      ? new Date(activeSubscription.endDate).toLocaleDateString(
                          "es-MX",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    Fecha de inicio
                  </label>
                  <p className="text-white text-base md:text-lg">
                    {new Date(activeSubscription.createdAt).toLocaleDateString(
                      "es-MX",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    Método de pago
                  </label>
                  <p className="text-white text-base md:text-lg">
                    Tarjeta de crédito/débito
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-white font-semibold mb-2">
                  Beneficios incluidos:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Acceso ilimitado a todo el catálogo
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Películas y series en HD
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sin anuncios
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cancela cuando quieras
                  </li>
                </ul>
              </div>

              {/* Botón de cancelar suscripción */}
              {!isCancelled && (
                <div className="pt-4 border-t border-gray-800">
                  <CancelSubscriptionButton />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No tienes una suscripción activa
              </h3>
              <p className="text-gray-400 mb-6">
                Suscríbete para acceder a todo el contenido sin límites
              </p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Ver Planes
              </Link>
            </div>
          )}
        </div>

        {/* Opciones adicionales */}
        <AccountActions />
      </div>
    </div>
  );
}
