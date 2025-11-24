"use client";

import { registerUser } from "@/app/actions/auth";
import ErrorMessage from "@/components/ErrorMessage";
import { Logo } from "@/components/Logo";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    const result = await registerUser(data);

    if (!result.error) {
      toast.success(
        result.message ||
          "Cuenta creada. Revisa tu email para verificar tu cuenta."
      );
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError(result.error);
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
            href={"/login"}
          >
            Iniciar Sesión
          </Link>
        </header>
      </div>

      <div className="md:max-w-sm mx-auto px-10 md:px-0 py-10 relative z-10 pt-7">
        <h1 className="text-3xl font-bold bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">Crear cuenta</h1> 
    
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3.5">
          <div>
            <label className="text-gray-200 text-lg" htmlFor="name">
              Nombre
            </label>
            <input
              className="w-full bg-gray-800 border-gray-700 border p-1.5 rounded-sm text-sm pl-3 mt-3 text-gray-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50"
              type="text"
              id="name"
              placeholder="Nombre"
              {...register("name")}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </div>

          <div>
            <label className="text-gray-200 text-lg" htmlFor="email">
              Email
            </label>
            <input
              className="w-full bg-gray-800 border-gray-700 border p-1.5 rounded-sm text-sm pl-3 mt-3 text-gray-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50"
              type="email"
              id="email"
              placeholder="Email"
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

          <div>
            <label className="text-gray-200 text-lg" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <input
              className="w-full bg-gray-800 border-gray-700 border p-1.5 rounded-sm text-sm pl-3 mt-3 text-gray-100 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50"
              type="password"
              id="confirmPassword"
              placeholder=""
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
            )}
          </div>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          <input
            type="submit"
            className="mt-5 w-full text-xl bg-green-600/80 text-white p-2 font-bold hover:bg-green-600 transition-colors duration-300 cursor-pointer rounded-sm"
            value={"Registrarse"}
          />
        </form>
      </div>
    </div>
  );
}
