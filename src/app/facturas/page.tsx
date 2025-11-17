import Header from "@/components/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FacturasPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Obtener todas las facturas del usuario
  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { fecha: "desc" },
    include: {
      purchase: true,
    },
  });

  return (
    <div className="min-h-screen overflow-hidden bg-gray-950">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12 mt-20">
        {/* Encabezado */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mis Facturas</h1>
            <p className="text-gray-400">
              Descarga tus facturas en formato PDF y XML
            </p>
          </div>

          <Link
          href={'/facturacion'}
          className="bg-gray-800 p-2 rounded-lg hover:opacity-85 transition-opacity duration-200"
          >Agregar factura</Link>
        </div>

        {invoices.length === 0 ? (
          // Sin facturas
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-600"
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
            <h3 className="text-xl font-bold text-white mb-2">
              No tienes facturas aún
            </h3>

            <Link
              href="/facturacion"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Crea una aquí
            </Link>
          </div>
        ) : (
          // Lista de facturas
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Información de la factura */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        Factura {invoice.folio}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === "issued"
                            ? "bg-green-500/10 text-green-500"
                            : invoice.status === "cancelled"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {invoice.status === "issued"
                          ? "Timbrada"
                          : invoice.status === "cancelled"
                          ? "Cancelada"
                          : "Pendiente"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">RFC:</span>
                        <span className="text-white ml-2">{invoice.rfc}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Razón Social:</span>
                        <span className="text-white ml-2">
                          {invoice.razonSocial}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Fecha:</span>
                        <span className="text-white ml-2">
                          {new Date(invoice.fecha).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Total:</span>
                        <span className="text-white ml-2 font-semibold">
                          ${invoice.total.toString()} MXN
                        </span>
                      </div>
                      {invoice.uuid && (
                        <div className="col-span-2">
                          <span className="text-gray-400">UUID:</span>
                          <span className="text-white ml-2 text-xs font-mono">
                            {invoice.uuid}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de descarga */}
                  {invoice.status === "issued" && (
                    <div className="flex flex-col gap-2 md:min-w-[200px]">
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Descargar PDF
                        </a>
                      )}
                      {invoice.xmlUrl && (
                        <a
                          href={invoice.xmlUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Descargar XML
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información adicional */}
        {invoices.length > 0 && (
          <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-6 h-6 text-blue-400 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-white font-semibold mb-1">
                  Información sobre tus facturas
                </h4>
                <p className="text-sm text-gray-300">
                   Puedes
                  descargar el archivo PDF para impresión y el archivo XML para
                  tu contabilidad. Guárdalos en un lugar seguro.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
