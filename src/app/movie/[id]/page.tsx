import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, Calendar, Star } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import FavoriteButton from '@/components/FavoriteButton';

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const session = await auth();
  const { id } = await params;
  
  // Obtener la película con su género
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      genre: true,
    },
  });

  if (!movie) {
    notFound();
  }

  // Obtener películas similares del mismo género
  const similarMovies = await prisma.movie.findMany({
    where: {
      genreId: movie.genreId,
      id: { not: movie.id }, // Excluir la película actual
    },
    take: 6,
  });

  // Verificar si el usuario tiene suscripción activa
  let hasActiveSubscription = false;
  let isFavorite = false;
  
  if (session?.user?.id) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        endDate: {
          gte: new Date(),
        },
      },
    });
    hasActiveSubscription = !!subscription;

    // Verificar si está en favoritos
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movie.id,
        },
      },
    });
    isFavorite = !!favorite;
  }

  // Formatear duración (segundos a minutos)
  const durationMinutes = Math.floor(movie.duration / 60);

  const handleWatch = () => {
    if (!session) {
      return redirect('/login?callbackUrl=/movie/' + movie.id);
    }
    if (!hasActiveSubscription) {
      return redirect('/pricing');
    }
    return redirect('/watch/' + movie.id);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      {/* Hero Section con Backdrop */}
      <div className="relative h-[60vh] md:h-[78vh] w-full">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <Image
            src={movie.backdrop || movie.thumbnail || '/placeholder.jpg'}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradientes overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-gray-950 via-transparent to-transparent" />
        </div>

        {/* Contenido sobre el backdrop */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center md:items-end pb-12 md:pb-[7%] mt-15 md:mt-0">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full items-start md:items-center">
            {/* Poster */}
            <div className="hidden md:block shrink-0 z-20">
              <div className="relative w-40 h-56 md:w-48 md:h-72 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-800">
                <Image
                  src={movie.thumbnail || '/placeholder.jpg'}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>


            {/* Info */}
            <div className="flex-1 flex flex-col justify-end space-y-3 max-w-full md:max-w-4xl">
              <h1 className="text-2xl md:text-[55px] font-bold bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-white leading-[1.05] wrap-break-word">
                {movie.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/80 rounded border border-gray-700">
                  <span className="font-semibold">{movie.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500 hidden md:block" />
                </div>
                  {/* Género */}
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-600/20 border border-green-600/50 text-green-400 rounded-full text-sm">
                  {movie.genre.name}
                </span>
              </div>
              </div>

          

              {/* Descripción */}
              <p className="text-base md:text-lg text-gray-300 max-w-full md:max-w-3xl leading-relaxed line-clamp-4">
                {movie.description}
              </p>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link
                  href={`/watch/${id}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-green-600/80 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Ver ahora
                </Link>

                {session && (
                  <div className="w-full sm:w-auto">
                    <FavoriteButton 
                      movieId={movie.id} 
                      isFavorite={isFavorite} 
                    />
                  </div>
                )}

                {session && !hasActiveSubscription && (
                  <Link
                    href="/pricing"
                    className="w-full sm:w-auto text-center px-4 py-3 border-2 border-green-600/80 text-green-400 hover:bg-green-600/10 font-semibold rounded-lg transition-colors"
                  >
                    Suscribirse
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Películas Similares */}
      {similarMovies.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-10">
          <h2 className="text-3xl font-bold text-white mb-8">
            Más de {movie.genre.name}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarMovies.map((similar: typeof similarMovies[0]) => (
              <Link
                key={similar.id}
                href={`/movie/${similar.id}`}
                className="group relative aspect-2/3 rounded-lg overflow-hidden bg-gray-800"
              >
                <Image
                  src={similar.thumbnail || '/placeholder.jpg'}
                  alt={similar.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 p-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-2">
                      {similar.title}
                    </h3>
                    <p className="text-gray-300 text-xs mt-1">{similar.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
