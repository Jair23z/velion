import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const fiscalData = await request.json();

    // Validar campos requeridos
    const requiredFields = [
      'rfc', 'razonSocial', 'regimenFiscal', 'usoCfdi', 
      'codigoPostal', 'calle', 'numeroExterior', 'colonia', 'municipio', 'estado'
    ];

    for (const field of requiredFields) {
      if (!fiscalData[field]) {
        return NextResponse.json(
          { error: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Actualizar datos fiscales del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        rfc: fiscalData.rfc.toUpperCase(),
        razonSocial: fiscalData.razonSocial,
        regimenFiscal: fiscalData.regimenFiscal,
        usoCfdi: fiscalData.usoCfdi,
        codigoPostal: fiscalData.codigoPostal,
        calle: fiscalData.calle,
        numeroExterior: fiscalData.numeroExterior,
        numeroInterior: fiscalData.numeroInterior || null,
        colonia: fiscalData.colonia,
        municipio: fiscalData.municipio,
        estado: fiscalData.estado,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Datos fiscales actualizados correctamente',
    });

  } catch (error) {
    console.error('Error updating fiscal data:', error);
    return NextResponse.json(
      { error: 'Error al actualizar los datos fiscales' },
      { status: 500 }
    );
  }
}
