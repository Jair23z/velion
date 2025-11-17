import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSignedVideoUrl } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

/**
 * API para obtener URL firmada de video
 * Solo genera URLs válidas según el tipo de usuario
 * 🔒 SEGURIDAD: URLs firmadas con expiración
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const { movieId } = await params;
    const session = await auth();

    // 🔒 Validar que el usuario esté autenticado
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión para ver el video.' },
        { status: 401 }
      );
    }

    // Obtener película
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      console.error(`Película no encontrada: ${movieId}`);
      return NextResponse.json(
        { error: 'Película no encontrada' },
        { status: 404 }
      );
    }

    console.log('Movie found:', { id: movie.id, title: movie.title, videoUrl: movie.videoUrl });

    // Si el video es placeholder, retornar error
    if (movie.videoUrl === 'placeholder.mp4') {
      console.error('Video es placeholder');
      return NextResponse.json(
        { error: 'Video no disponible' },
        { status: 404 }
      );
    }

    // Extraer el public_id de Cloudinary de la URL
    // Ejemplo: https://res.cloudinary.com/dxl9h5yux/video/upload/v1234/velion-movies/movie-1.mp4
    // → velion-movies/movie-1
    const urlParts = movie.videoUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      console.error('URL no es de Cloudinary:', movie.videoUrl);
      return NextResponse.json(
        { error: 'URL de video inválida' },
        { status: 400 }
      );
    }
    
    const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/'); // Salta 'upload' y 'v1234'
    const publicId = publicIdWithExt.replace('.mp4', '');
    

    // Verificar si el usuario tiene suscripción activa
    const isPremium = session?.user?.isPremium || false;

    // 🔒 Generar URL firmada con expiración
    const signedUrl = getSignedVideoUrl(publicId, isPremium);
    
    // Tiempos de expiración en segundos
    const expirationSeconds = isPremium ? 86400 : 3600; // 24h premium, 1h free
    
    console.log(`🔒 URL firmada generada para ${isPremium ? 'PREMIUM' : 'FREE'} user. Expira en ${expirationSeconds}s`);
    
    return NextResponse.json({
      url: signedUrl,
      isPremium,
      expiresIn: expirationSeconds,
      message: isPremium 
        ? 'URL válida por 24 horas' 
        : 'URL válida por 1 hora. Preview de 15 segundos.',
    });
  } catch (error) {
    console.error('Error generando URL firmada:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
