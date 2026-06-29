export type BillingCurrency = 'USD' | 'INR';

export const SUPPORTED_CURRENCIES: BillingCurrency[] = ['USD', 'INR'];
export const BILLING_CURRENCY_STORAGE_KEY = 'automica_billing_currency';

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

  if (isIndianPhone(options?.phone)) return 'INR';

  if (typeof navigator !== 'undefined') {
    const locale = navigator.language?.toLowerCase() || '';
    if (locale === 'en-in' || locale.endsWith('-in')) {
      return 'INR';
    }
  }

  return 'USD';
}

export function persistBillingCurrency(currency: BillingCurrency) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BILLING_CURRENCY_STORAGE_KEY, currency);
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
