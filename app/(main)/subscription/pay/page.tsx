'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { loadRazorpay, openRazorpayCheckout } from '../../lib/razorpayCheckout';
import {
  clearPendingCheckout,
  loadPendingCheckout,
  PendingCheckout,
} from '../../lib/pendingCheckoutStorage';
import { apiService } from '../../lib/apiService';

function buildReturnPath(checkout: PendingCheckout) {
  const params = new URLSearchParams({
    currency: checkout.currency,
    plan: checkout.planId,
  });
  return `/subscription?${params.toString()}`;
}

function SubscriptionPayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startedRef = useRef(false);
  const [checkout, setCheckout] = useState<PendingCheckout | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHostedFallback, setShowHostedFallback] = useState(false);

  useEffect(() => {
    const pending = loadPendingCheckout();
    const planId = searchParams?.get('plan');
    if (!pending || (planId && pending.planId !== planId)) {
      router.replace('/subscription');
      return;
    }
    setCheckout(pending);
  }, [router, searchParams]);

  useEffect(() => {
    if (!checkout || startedRef.current) return;

    const startCheckout = async () => {
      startedRef.current = true;

      try {
        const config = await apiService.getPublicBillingConfig();
        const key = config.razorpayKeyId;
        if (!key) {
          setError('Payment configuration is missing. Please contact support.');
          return;
        }
        setRazorpayKeyId(key);

        const sdkReady = await loadRazorpay();
        if (!sdkReady) {
          setError('Razorpay failed to load. Check your connection and try again.');
          return;
        }

        const returnPath = buildReturnPath(checkout);
        const callbackUrl = `${window.location.origin}/api/payments/razorpay/callback?next=${encodeURIComponent(returnPath)}`;

        const isSubscription = !!checkout.subscriptionId && !checkout.isUpgrade;

        const paymentOptions: Record<string, unknown> = {
          key,
          name: 'Automica',
          description: `${checkout.isUpgrade ? 'Upgrade to' : ''} ${checkout.planName}`,
          theme: { color: '#8b5cf6' },
          callback_url: callbackUrl,
          redirect: true,
          modal: {
            ondismiss: () => {
              clearPendingCheckout();
              router.replace(`${returnPath}&payment=cancelled`);
            },
            escape: true,
          },
        };

        if (isSubscription) {
          paymentOptions.subscription_id = checkout.subscriptionId;
        } else if (checkout.orderId) {
          paymentOptions.order_id = checkout.orderId;
          paymentOptions.amount = checkout.amount;
          paymentOptions.currency = checkout.currency;
        } else {
          setError('Checkout session is invalid. Please choose a plan again.');
          return;
        }

        openRazorpayCheckout(paymentOptions);

        window.setTimeout(() => {
          if (document.visibilityState === 'visible' && checkout.shortUrl) {
            setShowHostedFallback(true);
          }
        }, 2500);
      } catch (err) {
        console.error('Checkout start failed', err);
        setError('Failed to start checkout. Please try again.');
      }
    };

    void startCheckout();
  }, [checkout, router]);

  const returnHref = checkout ? buildReturnPath(checkout) : '/subscription';

  const handleCancel = () => {
    clearPendingCheckout();
    router.replace(`${returnHref}&payment=cancelled`);
  };

  const handleHostedFallback = () => {
    if (!checkout?.shortUrl) return;
    window.location.assign(checkout.shortUrl);
  };

  return (
    <div className="min-h-screen pt-32 bg-[#0b0b0d] relative p-4">
      <div className="relative z-10 max-w-lg mx-auto text-center">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-300 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to plans
        </button>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
            <p className="text-red-200 mb-6">{error}</p>
            <Link
              href={returnHref}
              className="text-purple-400 hover:text-purple-300 underline text-sm"
            >
              Return to subscription
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-light text-white mb-3">Redirecting to secure checkout</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              {checkout
                ? `Complete payment for ${checkout.planName}. You will return to Automica automatically when you finish or cancel.`
                : 'Preparing checkout...'}
            </p>
            {razorpayKeyId && (
              <p className="text-gray-500 text-xs mt-6">
                If nothing happens, use the button below or go back to plans.
              </p>
            )}
            {showHostedFallback && checkout?.shortUrl && (
              <div className="mt-8 space-y-4">
                <p className="text-amber-200/90 text-sm">
                  Checkout did not open in this browser. Use Razorpay&apos;s hosted page instead,
                  then return here after payment.
                </p>
                <button
                  type="button"
                  onClick={handleHostedFallback}
                  className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white py-3 text-sm font-medium transition-colors"
                >
                  Open Razorpay payment page
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="mt-8 text-sm text-gray-500 hover:text-gray-300 underline"
            >
              Cancel and return to Automica
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionPayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 flex items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <SubscriptionPayContent />
    </Suspense>
  );
}
