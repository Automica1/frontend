import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api/v1';

function readField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function buildRedirect(req: NextRequest, nextPath: string, params: Record<string, string>) {
  const siteUrl =
    process.env.KINDE_SITE_URL || process.env.NEXT_PUBLIC_KINDE_SITE_URL || req.nextUrl.origin;
  const url = new URL(nextPath, siteUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return NextResponse.redirect(url, 303);
}

async function handleCallback(req: NextRequest, formData: FormData) {
  const nextPath = req.nextUrl.searchParams.get('next') || '/subscription';

  const paymentId = readField(formData, 'razorpay_payment_id');
  const subscriptionId = readField(formData, 'razorpay_subscription_id');
  const orderId = readField(formData, 'razorpay_order_id');
  const signature = readField(formData, 'razorpay_signature');
  const errorCode = readField(formData, 'error[code]') || readField(formData, 'error_code');
  const errorDescription =
    readField(formData, 'error[description]') || readField(formData, 'error_description');

  if (errorCode || errorDescription) {
    return buildRedirect(req, nextPath, { payment: 'cancelled' });
  }

  if (!paymentId || !signature || (!subscriptionId && !orderId)) {
    return buildRedirect(req, nextPath, { payment: 'cancelled' });
  }

  try {
    const { getAccessTokenRaw } = getKindeServerSession();
    const accessToken = await getAccessTokenRaw();
    if (!accessToken) {
      return buildRedirect(req, nextPath, { payment: 'error', reason: 'unauthenticated' });
    }

    const verifyBody: Record<string, string> = {
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    };
    if (subscriptionId) {
      verifyBody.razorpay_subscription_id = subscriptionId;
    }
    if (orderId) {
      verifyBody.razorpay_order_id = orderId;
    }

    const verifyRes = await fetch(`${BACKEND_URL}/subscription/verify-payment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyBody),
    });

    if (!verifyRes.ok) {
      return buildRedirect(req, nextPath, { payment: 'error', reason: 'verification_failed' });
    }

    return buildRedirect(req, nextPath, { payment: 'success' });
  } catch (error) {
    console.error('Razorpay callback failed', error);
    return buildRedirect(req, nextPath, { payment: 'error', reason: 'server_error' });
  }
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    const nextPath = req.nextUrl.searchParams.get('next') || '/subscription';
    return buildRedirect(req, nextPath, { payment: 'error', reason: 'invalid_callback' });
  }

  const response = await handleCallback(req, formData);
  return response;
}

export async function GET(req: NextRequest) {
  const nextPath = req.nextUrl.searchParams.get('next') || '/subscription';
  const payment = req.nextUrl.searchParams.get('razorpay_payment_id')
    ? 'success'
    : 'cancelled';
  return buildRedirect(req, nextPath, { payment });
}
