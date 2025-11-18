"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";

interface Movie {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  backdrop: string | null;
  year: number | null;
  rating: string | null;
  genre: {
    name: string;
  };
}

interface HeroCarouselProps {
  movies: Movie[];
  userFavorites?: string[];
  isAuthenticated: boolean;
}

export default function HeroCarousel({
  movies,
  userFavorites = [],
  isAuthenticated,
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // ✅ Estado de favoritos a nivel de carousel (persiste entre slides)
  const [favorites, setFavorites] = useState<string[]>(userFavorites);

  // Auto-play del carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, movies.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % movies.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);
    setIsAutoPlaying(false);
  };

  if (movies.length === 0) return null;

  const currentMovie = movies[currentSlide];

  const isFavorite = favorites.includes(currentMovie.id);  
  
  return (
    <section className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden py-2 md:py-0">
      {/* Background Image con efecto parallax */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={
                movie.backdrop || movie.thumbnail || "/placeholder-movie.jpg"
              }
              alt={movie.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Gradientes overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Contenido del slide actual */}
      <div className="relative z-20 h-full flex flex-col justify-center px-4 md:px-26 max-w-5xl">
        <div className="space-y-4 animate-fade-in">
          {/* Badge del género */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-600/80 text-white text-[0.6rem] font-bold uppercase rounded">
              VELION ORIGINAL
            </span>
            <span className="px-3 py-1 bg-green-600/20 border border-green-600/50 text-green-400 rounded-full text-sm">
              {currentMovie.genre.name}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            {currentMovie.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm md:text-base text-gray-300">
            {currentMovie.year && <span>{currentMovie.year}</span>}
            {currentMovie.year && currentMovie.rating && <span>•</span>}
            {currentMovie.rating && (
              <span className="px-2 py-0.5 border border-gray-400 rounded text-xs">
                {currentMovie.rating}
              </span>
            )}
          </div>

          {/* Descripción */}
          <p className="text-sm md:text-lg text-gray-200 line-clamp-3 md:line-clamp-3 max-w-2xl leading-relaxed">
            {currentMovie.description}
          </p>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/movie/${currentMovie.id}`}
              className="px-8 py-3 bg-green-600/80 hover:bg-green-600 text-white font-bold rounded-md text-sm md:text-base transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Ver ahora
            </Link>
            {isAuthenticated && (
              <FavoriteButton
                key={currentMovie.id}
                movieId={currentMovie.id}
                isFavorite={isFavorite}
                onToggle={(newState) => {
                  if (newState) {
                    setFavorites(prev => [...prev, currentMovie.id]);
                  } else {
                    setFavorites(prev => prev.filter(id => id !== currentMovie.id));
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Controles de navegación - Flechas */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:opacity-100 opacity-50 cursor-pointer top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all backdrop-blur-sm group"
        aria-label="Anterior"
      >
        <svg
          className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute cursor-pointer md:opacity-100 opacity-50 right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all backdrop-blur-sm group"
        aria-label="Siguiente"
      >
        <svg
          className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Indicadores de slides (dots) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all cursor-pointer  ${
              index === currentSlide
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/70"
            } rounded-full`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
