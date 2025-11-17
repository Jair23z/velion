'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function PricingButton() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const href = session 
    ? '/pricing' 
    : `/login?callbackUrl=${encodeURIComponent(pathname || '/')}`;

  return (
    <Link
      href={href}
      className="inline-block px-12 py-4 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition text-lg"
    >
      {session ? 'Ver Planes' : 'Iniciar Sesión'}
    </Link>
  );
}
