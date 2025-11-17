"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface VideoPlayerProps {
  movie: {
    id: string;
    title: string;
    videoUrl: string;
    thumbnail: string | null;
  };
  hasSubscription: boolean;
  userId?: string;
}

export default function VideoPlayer({
  movie,
  hasSubscription,
  userId,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const router = useRouter();

  const FREE_PREVIEW_SECONDS = 14; // 15 segundos de preview gratis

  // ✅ NUEVO: Usar endpoint proxy en lugar de URL directa
  // Esto valida la sesión en cada petición del video
  const videoStreamUrl = `/api/video-stream/${movie.id}`;

  const videoUrl = movie.videoUrl !== "placeholder.mp4" ? videoStreamUrl : null;
  

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !videoUrl) {
      console.log("Video ref o videoUrl no disponible aún");
      return;
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Si no tiene suscripción y ha pasado el límite de preview
      if (!hasSubscription && time >= FREE_PREVIEW_SECONDS) {
        console.log("¡Límite alcanzado! Pausando video");
        video.pause();
        setShowModal(true);
      }
    };

    const handlePlay = () => {
      // Si intenta reproducir después del límite sin suscripción
      if (!hasSubscription && video.currentTime >= FREE_PREVIEW_SECONDS) {
        video.pause();
        setShowModal(true);
      }
    };

    const onEnded = () => {
      console.log("Video terminado normalmente");
      setVideoEnded(true); // Marcar que el video terminó
    
      
      if (!hasSubscription) {
        setShowModal(true);
      }
    };

    const handleError = (e: Event) => {
      // Si el video ya terminó, no es un error
      if (videoEnded) {
        console.log("Video ya terminó, ignorando evento de error");
        return;
      }

      const videoElement = e.target as HTMLVideoElement;
      const error = videoElement.error;

      // Ignorar errores comunes que ocurren al finalizar
      if (error) {
        // MEDIA_ERR_ABORTED (1): Usuario abortó la carga
        // MEDIA_ERR_NETWORK (2): Error de red
      // MEDIA_ERR_SRC_NOT_SUPPORTED (4): Formato no soportado
               // MEDIA_ERR_DECODE (3): Error de decodificación  
   
        // Solo mostrar error si es un problema real, no al terminar
        if (error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || 
            error.code === MediaError.MEDIA_ERR_NETWORK) {
          console.error("Error cargando video:", error);
          setVideoError(true);
        } else {
          console.log("Error ignorado (probablemente relacionado con finalización):", error.code);
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("error", handleError);
    video.addEventListener("ended", onEnded);

    return () => {
      console.log("Limpiando event listeners");
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("error", handleError);
      video.removeEventListener("ended", onEnded);
    };
  }, [hasSubscription, videoUrl]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="relative w-full h-screen bg-black">
        {movie.videoUrl === "placeholder.mp4" || videoError || !videoUrl ? (
          // Placeholder cuando no hay video real o hay error
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {videoError
                  ? "Error al cargar el video"
                  : "Video no disponible"}
              </h3>
              <p className="text-gray-400 mb-6">
                {videoError
                  ? "No se pudo cargar el video. Verifica que esté subido a Cloudinary."
                  : "Este es un placeholder. Falta poner el video."}
              </p>
              {!hasSubscription && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  {userId ? "Ver Planes de Suscripción" : "Registrarse Gratis"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              poster={movie.thumbnail || undefined}
              autoPlay
              playsInline
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>

            {/* Indicador de preview (solo si no tiene suscripción) */}
            {!hasSubscription && (
              <div className="absolute top-4 right-4 bg-black/80 px-4 py-2 rounded-lg text-sm">
                Preview:{" "}
                {Math.max(0, FREE_PREVIEW_SECONDS - Math.floor(currentTime))}s
                restantes
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de suscripción */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {userId ? "¡Suscríbete para continuar!" : "¡Regístrate gratis!"}
              </h2>
              <p className="text-gray-300">
                El preview gratuito ha terminado. Suscríbete para disfrutar de
                la película completa y todo nuestro catálogo.
              </p>
            </div>

            <div className="space-y-3">
              {!userId ? (
                <>
                  <button
                    onClick={() => router.push("/register")}
                    className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
                  >
                    Crear Cuenta Gratis
                  </button>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="w-full px-6 py-3 bg-green-600 font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    Ver Planes de Suscripción
                  </button>
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full px-6 py-3 bg-gray-700 font-semibold rounded-lg hover:bg-gray-600 transition"
                  >
                    Ya tengo cuenta
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="w-full px-6 py-3 bg-red-600 font-semibold rounded-lg hover:bg-red-700 transition"
                  >
                    Ver Planes de Suscripción
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="w-full px-6 py-3 bg-gray-700 font-semibold rounded-lg hover:bg-gray-600 transition"
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => router.push("/")}
              className="mt-4 w-full text-gray-400 hover:text-white transition text-sm"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </>
  );
}
