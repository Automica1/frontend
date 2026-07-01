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

async function parseCallbackFields(req: NextRequest): Promise<Record<string, string>> {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const fields: Record<string, string> = {};
    params.forEach((value, key) => {
      fields[key] = value;
    });
    return fields;
  }

  const formData = await req.formData();
  return {
    razorpay_payment_id: readField(formData, 'razorpay_payment_id'),
    razorpay_subscription_id: readField(formData, 'razorpay_subscription_id'),
    razorpay_order_id: readField(formData, 'razorpay_order_id'),
    razorpay_signature: readField(formData, 'razorpay_signature'),
    'error[code]': readField(formData, 'error[code]'),
    'error[description]': readField(formData, 'error[description]'),
    error_code: readField(formData, 'error_code'),
    error_description: readField(formData, 'error_description'),
  };
}

async function handleCallback(req: NextRequest, fields: Record<string, string>) {
  const nextPath = req.nextUrl.searchParams.get('next') || '/subscription';

  const paymentId = fields.razorpay_payment_id || '';
  const subscriptionId = fields.razorpay_subscription_id || '';
  const orderId = fields.razorpay_order_id || '';
  const signature = fields.razorpay_signature || '';
  const errorCode = fields['error[code]'] || fields.error_code || '';
  const errorDescription = fields['error[description]'] || fields.error_description || '';

  if (errorCode || errorDescription) {
    return buildRedirect(req, nextPath, { payment: 'cancelled' });
  }

  if (!paymentId || !signature || (!subscriptionId && !orderId)) {
    return buildRedirect(req, nextPath, { payment: 'cancelled' });
  }

  try {
    const body = new URLSearchParams({
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });
    if (subscriptionId) {
      body.set('razorpay_subscription_id', subscriptionId);
    }
    if (orderId) {
      body.set('razorpay_order_id', orderId);
    }

    const verifyRes = await fetch(`${BACKEND_URL}/subscription/razorpay/verify-callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!verifyRes.ok) {
      const reason = verifyRes.status === 400 ? 'invalid_signature' : 'verification_failed';
      console.error('Razorpay verify callback failed', verifyRes.status, await verifyRes.text());
      return buildRedirect(req, nextPath, { payment: 'error', reason });
    }

    return buildRedirect(req, nextPath, { payment: 'success' });
  } catch (error) {
    console.error('Razorpay callback failed', error);
    return buildRedirect(req, nextPath, { payment: 'error', reason: 'server_error' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const fields = await parseCallbackFields(req);
    return await handleCallback(req, fields);
  } catch (error) {
    console.error('Razorpay callback parse failed', error);
    const nextPath = req.nextUrl.searchParams.get('next') || '/subscription';
    return buildRedirect(req, nextPath, { payment: 'error', reason: 'invalid_callback' });
  }
}

export async function GET(req: NextRequest) {
  const nextPath = req.nextUrl.searchParams.get('next') || '/subscription';
  const params = req.nextUrl.searchParams;
  const fields = {
    razorpay_payment_id: params.get('razorpay_payment_id') || '',
    razorpay_subscription_id: params.get('razorpay_subscription_id') || '',
    razorpay_order_id: params.get('razorpay_order_id') || '',
    razorpay_signature: params.get('razorpay_signature') || '',
    'error[code]': params.get('error[code]') || '',
    'error[description]': params.get('error[description]') || '',
    error_code: '',
    error_description: '',
  };

  if (!fields.razorpay_payment_id) {
    return buildRedirect(req, nextPath, { payment: 'cancelled' });
  }

  return handleCallback(req, fields);
}
