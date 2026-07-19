import { describe, expect, it } from 'vitest';
import { formatApiErrorResponse } from './apiErrorUtils';

describe('formatApiErrorResponse', () => {
  it('sanitizes html gateway failures into a friendly message', () => {
    const result = formatApiErrorResponse({
      status: 502,
      statusText: 'Bad Gateway',
      contentType: 'text/html; charset=utf-8',
      bodyText: '<!DOCTYPE html><html><body>proxy error</body></html>',
    });

    expect(result.message).toBe('The service is temporarily unavailable. Please try again in a moment.');
    expect(result.errorData).toMatchObject({
      type: 'UPSTREAM_ERROR',
      status: 502,
      technical_message: 'Upstream returned 502 Bad Gateway',
    });
  });

  it('keeps non-json but non-gateway errors readable', () => {
    const result = formatApiErrorResponse({
      status: 409,
      statusText: 'Conflict',
      contentType: 'text/plain',
      bodyText: 'something went wrong',
    });

    expect(result.message).toBe('API request failed: 409 Conflict');
    expect(result.errorData).toMatchObject({
      type: 'API_ERROR',
      status: 409,
      technical_message: 'Non-JSON response from backend (text/plain)',
    });
  });
});
