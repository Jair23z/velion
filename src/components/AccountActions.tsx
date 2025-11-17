'use client';

import { signOut } from 'next-auth/react';
import CancelSubscriptionButton from '@/components/CancelSubscriptionButton';

export default function AccountActions() {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-4">Configuración</h2>
      <div className="space-y-3">
        <a
          href="/mi-cuenta/change-password"
          className="w-full cursor-pointer text-left px-4 py-3 block bg-gray-800 hover:bg-gray-750 rounded-lg text-white transition"
        >
          Cambiar contraseña
        </a>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full cursor-pointer text-left px-4 block py-3 bg-red-900/20 hover:bg-red-900/30 rounded-lg text-red-500 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export { CancelSubscriptionButton };
