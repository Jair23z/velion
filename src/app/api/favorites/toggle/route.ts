import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { movieId } = body;

    if (!movieId) {
      return NextResponse.json(
        { error: 'movieId es requerido' },
        { status: 400 }
      );
    }

    // Verificar si la película existe
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Película no encontrada' },
        { status: 404 }
      );
    }

    // Buscar si ya existe en favoritos
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId,
        },
      },
    });

    if (existingFavorite) {
      // Si existe, eliminarlo (quitar de favoritos)
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });

      return NextResponse.json({
        success: true,
        isFavorite: false,
        message: 'Eliminado de Mi Lista',
      });
    } else {
      // Si no existe, agregarlo (agregar a favoritos)
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          movieId: movieId,
        },
      });

      return NextResponse.json({
        success: true,
        isFavorite: true,
        message: 'Agregado a Mi Lista',
      });
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar favoritos' },
      { status: 500 }
    );
  }
}
