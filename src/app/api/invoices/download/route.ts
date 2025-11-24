import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { auth } from '@/lib/auth';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    if (!name) {
      return NextResponse.json({ error: 'Parámetro "name" requerido' }, { status: 400 });
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const defaultContainer = process.env.AZURE_STORAGE_CONTAINER || 'invoices';
    if (!connectionString) {
      return NextResponse.json({ error: 'Azure Storage no configurada' }, { status: 500 });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // `name` puede ser:
    // - El blob name relativo al contenedor (ej. "invoices/0001.pdf")
    // - Una URL completa al blob (ej. https://account.blob.core.windows.net/container/invoices/0001.pdf)
    let containerName = defaultContainer;
    let blobName = name;
    try {
      const parsed = new URL(name);
      // si `name` es una URL válida, extraer container y blob path
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        containerName = parts[0];
        blobName = parts.slice(1).join('/');
      } else if (parts.length === 1) {
        blobName = parts[0];
      }
    } catch (e) {
      // no es una URL; normalizar eliminando slashes iniciales
      blobName = String(name).replace(/^\/+/, '');
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    // Obtener propiedades para resolver content-type y tamaño
    const props = await blobClient.getProperties();

    const contentType = props.contentType || (path.extname(blobName).toLowerCase() === '.xml' ? 'application/xml' : 'application/octet-stream');

    // Descargar a buffer (adecuado para archivos pequeños/medianos)
    const downloadBuffer = await blobClient.downloadToBuffer();

    const filename = path.basename(blobName);
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    };
    if (typeof props.contentLength === 'number' || typeof props.contentLength === 'string') {
      headers['Content-Length'] = String(props.contentLength);
    }

    // Buffer no es BodyInit en TS/Web API; convertir a Uint8Array para la Response
    const uint8 = new Uint8Array(downloadBuffer);
    return new Response(uint8, { status: 200, headers });
  } catch (error: any) {
    console.error('Error en /api/invoices/download:', error);
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
