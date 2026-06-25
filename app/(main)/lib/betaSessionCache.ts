const DB_NAME = 'automica-beta-cache';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;

export interface BetaSessionCacheEntry {
  sessionId: string;
  thumbnails: string[];
  capturedAt: string;
  creditsCharged: number;
}

function cacheKey(serviceSlug: string): string {
  return `automica-beta-last-session:${serviceSlug}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

export async function saveBetaSessionCache(
  serviceSlug: string,
  entry: BetaSessionCacheEntry
): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(entry, cacheKey(serviceSlug));

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Failed to save beta session cache'));
  });

  db.close();
}

export async function loadBetaSessionCache(
  serviceSlug: string
): Promise<BetaSessionCacheEntry | null> {
  const db = await openDatabase();

  const entry = await new Promise<BetaSessionCacheEntry | null>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(cacheKey(serviceSlug));

    request.onsuccess = () => resolve((request.result as BetaSessionCacheEntry | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('Failed to load beta session cache'));
  });

  db.close();
  return entry;
}

export async function clearBetaSessionCache(serviceSlug: string): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(cacheKey(serviceSlug));

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Failed to clear beta session cache'));
  });

  db.close();
}
