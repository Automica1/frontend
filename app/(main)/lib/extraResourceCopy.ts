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
  session: 'Resource session',
  sessionActive: 'Resource session active',
  startingSession: 'Starting resource session…',
  resumingSession: 'Resuming resource session…',
  endingSession: 'Ending resource session…',
  onStandby: 'Resource on standby',
  couldNotStart: 'Could not start resource session',
  busyHeadline: 'Resources busy — try again soon',
  busyDetail: 'All test resources are busy right now. Try again in about 15 minutes.',
  notRunning: 'Resource is not running',
  notRunningDetail: 'Previous session ended — resource is not running. Start again when ready.',
  compareGate: 'Start a resource session first, then compare below.',
  compareGateShort: 'Start a resource session first, then compare.',
  compareGatePending: 'Start resource session above, then compare',
  allocateStep: 'Allocating resource',
  betaIntroLine1: 'The AI API attached to this beta key requires compute resources.',
  betaIntroLine2: 'A dedicated resource will be set up for you on session start.',
  reconnectHint: 'Tap Start to continue — no extra startup charge within 5 minutes.',
  shutdownScheduled: 'Resource shutdown scheduled.',
  keepRunning: 'Start session again to keep this resource running.',
  shutdownDue: 'Shutdown is due now. Start a new session to request the resource again.',
  tryBeta: 'Start session to try the beta resource.',
  reserveAndCompare: 'Start session to reserve a resource, then compare below.',
  insufficientCreditsDetail: 'Session ended — not enough credits for resource time.',
  failedLoadStatus: 'Failed to load resource session status',
  failedStart: 'Failed to start resource session',
  failedStop: 'Failed to stop resource session',
  shuttingDown: 'The test resource is shutting down. Contact an admin to turn it back on.',
  shuttingDownAdmin: 'This test resource is shutting down. Contact support.',
  shuttingDownWait: 'Resource is shutting down. Wait a minute and try Start Testing again.',
  sessionTimeLabel: 'resource time',
  retiredCountdown: 'This resource is being retired in',
  shutdownCountdown: 'Resource shuts down in',
};

export function getExtraResourceCopy(): ExtraResourceCopy {
  return defaultCopy;
}
