'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionUpdater() {
  const router = useRouter();
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (updated) return;
    
    console.log('🔄 Redirigiendo a home para actualizar sesión');
    setUpdated(true);
    
    // Redirigir inmediatamente a la home
    // El nuevo request al servidor forzará la verificación de la suscripción
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 2000); // Esperar 2 segundos para que el usuario vea la página de éxito
    
  }, [router, updated]);

  return null;
}
