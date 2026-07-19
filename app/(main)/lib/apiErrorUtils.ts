export type ApiErrorPresentation = {
  message: string;
  errorData: Record<string, unknown>;
};

export function formatApiErrorResponse(args: {
  status: number;
  statusText: string;
  contentType?: string | null;
  bodyText?: string;
}): ApiErrorPresentation {
  const { status, statusText, contentType, bodyText = '' } = args;
  const normalizedBody = bodyText.trimStart();
  const isHtml =
    Boolean(contentType?.includes('text/html')) ||
    normalizedBody.startsWith('<!DOCTYPE html') ||
    normalizedBody.startsWith('<html');
  const isGatewayError = status === 502 || status === 503 || status === 504;

  if (isHtml || isGatewayError) {
    return {
      message: 'The service is temporarily unavailable. Please try again in a moment.',
      errorData: {
        type: 'UPSTREAM_ERROR',
        status,
        statusText,
        technical_message: `Upstream returned ${status} ${statusText || 'error'}`,
        suggestion: 'Try again in a moment. If it keeps happening, the service needs a backend retry.',
      },
    };
  }

  return {
    message: `API request failed: ${status} ${statusText}`,
    errorData: {
      type: 'API_ERROR',
      status,
      statusText,
      technical_message: `Non-JSON response from backend (${contentType || 'unknown content type'})`,
    },
  };
}
