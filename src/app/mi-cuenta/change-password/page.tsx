"use client";
import Header from "@/components/Header";
import ChangePasswordForm from './ChangePasswordForm';

export default function page() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      <Header />

      <div className="max-w-lg mx-auto pt-24 px-4 pb-10">
        <div className="bg-gray-900 p-6 border border-gray-800 rounded-lg">
          <h2 className="font-bold text-2xl  md:text-3xl mb-5">Cambiar Contraseña</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
