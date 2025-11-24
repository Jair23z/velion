'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CardPaymentWidget from './CardPaymentWidget';

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


export default function CheckoutForm({ plan, userEmail, userId }: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'oxxo'>('card');
  
  // Estados del formulario
  const [cardData, setCardData] = useState({ holderName: '' });
  const [showCardWidget, setShowCardWidget] = useState(true);

  // Nota: el PaymentIntent y el PaymentElement se crean/instancian
  // cuando el componente `CardPaymentWidget` se monta. Queremos que
  // eso ocurra desde que carga la página, por lo que mostramos el
  // widget por defecto.

  // No se usa OpenPay: usaremos Stripe Checkout (redirect)

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

  const handleCreatePaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price, currency: 'mxn', userId, planId: plan.id, paymentMethod }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo crear PaymentIntent');
      return result.clientSecret || result.client_secret || null;
    } catch (err: any) {
      console.error('Error creando PaymentIntent:', err);
      toast.error(err.message || 'Error al iniciar pago');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Maneja el submit principal del formulario.
  // - Si el usuario seleccionó tarjeta y ya existe un clientSecret, el formulario
  //   interno del `CardPaymentElement` maneja la confirmación; aquí evitamos
  //   el doble envío y pedimos al usuario usar el botón del formulario de tarjeta.
  // - Si no hay `clientSecret` aún, creamos el PaymentIntent (se reutiliza
  //   `handleCreatePaymentIntent` que pone el `clientSecret` y renderiza el elemento).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Si el método es tarjeta
    if (paymentMethod === 'card') {
      if (showCardWidget) return;
      // If for some reason the widget is not shown, create it now.
      setShowCardWidget(true);
      return;
    }

    // Para OXXO también creamos el PaymentIntent; el backend debe retornar instrucciones
    // apropiadas (p. ej. payment_intent con payment_method_types que incluyan oxxo_cash).
    if (paymentMethod === 'oxxo') {
      await handleCreatePaymentIntent();
      // Después de crear el intent, deberías mostrar la referencia/ficha al usuario.
      // Esa lógica puede implementarse cuando el endpoint retorne los detalles de OXXO.
      return;
    }
  };

  // CardPaymentElement removed; `CardPaymentWidget` handles card flow.

  return (
    <>
      {/* Usamos Stripe Checkout (no se carga JS de terceros aquí). */}

      <div className="bg-gray-900 rounded-lg p-6 sm:p-8 border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-white">Método de Pago</h2>

      {/* Selector de método de pago */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setPaymentMethod('card');
            // Only show the card widget (which will create the PaymentIntent)
            // when the user explicitly selects Tarjeta.
            setShowCardWidget(true);
          }}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
            paymentMethod === 'card'
              ? 'border-green-500 bg-green-500/10 text-white'
              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="font-semibold">Tarjeta</div>
          <div className="text-xs mt-1">Débito o Crédito</div>
        </button>

      </div>

      <div className="space-y-4">
        {paymentMethod === 'card' ? (
          showCardWidget ? (
            <CardPaymentWidget
              createUrl="/api/checkout/create-payment-intent"
              amount={plan.price}
              currency="mxn"
              userId={userId}
              planId={plan.id}
            />
          ) : (
            <div className="text-sm text-gray-400">Selecciona "Tarjeta" para mostrar el formulario de pago.</div>
          )
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

        {/* Para evitar botones duplicados, el pago con tarjeta usa el botón
            incluido dentro del `CardPaymentElement`. Aquí mostramos el botón
            global solo para OXXO (flujo en efectivo). */}
        {paymentMethod === 'oxxo' && (
          <>
            {/* Botón de pago para OXXO */}
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  await handleCreatePaymentIntent();
                } finally {
                  setLoading(false);
                }
              }}
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
              {/* Seguridad: removido el enlace/etiqueta de pago rápido por petición */}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
