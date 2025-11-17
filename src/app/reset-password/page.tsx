'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/app/actions/password';
import ErrorMessage from '@/components/ErrorMessage';
import { Logo } from '@/components/Logo';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/password';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        setToken(tokenParam);
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordInput) => {
        if (!token) {
            toast.error('Token no válido');
            return;
        }

        const result = await resetPassword(token, data);

        if (result.success) {
            toast.success(result.message);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } else {
            toast.error(result.error);
        }
    };

    if (!token) {
        return (
            <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold text-white mb-2'>Token no válido</h1>
                    <p className='text-gray-300 mb-6'>El enlace de recuperación no es válido.</p>
                    <Link
                        href='/forgot-password'
                        className='inline-block bg-green-600/80 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-medium'
                    >
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-900'>
            <div className='border-b border-b-gray-800'>
                <header className='max-w-6xl min-h-25 mx-auto flex items-center justify-between'>
                    <div className='h-15 w-40 relative'>
                        <Logo />
                    </div>

                    <Link
                        className='font-bold hover:bg-gray-800 hover:underline text-sm transition-colors duration-200 px-2 py-3 rounded-lg text-white'
                        href={'/login'}
                    >
                        Iniciar Sesión
                    </Link>
                </header>
            </div>

            <div className='max-w-sm mx-auto py-10 relative z-10'>
                <h1 className='text-3xl font-bold bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent'>Nueva contraseña</h1>
                <p className='text-gray-300 mt-3 text-sm'>
                    Ingresa tu nueva contraseña para tu cuenta de Velion.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className='mt-7 space-y-3.5'>
                    <div>
                        <label className='text-gray-200 text-lg' htmlFor="password">
                            Nueva contraseña
                        </label>
                        <input
                            className='w-full bg-gray-800 border-gray-700 border p-1.5 rounded-sm text-sm pl-3 mt-3 text-gray-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                            type="password"
                            id="password"
                            placeholder='Mínimo 6 caracteres'
                            {...register('password')}
                        />
                        {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                    </div>

                    <div>
                        <label className='text-gray-200 text-lg' htmlFor="confirmPassword">
                            Confirmar contraseña
                        </label>
                        <input
                            className='w-full bg-gray-800 border-gray-700 border p-1.5 rounded-sm text-sm pl-3 mt-3 text-gray-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                            type="password"
                            id="confirmPassword"
                            placeholder='Confirma tu contraseña'
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className='mt-5 w-full text-xl bg-green-600/80 text-white p-2 font-bold hover:bg-green-600 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-sm'
                    >
                        {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}
