import { Plan } from './apiService';

export type BillingCurrency = 'USD' | 'INR';

export const SUPPORTED_CURRENCIES: BillingCurrency[] = ['USD', 'INR'];
export const BILLING_CURRENCY_STORAGE_KEY = 'automica_billing_currency_pref';

const INDIAN_TIMEZONES = new Set(['Asia/Kolkata', 'Asia/Calcutta']);

export type StoredBillingPreference = {
  currency: BillingCurrency;
  explicit: boolean;
};

export function normalizeBillingCurrency(value?: string | null): BillingCurrency | null {
  const upper = (value || '').trim().toUpperCase();
  if (upper === 'USD' || upper === 'INR') {
    return upper;
  }
  return null;
}

export function readStoredBillingPreference(): StoredBillingPreference | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(BILLING_CURRENCY_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredBillingPreference;
    const currency = normalizeBillingCurrency(parsed.currency);
    if (!currency) return null;
    return { currency, explicit: Boolean(parsed.explicit) };
  } catch {
    const legacy = normalizeBillingCurrency(raw);
    if (!legacy) return null;
    return { currency: legacy, explicit: true };
  }
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

export function isLikelyIndianUser(options?: { phone?: string | null }): boolean {
  return isIndianPhone(options?.phone) || isIndianLocale() || isIndianTimezone();
}

export type BillingRegionConfidence = 'india' | 'non_india' | 'ambiguous';

/** How confident we are in India vs international default for currency UI. */
export function getBillingRegionConfidence(options?: { phone?: string | null }): BillingRegionConfidence {
  const phone = isIndianPhone(options?.phone);
  const locale = isIndianLocale();
  const timezone = isIndianTimezone();
  const signalCount = [phone, locale, timezone].filter(Boolean).length;

  if (signalCount === 0) {
    return 'non_india';
  }
  if (signalCount >= 2 || phone) {
    return 'india';
  }
  return 'ambiguous';
}

export function detectBillingCurrency(options?: {
  phone?: string | null;
  subscriptionCurrency?: string | null;
  queryCurrency?: string | null;
}): BillingCurrency {
  const locked = normalizeBillingCurrency(options?.subscriptionCurrency);
  if (locked) return locked;

  const query = normalizeBillingCurrency(options?.queryCurrency);
  if (query) return query;

  const stored = readStoredBillingPreference();
  if (stored?.explicit) return stored.currency;

  if (isLikelyIndianUser({ phone: options?.phone })) {
    return 'INR';
  }

  if (stored?.currency) return stored.currency;

  return 'USD';
}

export function persistBillingCurrency(currency: BillingCurrency, explicit = true) {
  if (typeof window === 'undefined') return;
  const payload: StoredBillingPreference = { currency, explicit };
  localStorage.setItem(BILLING_CURRENCY_STORAGE_KEY, JSON.stringify(payload));
}

export function resolvePlanForCurrency(plan: Plan, currency: BillingCurrency): Plan | null {
  const entry = plan.pricing?.[currency];
  if (entry?.amount) {
    return {
      ...plan,
      price: entry.amount,
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

export function formatCheckoutAmount(amountMinor: number, currency: BillingCurrency): string {
  return `${formatPlanPrice(amountMinor, currency)} / month`;
}

export function currencyLabel(currency: BillingCurrency): string {
  return currency === 'INR' ? '₹ INR' : '$ USD';
}

export function currencyToggleHint(
  regionConfidence: BillingRegionConfidence,
  currency: BillingCurrency
): string {
  if (regionConfidence === 'india' && currency === 'INR') {
    return 'Prices in INR for India';
  }
  if (regionConfidence === 'non_india' && currency === 'USD') {
    return 'Prices in USD';
  }
  return 'Switch billing currency';
}

export function getClientBillingHints() {
  if (typeof window === 'undefined') {
    return { locale: '', timezone: '' };
  }
  return {
    locale: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  };
}
