import { Plan } from './apiService';

export type BillingCurrency = 'USD' | 'INR';

export const SUPPORTED_CURRENCIES: BillingCurrency[] = ['USD', 'INR'];
export const BILLING_CURRENCY_STORAGE_KEY = 'automica_billing_currency';

const INDIAN_TIMEZONES = new Set([
  'Asia/Kolkata',
  'Asia/Calcutta',
]);

export function normalizeBillingCurrency(value?: string | null): BillingCurrency | null {
  const upper = (value || '').trim().toUpperCase();
  if (upper === 'USD' || upper === 'INR') {
    return upper;
  }
  return null;
}

export function isIndianPhone(contact?: string | null): boolean {
  if (!contact) return false;
  const digits = contact.replace(/[^\d+]/g, '');
  return /^(\+?91)?[6-9]\d{9}$/.test(digits);
}

export function isIndianLocale(): boolean {
  if (typeof navigator === 'undefined') return false;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((locale) => {
    const normalized = (locale || '').toLowerCase();
    return normalized === 'en-in' || normalized.endsWith('-in');
  });
}

export function isIndianTimezone(): boolean {
  if (typeof Intl === 'undefined') return false;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return INDIAN_TIMEZONES.has(tz);
  } catch {
    return false;
  }
}

/** Heuristic: user is likely in India (not an explicit currency choice). */
export function isLikelyIndianUser(options?: { phone?: string | null }): boolean {
  return isIndianPhone(options?.phone) || isIndianLocale() || isIndianTimezone();
}

export function detectBillingCurrency(options?: {
  phone?: string | null;
  subscriptionCurrency?: string | null;
  savedCurrency?: string | null;
}): BillingCurrency {
  const locked = normalizeBillingCurrency(options?.subscriptionCurrency);
  if (locked) return locked;

  const saved = normalizeBillingCurrency(options?.savedCurrency);
  if (saved) return saved;

  if (typeof window !== 'undefined') {
    const stored = normalizeBillingCurrency(localStorage.getItem(BILLING_CURRENCY_STORAGE_KEY));
    if (stored) return stored;
  }

  if (isLikelyIndianUser({ phone: options?.phone })) {
    return 'INR';
  }

  return 'USD';
}

export function persistBillingCurrency(currency: BillingCurrency) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BILLING_CURRENCY_STORAGE_KEY, currency);
}

export function resolvePlanForCurrency(plan: Plan, currency: BillingCurrency): Plan | null {
  const entry = plan.pricing?.[currency];
  if (entry?.amount && entry.razorpayPlanId) {
    return {
      ...plan,
      price: entry.amount,
      razorpayPlanId: entry.razorpayPlanId,
      currency,
    };
  }

  if (normalizeBillingCurrency(plan.currency) === currency && plan.price > 0) {
    return { ...plan, currency };
  }

  return null;
}

export function formatPlanPrice(amountMinor: number, currency: BillingCurrency): string {
  if (currency === 'INR') {
    const rupees = amountMinor / 100;
    if (amountMinor % 100 === 0) {
      return `₹${rupees.toLocaleString('en-IN')}`;
    }
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `$${(amountMinor / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function currencyLabel(currency: BillingCurrency): string {
  return currency === 'INR' ? '₹ INR' : '$ USD';
}

export function currencyToggleHint(likelyIndian: boolean, currency: BillingCurrency): string {
  if (likelyIndian && currency === 'INR') {
    return 'Prices in INR for India';
  }
  if (!likelyIndian && currency === 'USD') {
    return 'Prices in USD';
  }
  return 'Switch billing currency';
}
