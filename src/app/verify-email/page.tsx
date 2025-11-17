'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/app/actions/verify-email';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (!token) {
            setStatus('error');
            setMessage('Token no válido');
            return;
        }

        verifyEmail(token).then((result) => {
            if (result.success) {
                setStatus('success');
                setMessage('¡Email verificado correctamente!');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(result.error || 'Error al verificar el email');
            }
        });
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-700">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <h1 className="text-2xl font-bold text-white mb-2">Verificando email...</h1>
                        <p className="text-gray-300">Por favor espera un momento</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">¡Email verificado!</h1>
                        <p className="text-gray-300 mb-4">{message}</p>
                        <p className="text-sm text-gray-400">Serás redirigido al login en unos segundos...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
                        <p className="text-gray-300 mb-6">{message}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-green-600/80 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            Ir al login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
