'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelSubscriptionButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cancelar la suscripción');
      }

      // Cerrar modal y refrescar la página
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError(err.message || 'Error al cancelar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-500 hover:text-red-400 transition cursor-pointer"
      >
        Cancelar suscripción
      </button>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">
              ¿Cancelar suscripción?
            </h3>
            
            <p className="text-gray-300 mb-6">
              Tu suscripción se cancelará y perderás el acceso a contenido premium 
              al finalizar el período actual. Podrás volver a suscribirte cuando quieras.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition disabled:opacity-50"
              >
                No, mantener
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
