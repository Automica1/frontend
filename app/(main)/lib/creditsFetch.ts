let sharedCreditsFetch: Promise<void> | null = null;

export function runSharedCreditsFetch(task: () => Promise<void>): Promise<void> {
  if (sharedCreditsFetch) {
    return sharedCreditsFetch;
  }

  sharedCreditsFetch = task().finally(() => {
    sharedCreditsFetch = null;
  });

  return sharedCreditsFetch;
}
