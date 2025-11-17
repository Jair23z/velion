'use client';

import { useEffect, useState } from 'react';
import { signOut, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AutoRefreshSession() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!session?.user?.email || isRefreshing) return;

    const refreshSession = async () => {
      setIsRefreshing(true);
      console.log('🔄 Refrescando sesión después del pago...');
      
      const email = session.user.email;
      
      // Obtener la contraseña del localStorage si la guardaste, o pedir al usuario
      // Como no tenemos la contraseña, simplemente forzamos un refresh del router
      // que hará que el servidor vuelva a verificar
      
      // El truco: eliminar la cookie de sesión y forzar nueva validación
      await signOut({ redirect: false });
      
      // Mostrar mensaje al usuario
      alert('Tu suscripción está activa. Por favor inicia sesión de nuevo para ver tus beneficios premium.');
      
      router.push('/login');
    };

    // Ejecutar después de 1 segundo para que el usuario vea la página de éxito
    const timer = setTimeout(refreshSession, 2000);
    
    return () => clearTimeout(timer);
  }, [session, isRefreshing, router]);

  return null;
}
