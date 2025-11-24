import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateCFDI } from '@/lib/cfdi-generator';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { uploadStringToBlob, uploadBufferToBlob } from '@/lib/azure';
import { v4 as uuidv4 } from 'uuid';

// Mapear método de pago de Openpay a clave SAT
function getFormaPagoSAT(paymentMethod: string | null): string {
  switch (paymentMethod) {
    case 'card':
      return '04'; // Tarjeta de crédito
    case 'oxxo':
      return '01'; // Efectivo
    case 'spei':
      return '03'; // Transferencia electrónica
    default:
      return '99'; // Por definir
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { invoiceNumber, fiscalData } = await request.json();

    // Validar datos requeridos
    if (!invoiceNumber || !fiscalData) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Buscar la suscripción
    const subscription = await prisma.subscription.findUnique({
      where: { invoiceNumber },
      include: { plan: true },
    });

    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    if (subscription.invoiceIssued) {
      return NextResponse.json(
        { error: 'Esta suscripción ya tiene factura' },
        { status: 400 }
      );
    }

    // Obtener el último folio
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { folio: 'desc' },
    });

    const nextFolioNumber = lastInvoice
      ? parseInt(lastInvoice.folio) + 1
      : 1;
    const folio = nextFolioNumber.toString().padStart(6, '0');

    // Calcular montos
    const subtotal = Number(subscription.plan.price) / 1.16;
    const iva = Number(subscription.plan.price) - subtotal;
    const total = Number(subscription.plan.price);

    // Determinar forma de pago automáticamente desde Openpay
    const formaPago = getFormaPagoSAT(subscription.paymentMethod);

    // Crear domicilio fiscal
    const domicilio = `${fiscalData.calle} ${fiscalData.numeroExterior}${
      fiscalData.numeroInterior ? ` Int. ${fiscalData.numeroInterior}` : ''
    }, ${fiscalData.colonia}, ${fiscalData.municipio}, ${fiscalData.estado}, C.P. ${fiscalData.codigoPostal}`;

    // Generar UUID único para el timbrado
    const uuid = uuidv4().toUpperCase();

    // Generar XML usando el generador actualizado
    const xml = generateCFDI({
      folio,
      serie: 'A',
      fecha: new Date(),
      rfc: fiscalData.rfc.toUpperCase(),
      razonSocial: fiscalData.razonSocial,
      regimenFiscal: fiscalData.regimenFiscal,
      usoCfdi: fiscalData.usoCfdi,
      codigoPostal: fiscalData.codigoPostal,
      domicilio,
      formaPago,
      metodoPago: 'PUE', // Pago en Una sola Exhibición
      subtotal,
      iva,
      total,
      uuid,
    });

    // Subir XML directamente a Azure (no guardamos localmente)
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      console.error('AZURE_STORAGE_CONNECTION_STRING no está configurada');
      return NextResponse.json({ error: 'Azure Storage no configurada' }, { status: 500 });
    }

    const xmlBlobName = `invoices/${folio}.xml`;
    let xmlUrl: string;
    try {
      xmlUrl = await uploadStringToBlob(xml, xmlBlobName, 'application/xml');
    } catch (e: any) {
      console.error('Error subiendo XML a Azure:', e);
      return NextResponse.json({ error: 'Error subiendo XML a Azure: ' + (e.message || String(e)) }, { status: 500 });
    }

    // Generar PDF en memoria y subir a Azure
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/invoices/verify/${uuid}`;
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateInvoicePDF(
        {
          folio,
          serie: 'A',
          uuid,
          fecha: new Date(),
          rfc: fiscalData.rfc.toUpperCase(),
          razonSocial: fiscalData.razonSocial,
          regimenFiscal: fiscalData.regimenFiscal,
          usoCfdi: fiscalData.usoCfdi,
          codigoPostal: fiscalData.codigoPostal,
          domicilio,
          formaPago,
          metodoPago: 'PUE',
          subtotal,
          iva,
          total,
        },
        `${folio}.pdf`,
        verifyUrl,
        false
      );
    } catch (e: any) {
      console.error('Error generando PDF en memoria:', e);
      return NextResponse.json({ error: 'Error generando PDF: ' + (e.message || String(e)) }, { status: 500 });
    }

    const pdfBlobName = `invoices/${folio}.pdf`;
    let pdfUrl: string;
    try {
      pdfUrl = await uploadBufferToBlob(pdfBuffer, pdfBlobName, 'application/pdf');
    } catch (e: any) {
      console.error('Error subiendo PDF a Azure:', e);
      return NextResponse.json({ error: 'Error subiendo PDF a Azure: ' + (e.message || String(e)) }, { status: 500 });
    }

    // Guardar datos fiscales del usuario si no los tiene
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
        numeroInterior: fiscalData.numeroInterior,
        colonia: fiscalData.colonia,
        municipio: fiscalData.municipio,
        estado: fiscalData.estado,
      },
    });

    // Crear registro de factura
    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        folio,
        serie: 'A',
        fecha: new Date(),
        subtotal,
        iva,
        total,
        rfc: fiscalData.rfc.toUpperCase(),
        razonSocial: fiscalData.razonSocial,
        regimenFiscal: fiscalData.regimenFiscal,
        usoCfdi: fiscalData.usoCfdi,
        codigoPostal: fiscalData.codigoPostal,
        domicilio,
        formaPago,
        metodoPago: 'PUE',
        xmlUrl: xmlUrl,
        pdfUrl: pdfUrl,
        uuid,
        status: 'issued',
      },
    });

    // Marcar suscripción como facturada
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { invoiceIssued: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Factura generada exitosamente',
      invoice: {
        folio: invoice.folio,
        uuid: invoice.uuid,
      },
      xmlUrl,
      pdfUrl,
    });
  } catch (error: any) {
    console.error('Error generando factura:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar la factura' },
      { status: 500 }
    );
  }
}
