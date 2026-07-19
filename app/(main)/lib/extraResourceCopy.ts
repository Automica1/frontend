export type ExtraResourceCopy = {
  session: string;
  sessionActive: string;
  startingSession: string;
  resumingSession: string;
  endingSession: string;
  onStandby: string;
  couldNotStart: string;
  busyHeadline: string;
  busyDetail: string;
  notRunning: string;
  notRunningDetail: string;
  compareGate: string;
  compareGateShort: string;
  compareGatePending: string;
  allocateStep: string;
  /** Idle panel (before Start): why compute is needed */
  betaIntroLine1: string;
  betaIntroLine2: string;
  reconnectHint: string;
  shutdownScheduled: string;
  keepRunning: string;
  shutdownDue: string;
  tryBeta: string;
  reserveAndCompare: string;
  insufficientCreditsDetail: string;
  failedLoadStatus: string;
  failedStart: string;
  failedStop: string;
  shuttingDown: string;
  shuttingDownAdmin: string;
  shuttingDownWait: string;
  sessionTimeLabel: string;
  retiredCountdown: string;
  shutdownCountdown: string;
};

const defaultCopy: ExtraResourceCopy = {
  session: 'Try API',
  sessionActive: 'Try API active',
  startingSession: 'Preparing Try API…',
  resumingSession: 'Resuming Try API…',
  endingSession: 'Wrapping up Try API…',
  onStandby: 'Try API ready',
  couldNotStart: 'Could not prepare Try API',
  busyHeadline: 'Try API busy — try again soon',
  busyDetail: 'The service is busy right now. Try again in about 15 minutes.',
  notRunning: 'Try API is not available',
  notRunningDetail: 'The previous run ended — the service is not available right now. Start again when ready.',
  compareGate: 'Start Try API first, then compare below.',
  compareGateShort: 'Start Try API first, then compare.',
  compareGatePending: 'Start Try API above, then compare',
  allocateStep: 'Preparing service',
  betaIntroLine1: 'This beta key uses a dedicated compute-backed API.',
  betaIntroLine2: 'We’ll prepare it for you when you start.',
  reconnectHint: 'Tap Start to continue — no extra startup charge within 5 minutes.',
  shutdownScheduled: 'Shutdown scheduled.',
  keepRunning: 'Start again to keep it running.',
  shutdownDue: 'It is due to shut down now. Start again to request it.',
  tryBeta: 'Start to try the beta API.',
  reserveAndCompare: 'Start to reserve the API, then compare below.',
  insufficientCreditsDetail: 'Session ended — not enough credits for runtime.',
  failedLoadStatus: 'Failed to load Try API status',
  failedStart: 'Failed to prepare Try API',
  failedStop: 'Failed to stop Try API',
  shuttingDown: 'This service is shutting down. Contact an admin to turn it back on.',
  shuttingDownAdmin: 'This service is shutting down. Contact support.',
  shuttingDownWait: 'The service is shutting down. Wait a minute and try Start Testing again.',
  sessionTimeLabel: 'runtime',
  retiredCountdown: 'This service is being retired in',
  shutdownCountdown: 'Try API shuts down in',
};

export function getExtraResourceCopy(): ExtraResourceCopy {
  return defaultCopy;
}
