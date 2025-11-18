import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

export default async function SubscriptionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtener todas las suscripciones del usuario
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusBadge = (status: string, endDate: Date) => {
    const now = new Date();
    const isExpired = endDate < now;

    if (status === "active" && !isExpired) {
      return (
        <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs font-semibold rounded-full border border-green-600/30">
          ACTIVA
        </span>
      );
    }
    if (status === "cancelled" || isExpired) {
      return (
        <span className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs font-semibold rounded-full border border-gray-600/30">
          EXPIRADA
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-600/30">
          PENDIENTE
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs font-semibold rounded-full border border-gray-600/30">
        {status.toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gray-950">
      <Header />

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 mt-8">
        <div className="flex items-center gap-3 mb-6 mt-6">
          <Link
            href="/mi-cuenta"
            className="text-gray-400 hover:text-white transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Historial de Suscripciones
            </h1>
            <p className="text-sm md:text-base text-gray-400 mt-1">
              Revisa todas tus suscripciones y genera facturas
            </p>
          </div>
        </div>
        {subscriptions.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <div className="text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-base md:text-xl text-gray-400 mb-6">
              No tienes suscripciones registradas
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition"
            >
              Ver Planes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 hover:border-gray-600 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-white">
                        Plan {subscription.plan.name}
                      </h3>
                      {getStatusBadge(subscription.status, subscription.endDate)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-gray-400 mt-4">
                      <div>
                        <span className="text-gray-500">Inicio:</span>{" "}
                        <span className="text-white">
                          {formatDate(subscription.startDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Vencimiento:</span>{" "}
                        <span className="text-white">
                          {formatDate(subscription.endDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Monto:</span>{" "}
                        <span className="text-white">
                          {formatCurrency(Number(subscription.plan.price))}
                        </span>
                      </div>
                      {subscription.invoiceNumber && (
                        <div>
                          <span className="text-gray-500">Folio:</span>{" "}
                          <span className="text-white font-mono">
                            {subscription.invoiceNumber}
                          </span>
                        </div>
                      )}
                      {subscription.paymentMethod && (
                        <div>
                          <span className="text-gray-500">Método de pago:</span>{" "}
                          <span className="text-white uppercase">
                            {subscription.paymentMethod}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 md:items-end">
                    {!subscription.invoiceIssued && subscription.status === "active" && (
                      <Link href={'/facturacion'} className="w-full md:w-auto text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                        Facturar
                      </Link>
                    )}
                    {subscription.invoiceIssued && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Facturada
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
