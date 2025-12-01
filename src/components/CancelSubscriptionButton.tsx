'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelSubscriptionButton() {
  const router = useRouter();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el formulario de feedback
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleOpenFeedback = () => {
    setShowFeedbackModal(true);
    setError(null);
  };

  const handleSubmitFeedback = () => {
    if (!reason.trim()) {
      setError('Por favor selecciona una razón');
      return;
    }
    setShowFeedbackModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          feedback: feedback.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cancelar la suscripción');
      }

      // Cerrar modal y redirigir a home para forzar actualización completa
      setShowConfirmModal(false);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError(err.message || 'Error al cancelar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAll = () => {
    setShowFeedbackModal(false);
    setShowConfirmModal(false);
    setReason('');
    setFeedback('');
    setError(null);
  };

  const reasonOptions = [
    'Muy caro',
    'No uso el servicio lo suficiente',
    'Encontré otro servicio mejor',
    'Problemas técnicos',
    'Falta de contenido que me interese',
    'Solo lo necesitaba temporalmente',
    'Otro motivo',
  ];

  return (
    <>
      <button
        onClick={handleOpenFeedback}
        className="text-red-500 hover:text-red-400 transition cursor-pointer"
      >
        Cancelar suscripción y solicitar reembolso
      </button>

      {/* Modal 1: Feedback */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-lg w-full p-6 border border-gray-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Por qué quieres cancelar?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Tu opinión nos ayuda a mejorar el servicio
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Razones */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selecciona una razón *
              </label>
              {reasonOptions.map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                    reason === option
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option}
                    checked={reason === option}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-white text-sm">{option}</span>
                </label>
              ))}
            </div>

            {/* Comentarios adicionales */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Danos tus opiniones para mejorar (opcional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="¿Qué podríamos hacer mejor?"
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.length}/500 caracteres
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseAll}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmación de reembolso */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Confirmar cancelación y reembolso
                </h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    Al confirmar:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Tu suscripción se cancelará inmediatamente</li>
                    <li>Perderás acceso al contenido premium</li>
                    <li>Se procesará un reembolso completo</li>
                    <li className="font-semibold text-yellow-400">El reembolso puede tardar de 5 a 10 días hábiles en aparecer en tu cuenta bancaria</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCloseAll}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition disabled:opacity-50"
              >
                No, mantener suscripción
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Sí, cancelar y reembolsar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
