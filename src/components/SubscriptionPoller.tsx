"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionPoller({ paymentIntentId }: { paymentIntentId: string }) {
  const router = useRouter();
  const attemptsRef = useRef(0);
  const [attemptsUi, setAttemptsUi] = useState(0);
  const [status, setStatus] = useState<'checking' | 'found' | 'not-found' | 'error'>('checking');

  useEffect(() => {
    let mounted = true;
    const maxAttempts = 40; // ~2 minutes if interval=3s
    const interval = setInterval(async () => {
      try {
        attemptsRef.current += 1;
        if (mounted) setAttemptsUi(attemptsRef.current);

        console.log('[SubscriptionPoller] checking attempt', attemptsRef.current, paymentIntentId);
        const res = await fetch(`/api/checkout/check-subscription?paymentIntentId=${encodeURIComponent(paymentIntentId)}`);
        const data = await res.json();
        console.log('[SubscriptionPoller] response', data);
        if (!mounted) return;
        if (data?.found && data?.subscriptionId) {
          setStatus('found');
          clearInterval(interval);
          router.push(`/checkout/success?subscriptionId=${data.subscriptionId}`);
          return;
        }

        if (attemptsRef.current >= maxAttempts) {
          setStatus('not-found');
          clearInterval(interval);
        }
      } catch (e) {
        console.error('SubscriptionPoller error', e);
        if (!mounted) return;
        setStatus('error');
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentIntentId, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-900 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Procesando tu suscripción</h2>
          <p className="text-gray-300 mb-4">Estamos esperando la confirmación. Esto puede tardar unos segundos.</p>
          <p className="text-sm text-gray-400">Intentos: {attemptsUi}</p>
          {status === 'not-found' && (
            <p className="text-sm text-yellow-300 mt-4">Aún no encontramos la suscripción. Puedes volver a intentarlo más tarde o revisar tu cuenta.</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-400 mt-4">Ocurrió un error comprobando la suscripción. Revisa la consola del servidor.</p>
          )}
        </div>
      </div>
    </div>
  );
}
