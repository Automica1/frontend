export type PendingCheckout = {
  subscriptionId?: string;
  orderId?: string;
  shortUrl?: string;
  planId: string;
  planName: string;
  currency: string;
  amount: number;
  isUpgrade: boolean;
};

const STORAGE_KEY = 'automica_pending_checkout';

export function savePendingCheckout(data: PendingCheckout) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadPendingCheckout(): PendingCheckout | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingCheckout;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
