'use server';

import { prisma } from '@/lib/prisma';
import { invoiceFormSchema, type InvoiceFormInput } from '@/lib/validations/invoice';
import { auth } from '@/lib/auth';
import { generateCFDI } from '@/lib/cfdi-generator';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { writeFile, mkdir } from 'fs/promises';
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

        // Datos de ejemplo para la factura de demostración
        const subtotal = 100.00;
        const iva = subtotal * 0.16;
        const total = subtotal + iva;

        const domicilio = `${validated.data.calle} ${validated.data.numeroExterior}${validated.data.numeroInterior ? ' Int. ' + validated.data.numeroInterior : ''}, ${validated.data.colonia}, ${validated.data.municipio}, ${validated.data.estado}, CP ${validated.data.codigoPostal}`;

        // Crear directorio si no existe
        const invoicesDir = join(process.cwd(), 'public', 'invoices');
        await mkdir(invoicesDir, { recursive: true });

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

    // Guardar XML
    const xmlPath = join(invoicesDir, `${nextFolio}.xml`);
    await writeFile(xmlPath, xmlContent, 'utf-8');
    const xmlUrl = `/invoices/${nextFolio}.xml`;

        // Crear la factura en la base de datos ANTES de generar el PDF
        // Usamos pdfUrl local como placeholder; lo actualizaremos después.
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
                pdfUrl: `/invoices/${nextFolio}.pdf`,
                uuid,
                status: 'issued',
            }
        });

        // Generar PDF usando generador manual (primera pasada: placeholder para subir y obtener fileId)
        const pdfPath = join(invoicesDir, `${nextFolio}.pdf`);
        // URL pública de verificación que usará el QR
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/invoices/verify/${uuid}`;

        const initialPdfBuffer = await generateInvoicePDF({
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
        }, pdfPath, verifyUrl);

        let pdfUrl = `/invoices/${nextFolio}.pdf`;
        // Guardar localmente el PDF (ya lo escribió generateInvoicePDF en pdfPath)
        // Actualizar el registro de la factura con la ruta local
        try {
            // Actualizamos la factura y reutilizamos el resultado retornado para evitar
            // una consulta adicional a la base de datos.
            invoice = await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfUrl } });
        } catch (e) {
            console.warn('No se pudo actualizar invoice con pdfUrl local:', e);
            // Si la actualización falla por alguna razón, intentamos recuperar el registro
            // para no romper la respuesta. Esto es un fallback conservador.
            const maybeInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
            if (!maybeInvoice) {
                throw new Error('No se pudo recuperar la factura después de crearla');
            }
            invoice = maybeInvoice;
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
