import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import Link from 'next/link';

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // Buscar la película
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      genre: true,
    },
  });

  if (!movie) {
    notFound();
  }

  // Verificar si el usuario tiene suscripción activa desde la sesión
  const hasActiveSubscription = session?.user?.isPremium || false;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-linear-to-b from-black to-transparent">
        <nav className="flex items-center justify-between px-8 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-gray-300 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver
          </Link>
        </nav>
      </header>

      {/* Video Player */}
      <VideoPlayer
        movie={movie}
        hasSubscription={hasActiveSubscription}
        userId={session?.user?.id}
      />

      {/* Información de la película */}
      <div className="px-8 py-8 max-w-4xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center gap-4 text-gray-300 mb-4">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{Math.floor(movie.duration / 60)} min</span>
              <span>•</span>
              <span>{movie.rating}</span>
              <span>•</span>
              <span>{movie.genre.name}</span>
            </div>
          </div>
        </div>
        <p className="text-lg text-gray-300 leading-relaxed">
          {movie.description}
        </p>

        {!hasActiveSubscription && (
          <div className="mt-8 p-6 bg-linear-to-r from-green-900/50 to-purple-900/50 rounded-lg border border-green-500/20">
            <h3 className="text-2xl font-bold mb-2">
              ¿Quieres ver la película completa?
            </h3>
            <p className="text-gray-300 mb-4">
              Suscríbete ahora y disfruta de todo nuestro catálogo sin límites.
            </p>
            <div className="flex gap-4">
              <Link
                href="/pricing"
                className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Ver Planes
              </Link>
              {!session && (
                <Link
                  href="/register"
                  className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  Registrarse Gratis
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
