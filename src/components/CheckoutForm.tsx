'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Script from 'next/script';

interface CheckoutFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  };
  userEmail: string;
  userId: string;
}

// Declarar OpenPay global
declare global {
  interface Window {
    OpenPay: any;
  }
}

export default function CheckoutForm({ plan, userEmail, userId }: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'oxxo'>('card');
  const [openpayReady, setOpenpayReady] = useState(false);
  
  // Estados del formulario
  const [cardData, setCardData] = useState({
    holderName: '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
  });

  // Inicializar OpenPay cuando el script cargue
  useEffect(() => {
    if (window.OpenPay) {
      window.OpenPay.setId(process.env.NEXT_PUBLIC_OPENPAY_MERCHANT_ID || 'm3p94sepj4nfambj8op3');
      window.OpenPay.setApiKey(process.env.NEXT_PUBLIC_OPENPAY_PUBLIC_KEY || 'pk_b2143a568d714c628458f8a592877f5a');
      window.OpenPay.setSandboxMode(true);
      setOpenpayReady(true);
      console.log('✅ OpenPay.js inicializado');
    }
  }, []);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Formateo especial para número de tarjeta (espacios cada 4 dígitos)
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setCardData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones básicas
      if (paymentMethod === 'card') {
        const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');
        
        if (!cardData.holderName || cardNumberClean.length !== 16 || !cardData.cvv) {
          toast.error('Por favor completa todos los campos');
          setLoading(false);
          return;
        }

        // Tokenizar tarjeta con OpenPay.js
        console.log('🔐 Tokenizando tarjeta con OpenPay...');
        
        const deviceSessionId = window.OpenPay.deviceData.setup();
        
        const tokenData = {
          card_number: cardNumberClean,
          holder_name: cardData.holderName,
          expiration_year: cardData.expirationYear,
          expiration_month: cardData.expirationMonth,
          cvv2: cardData.cvv,
        };

        // Crear token
        window.OpenPay.token.create(
          tokenData,
          async (token: any) => {
            try {
              console.log('✅ Token creado:', token.data.id);
              
              // Enviar token al backend
              const response = await fetch('/api/checkout/process', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  paymentMethod: 'card',
                  planId: plan.id,
                  userId,
                  token: token.data.id,
                  deviceSessionId,
                }),
              });

              const result = await response.json();

              if (!response.ok) {
                toast.error(result.error || 'Error al procesar el pago');
                setLoading(false);
                return;
              }

              toast.success('¡Pago exitoso! Redirigiendo...');
              setTimeout(() => {
                router.push('/checkout/success?subscriptionId=' + result.subscriptionId);
              }, 1000);
            } catch (error: any) {
              console.error('❌ Error procesando pago:', error);
              toast.error(error.message || 'Error al procesar el pago');
              setLoading(false);
            }
          },
          (error: any) => {
            console.error('❌ Error tokenizando tarjeta:', error);
            const errorMessage = error.data?.description || error.message || 'Error al procesar la tarjeta';
            toast.error(errorMessage);
            setLoading(false);
          }
        );
      } else {
        // Pago con OXXO
        const response = await fetch('/api/checkout/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethod: 'oxxo',
            planId: plan.id,
            userId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error al generar ficha de pago');
        }

        // Redirigir con todos los datos necesarios
        const params = new URLSearchParams({
          reference: result.reference,
          amount: result.amount.toString(),
        });
        
        if (result.barcode_url) {
          params.append('barcode_url', result.barcode_url);
        }

        router.push(`/checkout/oxxo?${params.toString()}`);
      }
    } catch (error: any) {
      console.error('Error en checkout:', error);
      toast.error(error.message || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Cargar OpenPay.js */}
      <Script
        src="https://resources.openpay.mx/lib/openpay-js/1.2.38/openpay.v1.min.js"
        onLoad={() => {
          if (window.OpenPay) {
            window.OpenPay.setId('m3p94sepj4nfambj8op3');
            window.OpenPay.setApiKey('pk_b2143a568d714c628458f8a592877f5a');
            window.OpenPay.setSandboxMode(true);
            setOpenpayReady(true);
            console.log('✅ OpenPay.js cargado');
          }
        }}
      />
      <Script src="https://resources.openpay.mx/lib/openpay-data-js/1.2.38/openpay-data.v1.min.js" />

      <div className="bg-gray-900 rounded-lg p-6 sm:p-8 border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-white">Método de Pago</h2>

      {/* Selector de método de pago */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setPaymentMethod('card')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
            paymentMethod === 'card'
              ? 'border-green-500 bg-green-500/10 text-white'
              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="font-semibold">Tarjeta</div>
          <div className="text-xs mt-1">Débito o Crédito</div>
        </button>
        <button
          onClick={() => setPaymentMethod('oxxo')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
            paymentMethod === 'oxxo'
              ? 'border-green-500 bg-green-500/10 text-white'
              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="font-semibold">OXXO</div>
          <div className="text-xs mt-1">Efectivo</div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {paymentMethod === 'card' ? (
          <>
            {/* Nombre del titular */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del titular
              </label>
              <input
                type="text"
                name="holderName"
                value={cardData.holderName}
                onChange={handleCardChange}
                placeholder="Como aparece en la tarjeta"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            {/* Número de tarjeta */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de tarjeta
              </label>
              <input
                type="text"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleCardChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            {/* Fecha de expiración y CVV */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mes
                </label>
                <input
                  type="text"
                  name="expirationMonth"
                  value={cardData.expirationMonth}
                  onChange={handleCardChange}
                  placeholder="MM"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Año
                </label>
                <input
                  type="text"
                  name="expirationYear"
                  value={cardData.expirationYear}
                  onChange={handleCardChange}
                  placeholder="AA"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleCardChange}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Pago en OXXO</h3>
                <p className="text-sm text-gray-400">
                  Genera una ficha de pago para realizar el pago en efectivo en cualquier tienda OXXO.
                  Tu suscripción se activará una vez confirmado el pago.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón de pago */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </span>
          ) : (
            `Pagar $${plan.price.toFixed(2)} MXN`
          )}
        </button>

        {/* Información de seguridad */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Pago 100% seguro con OpenPay
        </div>
      </form>
    </div>
    </>
  );
}
