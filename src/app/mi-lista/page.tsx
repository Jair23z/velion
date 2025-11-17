import Header from '@/components/Header';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function MiListaPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Obtener favoritos del usuario
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      movie: {
        include: {
          genre: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <div className="pt-28 px-8 max-w-[92%] mx-auto pb-20">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mi Lista</h1>
          <p className="text-gray-400">
            {favorites.length > 0
              ? `${favorites.length} ${favorites.length === 1 ? 'película' : 'películas'} en tu lista`
              : 'Aún no has agregado películas a tu lista'}
          </p>
        </div>

        {favorites.length === 0 ? (
          // Sin favoritos
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Tu lista está vacía
            </h3>
            <p className="text-gray-400 mb-6">
              Explora el catálogo y agrega películas a tu lista para verlas más tarde
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          // Grid de películas favoritas
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {favorites.map((favorite: any) => (
              <Link
                key={favorite.id}
                href={`/movie/${favorite.movie.id}`}
                className="group relative aspect-2/3 rounded-lg overflow-hidden bg-gray-900 hover:ring-2 hover:ring-green-500 transition-all duration-300 hover:scale-105"
              >
                {favorite.movie.thumbnail ? (
                  <Image
                    src={favorite.movie.thumbnail}
                    alt={favorite.movie.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <svg
                      className="w-16 h-16 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                )}

                {/* Overlay con info */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                    {favorite.movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    {favorite.movie.year && (
                      <span>{favorite.movie.year}</span>
                    )}
                    {favorite.movie.genre && (
                      <>
                        <span>•</span>
                        <span>{favorite.movie.genre.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Badge en la esquina */}
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  ♥
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
