"use client";

import { loginUser } from "@/app/actions/auth";
import ErrorMessage from "@/components/ErrorMessage";
import { Logo } from "@/components/Logo";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");

    // Validar en servidor
    const result = await loginUser(data);

    if (result.error) {
      setError(result.error);
    } else {
      // Usar NextAuth para crear la sesión
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Error al iniciar sesión");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="border-b border-b-gray-800">
        <header className="pl-5 md:max-w-6xl pr-5 md:pr-5 min-h-25 mx-auto flex items-center justify-between">
          <div className="h-10 w-30  md:h-15 md:w-50  relative">
            <Logo />
          </div>

          <Link
            className="font-bold hover:bg-gray-800 hover:underline text-sm transition-colors duration-200 px-2 py-3 rounded-lg text-white"
            href={"/register"}
          >
            Registrarse
          </Link>
        </header>
      </div>

      <div className="md:max-w-sm mx-auto px-10 md:px-0 py-10 relative z-10">
        <h1 className="text-3xl font-bold bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-3.5">
          <div>
            <label className="text-gray-200 text-lg" htmlFor="email">
              Email
            </label>
            <input
              className="w-full bg-gray-800 border-gray-700 border p-1.5 rounded-sm text-sm pl-3 mt-3 text-gray-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50"
              type="email"
              id="email"
              placeholder="jair121sp@gmail.com"
              {...register("email")}
            />
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </div>

          <div>
            <label className="text-gray-200 text-lg" htmlFor="password">
              Contraseña
            </label>
            <input
              className="w-full bg-gray-800 border-gray-700 border p-1.5 rounded-sm text-sm pl-3 mt-3 text-gray-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50"
              type="password"
              id="password"
              placeholder=""
              {...register("password")}
            />
            {errors.password && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-green-600/80 hover:text-green-600 hover:underline text-sm font-medium"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <input
            type="submit"
            className="mt-5 w-full text-xl bg-green-600/80 text-white p-2 font-bold hover:bg-green-600 transition-colors duration-300 cursor-pointer rounded-sm"
            value={"Iniciar Sesión"}
          />
        </form>
      </div>
    </div>
  );
}
