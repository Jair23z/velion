"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from 'next/navigation';

interface CardPaymentWidgetProps {
  createUrl?: string; // endpoint to create payment intent
  amount?: number;
  currency?: string;
  userId?: string;
  planId?: string;
  onSuccess?: () => void;
}

/**
 * CardPaymentWidget
 * - On mount it POSTs to `createUrl` to obtain a `client_secret`.
 * - While no client secret exists it renders null (nothing).
 * - When clientSecret is available it mounts Stripe Elements and shows
 *   the PaymentElement and a Pay button that confirms the payment in-page.
 */
export default function CardPaymentWidget({
  createUrl = "/api/checkout/create-payment-intent",
  amount,
  currency = "mxn",
  userId,
  planId,
  onSuccess,
}: CardPaymentWidgetProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const stripePromise = publishable ? loadStripe(publishable) : null;

  useEffect(() => {
    let mounted = true;
    async function createIntent() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(createUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency, userId, planId, paymentMethod: "card" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "failed to create payment intent");
        if (mounted) setClientSecret(data.clientSecret || data.client_secret || null);
      } catch (err: any) {
        console.error("create-payment-intent error:", err);
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    createIntent();
    return () => {
      mounted = false;
    };
  }, [createUrl, amount, currency, userId, planId]);

  if (error) {
    // Render a small error message; you can style/replace this as needed.
    return <div className="text-sm text-red-400">Error iniciando pago: {error}</div>;
  }

  // While we don't have a clientSecret, render nothing (per spec)
  if (!clientSecret) return null;

  if (!stripePromise) {
    return <div className="text-sm text-red-400">Falta la clave pública de Stripe.</div>;
  }

  // Configure PaymentElement to avoid showing wallet shortcuts (Link/Apple/Google Pay).
  // We still create the PaymentIntent server-side with payment_method_types=['card'],
  // but forcing wallets off here ensures the UI doesn't surface Link.
  const elementsOptions: any = {
    clientSecret,
    paymentElement: {
      wallets: {
        applePay: 'never',
        googlePay: 'never',
        link: 'never',
      },
    },
  };

  return (
    <Elements options={elementsOptions} stripe={stripePromise}>
      <InnerPayment onSuccess={onSuccess} />
    </Elements>
  );
}

function InnerPayment({ onSuccess }: { onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    try {
      const returnUrl = (typeof window !== 'undefined' && window.location)
        ? `${window.location.origin}/checkout/success`
        : undefined;

      const res: any = await (stripe as any).confirmPayment(
        { elements, confirmParams: { return_url: returnUrl } },
        { redirect: "if_required" }
      );
      // expose last result for debugging in console
      try { (window as any).__lastStripeConfirmResult = res; } catch (e) {}

      if (res?.error) {
        setError(res.error.message || "Error al confirmar pago");
        return;
      }

      const pi = res?.paymentIntent || res;
      if (pi && pi.status === "succeeded") {
        // Don't finalize server-side here — let the webhook create the subscription.
        // Redirect to success page and include the PaymentIntent so the success
        // page can poll for the subscription.
        onSuccess?.();
        router.push(`/checkout/success?payment_intent=${pi.id}`);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-4">
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-md text-white flex items-center gap-3">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Procesando pago, por favor espera…</span>
          </div>
        </div>
      )}
      <PaymentElement />
      {error && <div className="text-sm text-red-400">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-bold rounded-lg"
      >
        {processing ? "Procesando..." : "Pagar"}
      </button>
    </form>
  );
}
