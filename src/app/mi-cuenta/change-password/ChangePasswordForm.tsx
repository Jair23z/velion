"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validations/password";
import ErrorMessage from "@/components/ErrorMessage";

type ChangePasswordFormData = {
  password: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Error cambiando contraseña");
      } else {
        setMessage(json?.message || "Contraseña actualizada correctamente");
        reset();
        setTimeout(() => router.refresh(), 500);
      }
    } catch (err) {
      console.error(err);
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded">
          {message}
        </div>
      )}

      <div>
        <label className="text-base" htmlFor="password">
          Contraseña actual:
        </label>
        <input
          type="password"
          id="password"
          className="w-full border rounded-sm border-gray-50 mt-3 p-1 pl-3"
          {...register("password")}
        />
        {errors.password && (
          <ErrorMessage>{errors.password.message}</ErrorMessage>
        )}
      </div>

      <div>
        <label className="text-base" htmlFor="newPassword">
          Nueva contraseña:
        </label>
        <input
          type="password"
          id="newPassword"
          className="w-full border rounded-sm border-gray-50 mt-3 p-1 pl-3"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <ErrorMessage>{errors.newPassword.message}</ErrorMessage>
        )}
      </div>

      <div>
        <label className="text-base" htmlFor="confirmPassword">
          Repetir contraseña:
        </label>
        <input
          type="password"
          id="confirmPassword"
          className="w-full border rounded-sm border-gray-50 mt-3 p-1 pl-3"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
        )}
      </div>

      <input
        className="w-full p-2 bg-green-800 mt-1 font-bold rounded-sm hover:bg-green-900 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        value={loading ? "Cambiando..." : "Cambiar contraseña"}
        disabled={loading}
      />
    </form>
  );
}
