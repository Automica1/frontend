const LEGACY_KEY_PREFIX = 'automica-beta-key:';
const PREFS_KEY_PREFIX = 'automica-beta-prefs:';

export type BetaKeyPrefs = {
  key: string;
  enabled: boolean;
};

function legacyStorageKey(serviceSlug: string): string {
  return `${LEGACY_KEY_PREFIX}${serviceSlug}`;
}

function prefsStorageKey(serviceSlug: string): string {
  return `${PREFS_KEY_PREFIX}${serviceSlug}`;
}

export function loadBetaKeyPrefs(serviceSlug: string): BetaKeyPrefs {
  if (typeof window === 'undefined') {
    return { key: '', enabled: false };
  }

  const rawPrefs = sessionStorage.getItem(prefsStorageKey(serviceSlug));
  if (rawPrefs) {
    try {
      const parsed = JSON.parse(rawPrefs) as Partial<BetaKeyPrefs>;
      return {
        key: typeof parsed.key === 'string' ? parsed.key : '',
        enabled: Boolean(parsed.enabled),
      };
    } catch {
      // Fall through to legacy migration.
    }
  }

  const legacyKey = sessionStorage.getItem(legacyStorageKey(serviceSlug)) || '';
  if (legacyKey) {
    const migrated = { key: legacyKey, enabled: true };
    storeBetaKeyPrefs(serviceSlug, migrated);
    sessionStorage.removeItem(legacyStorageKey(serviceSlug));
    return migrated;
  }

  return { key: '', enabled: false };
}

export function storeBetaKeyPrefs(serviceSlug: string, prefs: BetaKeyPrefs): void {
  if (typeof window === 'undefined') return;

  if (!prefs.key && !prefs.enabled) {
    sessionStorage.removeItem(prefsStorageKey(serviceSlug));
    sessionStorage.removeItem(legacyStorageKey(serviceSlug));
    return;
  }

  sessionStorage.setItem(prefsStorageKey(serviceSlug), JSON.stringify(prefs));
  sessionStorage.removeItem(legacyStorageKey(serviceSlug));
}
