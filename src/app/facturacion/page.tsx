'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorMessage from '@/components/ErrorMessage';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS } from '@/lib/validations/invoice';
import Link from 'next/link';

const ESTADOS_MEXICO = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
    'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const invoiceSchema = z.object({
    invoiceNumber: z.string().min(1, 'El folio es requerido'),
    rfc: z.string().min(12, 'RFC inválido').max(13, 'RFC inválido'),
    razonSocial: z.string().min(1, 'Razón social es requerida'),
    regimenFiscal: z.string().min(1, 'Régimen fiscal es requerido'),
    usoCfdi: z.string().min(1, 'Uso de CFDI es requerido'),
    codigoPostal: z.string().length(5, 'Código postal debe tener 5 dígitos'),
    calle: z.string().min(1, 'Calle es requerida'),
    numeroExterior: z.string().min(1, 'Número exterior es requerido'),
    numeroInterior: z.string().optional(),
    colonia: z.string().min(1, 'Colonia es requerida'),
    municipio: z.string().min(1, 'Municipio es requerido'),
    estado: z.string().min(1, 'Estado es requerido'),
});

type InvoiceInput = z.infer<typeof invoiceSchema>;

export default function FacturacionPage() {
    const [loadingData, setLoadingData] = useState(false);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState<any>(null);
    const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<InvoiceInput>({
        resolver: zodResolver(invoiceSchema),
    });

    const invoiceNumber = watch('invoiceNumber');

    const handleFolioBlur = async () => {
        if (!invoiceNumber || invoiceNumber.length < 10) return;

        setLoadingData(true);
        try {
            const response = await fetch('/api/invoice/validate-folio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceNumber }),
            });

            const result = await response.json();

            if (response.ok) {
                setSubscriptionData(result.subscription);
                
                if (result.userData) {
                    const userData = result.userData;
                    if (userData.rfc) setValue('rfc', userData.rfc);
                    if (userData.razonSocial) setValue('razonSocial', userData.razonSocial);
                    if (userData.regimenFiscal) setValue('regimenFiscal', userData.regimenFiscal);
                    if (userData.usoCfdi) setValue('usoCfdi', userData.usoCfdi);
                    if (userData.codigoPostal) setValue('codigoPostal', userData.codigoPostal);
                    if (userData.calle) setValue('calle', userData.calle);
                    if (userData.numeroExterior) setValue('numeroExterior', userData.numeroExterior);
                    if (userData.numeroInterior) setValue('numeroInterior', userData.numeroInterior);
                    if (userData.colonia) setValue('colonia', userData.colonia);
                    if (userData.municipio) setValue('municipio', userData.municipio);
                    if (userData.estado) setValue('estado', userData.estado);
                }

                toast.success('Folio validado. Datos cargados automáticamente.');
            } else {
                toast.error(result.error || 'Folio no válido');
                setSubscriptionData(null);
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSaveData = async (data: InvoiceInput) => {
        setLoadingData(true);

        try {
            const response = await fetch('/api/user/update-fiscal-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rfc: data.rfc,
                    razonSocial: data.razonSocial,
                    regimenFiscal: data.regimenFiscal,
                    usoCfdi: data.usoCfdi,
                    codigoPostal: data.codigoPostal,
                    calle: data.calle,
                    numeroExterior: data.numeroExterior,
                    numeroInterior: data.numeroInterior,
                    colonia: data.colonia,
                    municipio: data.municipio,
                    estado: data.estado,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Datos fiscales guardados correctamente');
            } else {
                toast.error(result.error || 'Error al guardar datos');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoadingData(false);
        }
    };

    const handleGenerateInvoice = async (data: InvoiceInput) => {
        if (!subscriptionData) {
            toast.error('Primero valida el folio de tu suscripción');
            return;
        }

        setLoadingInvoice(true);

        try {
            const response = await fetch('/api/invoice/generate-from-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceNumber: data.invoiceNumber,
                    fiscalData: {
                        rfc: data.rfc,
                        razonSocial: data.razonSocial,
                        regimenFiscal: data.regimenFiscal,
                        usoCfdi: data.usoCfdi,
                        codigoPostal: data.codigoPostal,
                        calle: data.calle,
                        numeroExterior: data.numeroExterior,
                        numeroInterior: data.numeroInterior,
                        colonia: data.colonia,
                        municipio: data.municipio,
                        estado: data.estado,
                    },
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setGeneratedInvoice(result);
                toast.success('¡Factura generada exitosamente!');
            } else {
                toast.error(result.error || 'Error al generar la factura');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoadingInvoice(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(amount);
    };

    return (
        <div className='min-h-screen overflow-hidden bg-gray-950'>
            <Header/>

            <div className='max-w-6xl mx-auto mt-18 px-6 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>Facturación</h1>
                    <p className='text-sm md:text-base text-gray-400'>
                        Genera tu factura electrónica (CFDI 4.0) ingresando el folio de tu suscripción
                    </p>
                </div>

                {!generatedInvoice ? (
                    <form className='space-y-6'>
                        {/* Folio Section */}
                        <div className='bg-gray-900 border border-gray-800 rounded-lg p-6'>
                            <h2 className='text-xl md:text-2xl font-bold text-white mb-4'>Folio de Suscripción</h2>
                            
                            <div>
                                <label className='text-sm text-gray-400 font-medium mb-2 block'>
                                    Folio de Suscripción
                                </label>
                                <input
                                    className='w-full bg-gray-800 border-gray-700 border p-3 rounded-lg text-base md:text-lg font-mono text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition'
                                    type="text"
                                    placeholder='SUB-1731800123456'
                                    {...register('invoiceNumber')}
                                    onBlur={handleFolioBlur}
                                />
                                {errors.invoiceNumber && (
                                    <ErrorMessage>{errors.invoiceNumber.message}</ErrorMessage>
                                )}
                            </div>

                            {subscriptionData && (
                                    <div className='mt-4 p-4 bg-green-600/10 border border-green-600/30 rounded-lg'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                                        </svg>
                                        <span className='text-green-400 font-semibold'>Folio validado</span>
                                    </div>
                                    <div className='grid grid-cols-2 gap-4 text-sm md:text-base'>
                                        <div>
                                            <p className='text-gray-400 mb-1'>Plan</p>
                                            <p className='text-white font-semibold'>{subscriptionData.plan.name}</p>
                                        </div>
                                        <div>
                                            <p className='text-gray-400 mb-1'>Total</p>
                                            <p className='text-green-400 font-bold'>{formatCurrency(Number(subscriptionData.plan.price))}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className='mt-4 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg'>
                                <p className='text-sm text-blue-300 flex items-center gap-2'>
                                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                                    </svg>
                                    Encuentra tu folio en <Link href="/mi-cuenta/suscripciones" className='underline hover:text-blue-200'>Historial de Suscripciones</Link>
                                </p>
                            </div>
                        </div>

                        {/* Datos Fiscales Section */}
                        <div className='bg-gray-900 border border-gray-800 rounded-lg p-6'>
                            <h2 className='text-xl md:text-2xl font-bold text-white mb-4'>Datos Fiscales</h2>
                            
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>RFC *</label>
                                    <input
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm md:text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50 uppercase'
                                        type="text"
                                        placeholder='XAXX010101000'
                                        maxLength={13}
                                        {...register('rfc')}
                                    />
                                    {errors.rfc && <ErrorMessage>{errors.rfc.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Razón Social / Nombre *</label>
                                    <input
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        type="text"
                                        placeholder='Nombre completo o razón social'
                                        {...register('razonSocial')}
                                    />
                                    {errors.razonSocial && <ErrorMessage>{errors.razonSocial.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Régimen Fiscal *</label>
                                    <select
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        {...register('regimenFiscal')}
                                    >
                                        <option value="">Selecciona...</option>
                                        {REGIMEN_FISCAL_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.regimenFiscal && <ErrorMessage>{errors.regimenFiscal.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Uso de CFDI *</label>
                                    <select
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        {...register('usoCfdi')}
                                    >
                                        <option value="">Selecciona...</option>
                                        {USO_CFDI_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.usoCfdi && <ErrorMessage>{errors.usoCfdi.message}</ErrorMessage>}
                                </div>
                            </div>
                        </div>

                        <div className='bg-gray-900 border border-gray-800 p-6 rounded-lg'>
                            <h2 className='text-lg md:text-xl font-bold text-white mb-4'>Domicilio Fiscal</h2>
                            
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='md:col-span-2'>
                                    <label className='text-gray-400 text-sm font-medium'>Calle *</label>
                                    <input
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        type="text"
                                        {...register('calle')}
                                    />
                                    {errors.calle && <ErrorMessage>{errors.calle.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Número Exterior *</label>
                                    <input
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        type="text"
                                        {...register('numeroExterior')}
                                    />
                                    {errors.numeroExterior && <ErrorMessage>{errors.numeroExterior.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Número Interior (Opcional)</label>
                                    <input
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        type="text"
                                        {...register('numeroInterior')}
                                    />
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Colonia *</label>
                                    <input
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        type="text"
                                        {...register('colonia')}
                                    />
                                    {errors.colonia && <ErrorMessage>{errors.colonia.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Código Postal *</label>
                                    <input
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        type="text"
                                        maxLength={5}
                                        {...register('codigoPostal')}
                                    />
                                    {errors.codigoPostal && <ErrorMessage>{errors.codigoPostal.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Municipio/Alcaldía *</label>
                                    <input
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        type="text"
                                        {...register('municipio')}
                                    />
                                    {errors.municipio && <ErrorMessage>{errors.municipio.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className='text-gray-400 text-sm font-medium'>Estado *</label>
                                    <select
                                        className='w-full bg-gray-800 border-gray-700 border p-2 rounded-lg text-sm mt-1 text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/50'
                                        {...register('estado')}
                                    >
                                        <option value="">Selecciona...</option>
                                        {ESTADOS_MEXICO.map(estado => (
                                            <option key={estado} value={estado}>
                                                {estado}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.estado && <ErrorMessage>{errors.estado.message}</ErrorMessage>}
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-4'>
                            <button
                                type="button"
                                onClick={handleSubmit(handleSaveData)}
                                disabled={loadingData}
                                className='flex-1 text-sm md:text-base bg-gray-800 text-white p-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700'
                            >
                                {loadingData ? 'Guardando...' : '💾 Guardar Datos'}
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit(handleGenerateInvoice)}
                                disabled={loadingInvoice || !subscriptionData}
                                className='flex-1 text-sm md:text-base bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loadingInvoice ? 'Generando...' : '📄 Generar Factura'}
                            </button>
                        </div>

                        <p className='text-sm text-gray-500 text-center'>
                            El método de pago se determina automáticamente según tu forma de pago en Openpay
                        </p>
                    </form>
                ) : (
                        <div className='bg-green-900/20 border border-green-800 p-6 md:p-8 rounded-lg'>
                        <div className='text-center mb-6'>
                            <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-8 h-8 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                </svg>
                            </div>
                            <h3 className='text-xl md:text-2xl font-bold text-green-400 mb-2'>
                                ¡Factura Generada Correctamente!
                            </h3>
                            <p className='text-sm md:text-base text-gray-300 mb-4'>
                                Folio: <strong>{generatedInvoice.invoice.folio}</strong><br/>
                                UUID: <strong className='text-xs font-mono'>{generatedInvoice.invoice.uuid}</strong>
                            </p>
                        </div>

                        <div className='flex gap-4 mb-6'>
                            <a
                                href={generatedInvoice.xmlUrl}
                                download
                                className='flex-1 text-center bg-blue-600 text-white p-3 font-bold hover:bg-blue-700 transition-colors duration-300 rounded-lg'
                            >
                                📄 Descargar XML
                            </a>
                            <a
                                href={generatedInvoice.pdfUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className='flex-1 text-center bg-red-600 text-white p-3 font-bold hover:bg-red-700 transition-colors duration-300 rounded-lg'
                            >
                                📕 Descargar PDF
                            </a>
                        </div>

                        <div className='text-center'>
                            <button
                                onClick={() => {
                                    setGeneratedInvoice(null);
                                    setSubscriptionData(null);
                                }}
                                className='text-green-400 hover:text-green-300 transition'
                            >
                                ← Facturar otra suscripción
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
