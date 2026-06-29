const GUEST_PASS_KEY = 'automica-guest-pass';

/** Normalize dictation-friendly input to canonical key format. */
export function normalizeGuestPassKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function loadGuestPassKey(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(GUEST_PASS_KEY) || '';
}

export function storeGuestPassKey(key: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = normalizeGuestPassKey(key);
  if (!trimmed) {
    sessionStorage.removeItem(GUEST_PASS_KEY);
    return;
  }
  sessionStorage.setItem(GUEST_PASS_KEY, trimmed);
}

export function clearGuestPassKey(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(GUEST_PASS_KEY);
}
