'use server';

import { prisma } from '@/lib/prisma';
import { invoiceFormSchema, type InvoiceFormInput } from '@/lib/validations/invoice';
import { auth } from '@/lib/auth';
import { generateCFDI } from '@/lib/cfdi-generator';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { uploadStringToBlob, uploadBufferToBlob } from '@/lib/azure';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveUserFiscalData(data: InvoiceFormInput) {
    const session = await auth();
    
    if (!session?.user?.email) {
        return { error: 'No autenticado' };
    }

    const validated = invoiceFormSchema.safeParse(data);

    if (!validated.success) {
        return {
            error: validated.error.issues[0].message
        };
    }

    try {
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                rfc: validated.data.rfc.toUpperCase(),
                razonSocial: validated.data.razonSocial,
                regimenFiscal: validated.data.regimenFiscal,
                usoCfdi: validated.data.usoCfdi,
                codigoPostal: validated.data.codigoPostal,
                calle: validated.data.calle,
                numeroExterior: validated.data.numeroExterior,
                numeroInterior: validated.data.numeroInterior || null,
                colonia: validated.data.colonia,
                municipio: validated.data.municipio,
                estado: validated.data.estado,
                pais: 'México',
            }
        });

        return { 
            success: true, 
            message: 'Datos fiscales guardados correctamente',
            user 
        };
    } catch (error) {
        console.error('Error al guardar datos fiscales:', error);
        return { error: 'Error al guardar los datos' };
    }
}

export async function getUserFiscalData() {
    const session = await auth();
    
    if (!session?.user?.email) {
        return { error: 'No autenticado' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                rfc: true,
                razonSocial: true,
                regimenFiscal: true,
                usoCfdi: true,
                codigoPostal: true,
                calle: true,
                numeroExterior: true,
                numeroInterior: true,
                colonia: true,
                municipio: true,
                estado: true,
            }
        });

        return { success: true, data: user };
    } catch (error) {
        console.error('Error al obtener datos fiscales:', error);
        return { error: 'Error al obtener los datos' };
    }
}

export async function generateInvoice(data: InvoiceFormInput) {
    const session = await auth();

    if (!session?.user?.email) {
        return { error: 'No autenticado' };
    }

    const validated = invoiceFormSchema.safeParse(data);

    if (!validated.success) {
        return {
            error: validated.error.issues[0].message
        };
    }

    try {
        // Obtener el usuario
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { error: 'Usuario no encontrado' };
        }

        // Generar folio único
        const lastInvoice = await prisma.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { folio: true }
        });

        const nextFolio = lastInvoice
            ? String(parseInt(lastInvoice.folio) + 1).padStart(6, '0')
            : '000001';

        // Generar UUID único para el CFDI
        const uuid = uuidv4();

        // Monto cobrado al cliente (por política de cuenta el mínimo es 10.00 MXN)
        // Queremos que el TOTAL cobrado sea 10.00 (incluyendo IVA). Calculamos
        // el subtotal y el IVA de manera que subtotal + iva === chargedTotal.
        const chargedTotal = 10.00;
        const subtotal = +(chargedTotal / 1.16).toFixed(2); // base antes de IVA
        // Ajuste para evitar error por redondeo: recalculamos IVA y total
        const iva = +(chargedTotal - subtotal).toFixed(2);
        const total = +(subtotal + iva).toFixed(2); // debería ser equal chargedTotal

        const domicilio = `${validated.data.calle} ${validated.data.numeroExterior}${validated.data.numeroInterior ? ' Int. ' + validated.data.numeroInterior : ''}, ${validated.data.colonia}, ${validated.data.municipio}, ${validated.data.estado}, CP ${validated.data.codigoPostal}`;

        // Validación rápida de Azure (si falta, retornamos error informativo)
        if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
            return { error: 'AZURE_STORAGE_CONNECTION_STRING no está definida. Configura la conexión a Azure Storage.' };
        }

        // Generar XML usando generador manual
        const xmlContent = generateCFDI({
            folio: nextFolio,
            serie: 'A',
            fecha: new Date(),
            rfc: validated.data.rfc.toUpperCase(),
            razonSocial: validated.data.razonSocial,
            regimenFiscal: validated.data.regimenFiscal,
            usoCfdi: validated.data.usoCfdi,
            codigoPostal: validated.data.codigoPostal,
            domicilio,
            formaPago: validated.data.formaPago,
            metodoPago: validated.data.metodoPago,
            subtotal,
            iva,
            total,
            uuid,
        });

        // Subir XML directamente a Azure (siempre)
        const xmlBlobName = `invoices/${nextFolio}.xml`;
        let xmlUrl: string;
        try {
            xmlUrl = await uploadStringToBlob(xmlContent, xmlBlobName, 'application/xml');
        } catch (e) {
            console.error('Error subiendo XML a Azure:', e);
            return { error: 'Error subiendo XML a Azure: ' + (e instanceof Error ? e.message : String(e)) };
        }

        // Crear la factura en la base de datos con el xmlUrl; pdfUrl se actualizará luego
        let invoice = await prisma.invoice.create({
            data: {
                userId: user.id,
                folio: nextFolio,
                serie: 'A',
                subtotal,
                iva,
                total,
                rfc: validated.data.rfc.toUpperCase(),
                razonSocial: validated.data.razonSocial,
                regimenFiscal: validated.data.regimenFiscal,
                usoCfdi: validated.data.usoCfdi,
                codigoPostal: validated.data.codigoPostal,
                domicilio,
                formaPago: validated.data.formaPago,
                metodoPago: validated.data.metodoPago,
                xmlUrl,
                pdfUrl: xmlUrl, // placeholder temporal
                uuid,
                status: 'issued',
            }
        });

        // Generar PDF en memoria
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/invoices/verify/${uuid}`;

        const pdfBuffer = await generateInvoicePDF({
            folio: nextFolio,
            serie: 'A',
            uuid,
            fecha: new Date(),
            rfc: validated.data.rfc.toUpperCase(),
            razonSocial: validated.data.razonSocial,
            regimenFiscal: validated.data.regimenFiscal,
            usoCfdi: validated.data.usoCfdi,
            codigoPostal: validated.data.codigoPostal,
            domicilio,
            formaPago: validated.data.formaPago,
            metodoPago: validated.data.metodoPago,
            subtotal,
            iva,
            total,
        }, `${nextFolio}.pdf`, verifyUrl, false);

        // Subir PDF a Azure
        const pdfBlobName = `invoices/${nextFolio}.pdf`;
        let pdfUrl: string;
        try {
            pdfUrl = await uploadBufferToBlob(pdfBuffer, pdfBlobName, 'application/pdf');
            invoice = await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfUrl } });
        } catch (e) {
            console.error('Error subiendo PDF a Azure:', e);
            return { error: 'Error subiendo PDF a Azure: ' + (e instanceof Error ? e.message : String(e)) };
        }

        // Convertir Decimal a number para que Next.js pueda serializar
        const invoiceData = {
            ...invoice,
            subtotal: Number(invoice.subtotal),
            iva: Number(invoice.iva),
            total: Number(invoice.total),
        };

        return {
            success: true,
            message: 'Factura generada correctamente',
            invoice: invoiceData,
            xmlUrl,
            pdfUrl,
            xmlStorage: 'azure',
            pdfStorage: 'azure',
        };
    } catch (error) {
        console.error('Error al generar factura:', error);
        return { error: 'Error al generar la factura: ' + (error instanceof Error ? error.message : 'Error desconocido') };
    }
}

export async function getUserInvoices() {
    const session = await auth();
    
    if (!session?.user?.email) {
        return { error: 'No autenticado' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                invoices: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // Convertir Decimal a number para serialización
        const invoices = user?.invoices.map(invoice => ({
            ...invoice,
            subtotal: Number(invoice.subtotal),
            iva: Number(invoice.iva),
            total: Number(invoice.total),
        })) || [];

        return { success: true, invoices };
    } catch (error) {
        console.error('Error al obtener facturas:', error);
        return { error: 'Error al obtener las facturas' };
    }
}
