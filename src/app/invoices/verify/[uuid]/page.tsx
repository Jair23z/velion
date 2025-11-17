import React from 'react';
import { prisma } from '@/lib/prisma';

interface Props {
    params: { uuid: string } | Promise<{ uuid: string }>;
}

export default async function InvoiceVerifyPage({ params }: Props) {
    // Manejo de `params` que en algunas versiones llega como Promise
    const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
    const { uuid } = resolvedParams || {};

    if (!uuid) {
        return (
            <div className="min-h-screen flex items-start justify-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl bg-white shadow-sm rounded-lg p-6">
                    <h1 className="text-xl font-semibold text-gray-800">UUID no proporcionado</h1>
                    <p className="mt-2 text-sm text-gray-600">Accede a esta página mediante la URL que viene en el código QR de la factura.</p>
                </div>
            </div>
        );
    }



    const invoice = await prisma.invoice.findUnique({ where: { uuid } });

    if (!invoice) {
        return (
            <div className="min-h-screen flex items-start justify-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl bg-white shadow-sm rounded-lg p-6">
                    <h1 className="text-xl font-semibold text-gray-800">Factura no encontrada</h1>
                    <p className="mt-2 text-sm text-gray-600">El comprobante solicitado no existe o ya fue eliminado.</p>
                </div>
            </div>
        );
    }

    const subtotal = Number(invoice.subtotal).toFixed(2);
    const iva = Number(invoice.iva).toFixed(2);
    const total = Number(invoice.total).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <header className="bg-white shadow rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-teal-700">VELION</h2>
                        <div className="text-sm text-gray-500">Representación impresa de CFDI</div>
                    </div>

                    <div className="text-sm text-gray-700 text-left sm:text-right">
                        <div className="font-medium">Folio: <span className="text-gray-600">{invoice.serie}-{invoice.folio}</span></div>
                        <div className="truncate">UUID: <span className="text-gray-600">{invoice.uuid}</span></div>
                        <div>Estado: <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-100 text-emerald-800">Emitido</span></div>
                    </div>
                </header>

                <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <section className="md:col-span-2 bg-white shadow rounded-lg p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-800">Datos del receptor</h3>
                        <div className="mt-3 space-y-2 text-sm text-gray-700">
                            <div><span className="font-medium">RFC:</span> {invoice.rfc}</div>
                            <div><span className="font-medium">Razón social:</span> {invoice.razonSocial}</div>
                            <div><span className="font-medium">Domicilio:</span> {invoice.domicilio}</div>
                            <div><span className="font-medium">Código Postal:</span> {invoice.codigoPostal}</div>
                        </div>
                    </section>

                    <aside className="bg-white shadow rounded-lg p-4 sm:p-6 flex flex-col justify-between">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800">Importes</h4>
                            <div className="mt-3 text-sm text-gray-700 space-y-1">
                                <div>Subtotal: <span className="font-medium">${subtotal}</span></div>
                                <div>IVA: <span className="font-medium">${iva}</span></div>
                                <div className="mt-2 text-teal-700 font-semibold">Total: <span className="font-medium">${total} MXN</span></div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-800">Descargas</h5>
                            <div className="mt-2 flex flex-col gap-2">
                                {invoice.pdfUrl && (
                                    <a
                                        href={invoice.pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
                                    >
                                        Descargar PDF
                                    </a>
                                )}
                                {invoice.xmlUrl && (
                                    <a
                                        href={invoice.xmlUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100"
                                    >
                                        Descargar XML
                                    </a>
                                )}
                            </div>
                        </div>
                    </aside>
                </main>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Si el archivo no se abre, asegúrate de que el servidor esté corriendo y accesible desde tu red local.</p>
                </div>
            </div>
        </div>
    );
}
