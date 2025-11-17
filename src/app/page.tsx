import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import MovieCard from "@/components/MovieCard";

export default async function HomePage() {
  const session = await auth();

  // Obtener favoritos del usuario si está autenticado
  let userFavorites: string[] = [];
  if (session?.user?.id) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { movieId: true },
    });
    userFavorites = favorites.map((f: any) => f.movieId);
  }

  // Obtener todos los géneros con sus películas
  const genres = await prisma.genre.findMany({
    include: {
      movies: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Películas destacadas para el carousel (las 5 más recientes)
  const recentMovies = await prisma.movie.findMany({
    include: {
      genre: true,
    },
    take: 36,
  });

  const featuredMovies = recentMovies
    .sort(() => Math.random() - 0.5)
    .splice(0, 5);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header/Navbar */}
      <Header />

      {/* Hero Carousel - Películas destacadas */}
      <HeroCarousel
        movies={featuredMovies}
        userFavorites={userFavorites}
        isAuthenticated={!!session}
      />

      {/* Catálogo por géneros */}
      <section className="relative z-30 -mt-10 pb-20">
        <div className="px-6 md:px-8">
          {/* Catálogo por géneros */}
          {genres.map((genre) => (
            <div key={genre.id} className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{genre.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {genre.movies.slice(0, 6).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isFavorite={userFavorites.includes(movie.id)}
                    isAuthenticated={!!session}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA para suscripción */}
      {!session?.user.isPremium && (
        <section className="py-20 px-8 bg-linear-to-b from-transparent to-black">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              Disfruta todo el contenido sin límites
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Suscríbete ahora y accede a nuestro catálogo completo. Cancela
              cuando quieras.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-12 py-4 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition text-lg"
            >
              Ver Planes
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-8 text-center text-gray-400">
        <p>&copy; 2025 Velion. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
