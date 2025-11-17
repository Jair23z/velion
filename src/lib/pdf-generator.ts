import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFile } from 'fs/promises';
import QRCode from 'qrcode';

interface InvoiceData {
    folio: string;
    serie: string;
    uuid: string;
    fecha: Date;
    rfc: string;
    razonSocial: string;
    regimenFiscal: string;
    usoCfdi: string;
    codigoPostal: string;
    domicilio: string;
    formaPago: string;
    metodoPago: string;
    subtotal: number;
    iva: number;
    total: number;
}

export async function generateInvoicePDF(data: InvoiceData, outputPath: string, qrText?: string): Promise<Buffer> {
    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Tamaño carta
    const { width, height } = page.getSize();

    // Cargar fuentes
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const green = rgb(0.086, 0.639, 0.290); // #16a34a
    const gray = rgb(0.4, 0.4, 0.4);
    const black = rgb(0, 0, 0);

    let yPos = height - 50;

    // Header - Logo y título
    page.drawText('VELION', {
        x: 50,
        y: yPos,
        size: 24,
        font: fontBold,
        color: green,
    });

    yPos -= 30;
    page.drawText('VELION DIGITAL SA DE CV', {
        x: 50,
        y: yPos,
        size: 10,
        font,
        color: gray,
    });

    yPos -= 15;
    page.drawText('RFC: VEL010101AAA', { x: 50, y: yPos, size: 10, font, color: gray });

    yPos -= 15;
    page.drawText('Régimen Fiscal: 601 - General de Ley Personas Morales', {
        x: 50,
        y: yPos,
        size: 10,
        font,
        color: gray,
    });

    // Folio y fecha (lado derecho)
    page.drawText(`Folio: ${data.serie}-${data.folio}`, {
        x: width - 200,
        y: height - 50,
        size: 12,
        font: fontBold,
        color: black,
    });

    page.drawText(`Fecha: ${data.fecha.toLocaleDateString('es-MX')}`, {
        x: width - 200,
        y: height - 70,
        size: 10,
        font,
        color: gray,
    });

    page.drawText('CFDI 4.0', {
        x: width - 200,
        y: height - 90,
        size: 10,
        font: fontBold,
        color: green,
    });

    // Línea divisoria
    yPos -= 30;
    page.drawLine({
        start: { x: 50, y: yPos },
        end: { x: width - 50, y: yPos },
        thickness: 1,
        color: gray,
    });

    // Datos del cliente
    yPos -= 30;
    page.drawText('DATOS DEL CLIENTE', { x: 50, y: yPos, size: 12, font: fontBold, color: green });

    yPos -= 20;
    page.drawText(`RFC: ${data.rfc}`, { x: 50, y: yPos, size: 10, font, color: black });

    yPos -= 15;
    page.drawText(`Razón Social: ${data.razonSocial}`, { x: 50, y: yPos, size: 10, font, color: black });

    yPos -= 15;
    page.drawText(`Régimen Fiscal: ${data.regimenFiscal}`, { x: 50, y: yPos, size: 10, font, color: black });

    yPos -= 15;
    page.drawText(`Uso CFDI: ${data.usoCfdi}`, { x: 50, y: yPos, size: 10, font, color: black });

    yPos -= 15;
    page.drawText(`Código Postal: ${data.codigoPostal}`, { x: 50, y: yPos, size: 10, font, color: black });

    if (data.domicilio) {
        yPos -= 15;
        const domicilioText = data.domicilio.length > 70 ? data.domicilio.substring(0, 70) + '...' : data.domicilio;
        page.drawText(`Domicilio: ${domicilioText}`, { x: 50, y: yPos, size: 10, font, color: black });
    }

    // Línea divisoria
    yPos -= 30;
    page.drawLine({
        start: { x: 50, y: yPos },
        end: { x: width - 50, y: yPos },
        thickness: 1,
        color: gray,
    });

    // Conceptos
    yPos -= 25;
    page.drawText('CONCEPTOS', { x: 50, y: yPos, size: 12, font: fontBold, color: green });

    // Tabla header (fondo verde)
    yPos -= 25;
    page.drawRectangle({
        x: 50,
        y: yPos - 5,
        width: width - 100,
        height: 20,
        color: green,
    });

    page.drawText('Cant.', { x: 60, y: yPos, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Descripción', { x: 110, y: yPos, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('P. Unit.', { x: 370, y: yPos, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Importe', { x: 470, y: yPos, size: 9, font: fontBold, color: rgb(1, 1, 1) });

    // Fila de concepto
    yPos -= 25;
    page.drawText('1', { x: 60, y: yPos, size: 9, font, color: black });
    page.drawText('Suscripción mensual Velion Premium', { x: 110, y: yPos, size: 9, font, color: black });
    page.drawText(`$${data.subtotal.toFixed(2)}`, { x: 370, y: yPos, size: 9, font, color: black });
    page.drawText(`$${data.subtotal.toFixed(2)}`, { x: 470, y: yPos, size: 9, font, color: black });
    
    yPos -= 12;
    page.drawText('ClaveProdServ: 81161701', { x: 110, y: yPos, size: 7, font, color: gray });

    // Línea divisoria
    yPos -= 25;
    page.drawLine({
        start: { x: 50, y: yPos },
        end: { x: width - 50, y: yPos },
        thickness: 1,
        color: gray,
    });

    // Totales
    yPos -= 20;
    page.drawText('Subtotal:', { x: 370, y: yPos, size: 10, font, color: black });
    page.drawText(`$${data.subtotal.toFixed(2)}`, { x: 470, y: yPos, size: 10, font, color: black });

    yPos -= 20;
    page.drawText('IVA (16%):', { x: 370, y: yPos, size: 10, font, color: black });
    page.drawText(`$${data.iva.toFixed(2)}`, { x: 470, y: yPos, size: 10, font, color: black });

    yPos -= 25;
    page.drawText('Total:', { x: 370, y: yPos, size: 12, font: fontBold, color: green });
    page.drawText(`$${data.total.toFixed(2)} MXN`, { x: 470, y: yPos, size: 12, font: fontBold, color: green });

    // Método de pago
    yPos -= 35;
    page.drawText(`Forma de Pago: ${data.formaPago}`, { x: 50, y: yPos, size: 9, font, color: black });

    yPos -= 15;
    page.drawText(`Método de Pago: ${data.metodoPago}`, { x: 50, y: yPos, size: 9, font, color: black });

    // UUID (Timbre fiscal digital)
    yPos -= 35;
    page.drawLine({
        start: { x: 50, y: yPos },
        end: { x: width - 50, y: yPos },
        thickness: 1,
        color: gray,
    });

    yPos -= 20;
    page.drawText('TIMBRE FISCAL DIGITAL', { x: 50, y: yPos, size: 10, font: fontBold, color: green });

    yPos -= 20;
    const uuidText = `UUID: ${data.uuid}`;
    page.drawText(uuidText, { x: 50, y: yPos, size: 7, font, color: black });

    yPos -= 15;
    page.drawText('Fecha de Certificación: ' + new Date().toISOString(), {
        x: 50,
        y: yPos,
        size: 7,
        font,
        color: black,
    });

    yPos -= 12;
    page.drawText('RFC del PAC: SPR190613I52', { x: 50, y: yPos, size: 7, font, color: black });

    yPos -= 12;
    page.drawText('No. Certificado SAT: 00001000000504465028', { x: 50, y: yPos, size: 7, font, color: black });

    // Generar código QR con la URL de verificación
    const verifyUrl = `https://velion.app/invoices/verify/${data.uuid}`;
    const qrData = qrText && qrText.length > 0 ? qrText : verifyUrl;
    
    // Generar QR como imagen PNG de alta calidad
    const qrBuffer = await QRCode.toBuffer(qrData, {
        type: 'png',
        width: 180,
        margin: 2,
        errorCorrectionLevel: 'M', // Nivel medio para más datos
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    });

    // Embeber imagen QR en el PDF
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const qrDims = qrImage.scale(0.55);

    // Colocar QR en la esquina inferior derecha
    page.drawImage(qrImage, {
        x: width - 130,
        y: 45,
        width: qrDims.width,
        height: qrDims.height,
    });

    // Texto debajo del QR
    page.drawText('Escanea para ver datos', {
        x: width - 125,
        y: 30,
        size: 7,
        font,
        color: gray,
    });

    // Footer
    page.drawText('Este documento es una representación impresa de un CFDI', {
        x: 50,
        y: 60,
        size: 7,
        font,
        color: gray,
    });

    page.drawText('**SIMULACIÓN PARA FINES EDUCATIVOS - NO VÁLIDO FISCALMENTE**', {
        x: 50,
        y: 45,
        size: 7,
        font: fontBold,
        color: gray,
    });

    // Guardar PDF
    const pdfBytes = await pdfDoc.save();
    // Guardar en disco (compatibilidad con el flujo existente)
    await writeFile(outputPath, pdfBytes);

    // Devolver Buffer para que el llamador pueda subir/actualizar en Drive
    return Buffer.from(pdfBytes);
}
