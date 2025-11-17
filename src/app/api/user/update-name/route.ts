import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    // Validar que el nombre no esté vacío
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre no puede estar vacío' },
        { status: 400 }
      );
    }

    // Validar longitud del nombre
    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: 'El nombre es demasiado largo (máximo 50 caracteres)' },
        { status: 400 }
      );
    }

    // Actualizar el nombre en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Nombre actualizado correctamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error actualizando nombre:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el nombre' },
      { status: 500 }
    );
  }
}
