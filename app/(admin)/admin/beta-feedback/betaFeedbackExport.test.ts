import { describe, expect, it } from 'vitest';
import {
  buildFilterLabel,
  buildInputFileName,
  exportZipFilename,
  parseBase64Image,
  sessionToTrainingRecord,
} from './betaFeedbackExport';

describe('betaFeedbackExport', () => {
  it('builds zip filename from service and filter context', () => {
    const filename = exportZipFilename({
      serviceName: 'signature-verification',
      scope: 'filtered',
      statusFilter: 'refunded',
      outcomeFilter: 'completed',
    });

    expect(filename).toMatch(/^signature-verification__status-refunded_outcome-completed__/);
    expect(filename.endsWith('.zip')).toBe(true);
  });

  it('names input files with req id, index, and role', () => {
    expect(buildInputFileName('req-123', 0, 'reference_signature', 'jpg')).toBe(
      'inputs/req-123__input0__reference_signature.jpg'
    );
  });

  it('maps predicted and expected scores into training records', () => {
    const record = sessionToTrainingRecord(
      {
        id: 'abc123',
        userId: 'user-1',
        email: 'test@example.com',
        serviceName: 'signature-verification',
        reqId: 'req-1',
        status: 'refunded',
        runOutcome: 'completed',
        creditsCharged: 2,
        creditsRefunded: 2,
        createdAt: '2026-07-02T12:00:00.000Z',
        actualResult: {
          classification: 'Genuine',
          similarity_percentage: 91.4,
        },
        expectedResult: {
          expectedClassification: 'Forged',
          expectedSimilarityMin: 10,
          expectedSimilarityMax: 40,
          responseAsExpected: false,
          notes: 'Wrong label',
        },
        inputs: [],
      },
      [
        { index: 0, role: 'reference_signature', zipPath: 'inputs/req-1__input0__reference_signature.jpg' },
        { index: 1, role: 'query_signature', zipPath: 'inputs/req-1__input1__query_signature.jpg' },
      ]
    );

    expect(record.predictedClassification).toBe('Genuine');
    expect(record.predictedScore).toBe(91.4);
    expect(record.expectedClassification).toBe('Forged');
    expect(record.expectedScoreMin).toBe(10);
    expect(record.expectedScoreMax).toBe(40);
    expect(record.classificationMatch).toBe(false);
    expect(record.inputs).toHaveLength(2);
  });

  it('decodes base64 image payloads', () => {
    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const parsed = parseBase64Image(tinyPng);
    expect(parsed.extension).toBe('png');
    expect(parsed.bytes.length).toBeGreaterThan(0);
  });

  it('builds filter labels for export scopes', () => {
    expect(
      buildFilterLabel({
        serviceName: 'signature-verification',
        scope: 'filtered',
        statusFilter: 'refunded',
        outcomeFilter: 'completed',
        selectedUserCount: 2,
      })
    ).toBe('status-refunded_outcome-completed_users-2-selected');

    expect(
      buildFilterLabel({
        serviceName: 'signature-verification',
        scope: 'filtered',
        statusFilter: 'all',
        outcomeFilter: 'all',
        selectedUserCount: 1,
        selectedUserEmail: 'alice@example.com',
      })
    ).toBe('status-all_outcome-all_user-alice_example.com');
  });
});
