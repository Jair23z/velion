"use client";

import { requestPasswordReset } from "@/app/actions/password";
import ErrorMessage from "@/components/ErrorMessage";
import { Logo } from "@/components/Logo";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/password";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(""); // Limpiar errores previos
    const result = await requestPasswordReset(data);

    if (result.success) {
      setSuccess(true);
      toast.success(result.message);
    } else {
      setError(result.error || "Error al procesar la solicitud");
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="border-b border-b-gray-800">
        <header className="md:max-w-6xl pr-5 md:pr-5 min-h-25 mx-auto flex items-center justify-between">
          <div className="h-15 w-50 relative">
            <Logo />
          </div>

          <Link
            className="font-bold hover:bg-gray-800 hover:underline text-sm transition-colors duration-200 px-2 py-3 rounded-lg text-white"
            href={"/login"}
          >
            Iniciar Sesión
          </Link>
        </header>
      </div>

      <div className="md:max-w-sm mx-auto px-10 md:px-0 py-10 relative z-10">
        {!success ? (
          <>
            <h1 className="md:text-3xl text-2xl font-bold bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-gray-300 mt-3 text-sm">
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-7 space-y-3.5"
            >
              <div>
                <label className="text-gray-200 text-lg" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full bg-gray-800 border-gray-700 border p-1.5 rounded-sm text-sm pl-3 mt-3 text-gray-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50"
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <ErrorMessage>{errors.email.message}</ErrorMessage>
                )}
              </div>

              {error && (
                <ErrorMessage>{error}</ErrorMessage>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 w-full text-xl bg-green-600/80 text-white p-2 font-bold hover:bg-green-600 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
              >
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-green-600/80 hover:text-green-600 hover:underline text-sm font-medium"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-green-600 mb-4">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Email enviado!
            </h2>
            <p className="text-gray-300 mb-6">
              Hemos enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <Link
              href="/login"
              className="inline-block bg-green-600/80 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-medium"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
