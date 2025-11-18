"use client";

import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  movieId: string;
  isFavorite: boolean;
  onToggle?: (newState: boolean) => void;
}

export default function FavoriteButton({
  movieId,
  isFavorite,
  onToggle,
}: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  // Sincronizar con el prop cuando cambia
  useEffect(() => {
    setLocalIsFavorite(isFavorite);
  }, [isFavorite]);

  const toggleFavorite = async () => {
    const previousState = localIsFavorite;
    const newState = !localIsFavorite;

    // Actualización optimista
    setLocalIsFavorite(newState);
    if (onToggle) {
      onToggle(newState); // Notificar al padre
    }
    setLoading(true);

    try {
      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar favoritos");
      }

      // ✅ No llamar router.refresh() - confiar en el estado optimista
      // El estado se sincronizará automáticamente cuando el usuario navegue
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      // Revertir al estado anterior en caso de error
      setLocalIsFavorite(previousState);
      if (onToggle) {
        onToggle(previousState); // Notificar al padre
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center cursor-pointer gap-2 px-4 py-2 text-xs md:text-base rounded-lg font-semibold transition-all duration-300 ${
        localIsFavorite
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={localIsFavorite ? "Quitar de Mi Lista" : "Agregar a Mi Lista"}
    >
      <svg
        className={`w-5 h-5 transition-transform ${
          loading ? "animate-pulse" : ""
        }`}
        fill={localIsFavorite ? "currentColor" : "none"}
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
      {localIsFavorite ? "En Mi Lista" : "Mi Lista"}
    </button>
  );
}
