"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    thumbnail: string | null;
    year: number | null;
  };
  isFavorite: boolean;
  isAuthenticated: boolean;
}

export default function MovieCard({
  movie,
  isFavorite,
  isAuthenticated,
}: MovieCardProps) {
  const router = useRouter();
  const [isFav, setIsFav] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Actualización optimista: cambia la UI inmediatamente
    const previousState = isFav;
    setIsFav(!isFav);
    setLoading(true);

    try {
      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId: movie.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar favoritos");
      }

      // ✅ No llamar router.refresh() - el cambio ya está visible
      // El estado se sincronizará cuando el usuario navegue a otra página
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      // Revertir al estado anterior en caso de error
      setIsFav(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group relative aspect-2/3 overflow-hidden rounded-lg transition-transform hover:scale-105"
    >
      <Image
        src={movie.thumbnail || "/placeholder-movie.jpg"}
        alt={movie.title}
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Botón de favorito */}
        {isAuthenticated && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold transition-all ${
              isFav
                ? "bg-red-600 text-white opacity-100"
                : "bg-black/60 text-white opacity-0 group-hover:opacity-100"
            } hover:scale-110 disabled:opacity-50`}
            title={isFav ? "Quitar de Mi Lista" : "Agregar a Mi Lista"}
          >
            <span className={loading ? "animate-pulse" : ""}>
              {isFav ? "♥" : "♡"}
            </span>
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-sm mb-1">{movie.title}</h3>
          <p className="text-xs text-gray-300">{movie.year}</p>
        </div>
      </div>
    </Link>
  );
}
