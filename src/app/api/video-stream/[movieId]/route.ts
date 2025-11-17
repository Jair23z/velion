import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Proxy de video que valida sesión en cada petición
 * Los videos se sirven a través de este endpoint, no directamente desde Cloudinary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const { movieId } = await params;
    
    // 🔒 PASO 1: Obtener sesión (opcional para preview)
    const session = await auth();
    const isAuthenticated = !!session?.user?.id;

    // 🔒 PASO 2: Obtener película
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Película no encontrada' },
        { status: 404 }
      );
    }

    // 🔒 PASO 3: Construir URL de Cloudinary
    // Usuarios sin sesión o sin suscripción: 15 segundos
    // Usuarios premium: video completo
    const isPremium = session?.user?.isPremium || false;
    
    // Extraer public_id de la URL de Cloudinary
    const urlParts = movie.videoUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) {
      return NextResponse.json(
        { error: 'URL de video inválida' },
        { status: 400 }
      );
    }
    
    const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExt.replace('.mp4', '');

    // Construir URL de Cloudinary con transformaciones
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    let cloudinaryUrl: string;

    if (isPremium) {
      // Premium: video completo
      cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/${publicId}.mp4`;
    } else {
      // Free: 15 segundos
      cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/video/upload/du_15,q_auto,f_auto/${publicId}.mp4`;
    }

    // 🔒 PASO 4: Hacer fetch del video desde Cloudinary
    const videoResponse = await fetch(cloudinaryUrl);

    if (!videoResponse.ok) {
      return NextResponse.json(
        { error: 'Error al cargar video desde Cloudinary' },
        { status: videoResponse.status }
      );
    }

    // 🔒 PASO 5: Stream el video directamente sin cargarlo todo en memoria
    // Esto permite streaming progresivo y menos uso de RAM
    return new NextResponse(videoResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoResponse.headers.get('Content-Length') || '',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Accept-Ranges': 'bytes',
      },
    });

  } catch (error) {
    console.error('Error en video-stream:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
