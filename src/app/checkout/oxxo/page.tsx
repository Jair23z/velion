'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';

function OxxoPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const amount = searchParams.get('amount');
  const barcodeUrl = searchParams.get('barcode_url');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) {
      router.push('/pricing');
      return;
    }
    setLoading(false);
  }, [reference, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('¡Referencia copiada al portapapeles!');
  };

  const paymentAmount = amount ? parseFloat(amount) : 0;
  const expirationDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 días por defecto

  return (
    <div className="min-h-screen overflow-hidden bg-gray-950">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ficha de Pago Generada</h1>
          <p className="text-gray-400">Realiza tu pago en cualquier tienda OXXO</p>
        </div>

        {/* Información de pago */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
            <div>
              <p className="text-sm text-gray-400 mb-1">Monto a pagar</p>
              <p className="text-4xl font-bold text-green-500">
                ${paymentAmount.toFixed(2)} MXN
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Vence el</p>
              <p className="text-lg font-semibold text-white">
                {expirationDate.toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Referencia de pago */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Referencia de pago</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reference || ''}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-lg"
              />
              <button
                onClick={() => copyToClipboard(reference || '')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-lg transition-colors"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Logo OXXO */}
          <div className="flex justify-center py-6">
            {barcodeUrl ? (
              <Image 
                src={barcodeUrl} 
                alt="Código de barras OXXO" 
                width={300} 
                height={80}
                className="mx-auto"
              />
            ) : (
              <div className="bg-yellow-400 px-8 py-4 rounded-lg">
                <p className="text-4xl font-black text-red-600">OXXO</p>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Instrucciones de pago</h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Acude a cualquier tienda OXXO</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Indica al cajero que quieres realizar un pago de servicio OXXOPay</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Dicta la referencia de pago o muestra este código</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Realiza el pago en efectivo</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              <span>Conserva tu comprobante</span>
            </li>
          </ol>
        </div>

        {/* Notas importantes */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Notas importantes</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Tu suscripción se activará automáticamente al confirmar el pago (24-48 hrs)</li>
                <li>• Recibirás un correo de confirmación cuando se procese tu pago</li>
                <li>• El pago debe realizarse antes de la fecha de vencimiento</li>
                <li>• El monto a pagar es exacto, no se aceptan pagos parciales</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Imprimir ficha
          </button>
          <button
            onClick={() => router.push('/mi-cuenta')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Ir a Mi Cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OxxoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <OxxoPageContent />
    </Suspense>
  );
}
