import { describe, expect, it } from 'vitest';
import { buildUserOptions, getSessionUserKey } from './BetaFeedbackUserFilter';

describe('BetaFeedbackUserFilter', () => {
  it('groups sessions by user and counts them', () => {
    const options = buildUserOptions([
      {
        id: '1',
        userId: 'user-a',
        email: 'alice@example.com',
        serviceName: 'signature-verification',
        reqId: 'r1',
        status: 'refunded',
        creditsCharged: 2,
        createdAt: '2026-07-02T12:00:00.000Z',
      },
      {
        id: '2',
        userId: 'user-a',
        email: 'alice@example.com',
        serviceName: 'signature-verification',
        reqId: 'r2',
        status: 'refunded',
        creditsCharged: 2,
        createdAt: '2026-07-02T12:00:00.000Z',
      },
      {
        id: '3',
        userId: 'user-b',
        email: 'bob@example.com',
        serviceName: 'signature-verification',
        reqId: 'r3',
        status: 'pending_feedback',
        creditsCharged: 2,
        createdAt: '2026-07-02T12:00:00.000Z',
      },
    ]);

    expect(options).toHaveLength(2);
    expect(options[0].email).toBe('alice@example.com');
    expect(options[0].sessionCount).toBe(2);
    expect(getSessionUserKey({
      userId: 'user-a',
      email: 'alice@example.com',
      serviceName: 'signature-verification',
      reqId: 'r1',
      status: 'refunded',
      creditsCharged: 2,
      createdAt: '2026-07-02T12:00:00.000Z',
    })).toBe('user-a');
  });
});
