/**
 * Error normalisation utility for NOVA.
 * Safely extracts a human-readable message from any unknown value,
 * including Error instances, ApiError, AppError, strings, plain objects,
 * and browser Event / ErrorEvent / CustomEvent objects.
 * Never allows a browser Event to be stringified as "[object Event]".
 */
export function getErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'An unexpected error occurred.';
  }

  if (typeof error === 'string') {
    const trimmed = error.trim();
    return trimmed || 'An unexpected error occurred.';
  }

  // Handle standard JavaScript Error and derived subclasses (ApiError, AppError, etc.)
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred.';
  }

  // Handle browser Event objects (DOM Event, ErrorEvent, CustomEvent, ProgressEvent)
  if (typeof Event !== 'undefined' && error instanceof Event) {
    const ev = error as unknown as Record<string, unknown>;
    if (ev['error'] instanceof Error) {
      return ev['error'].message;
    }
    if (typeof ev['message'] === 'string' && ev['message'].trim()) {
      return ev['message'].trim();
    }
    if (error.type && error.type !== 'error') {
      return `Action interrupted by browser event (${error.type}).`;
    }
    return 'A network or browser connection event prevented the request.';
  }

  // Handle plain objects with a message or error string property
  if (typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record['message'] === 'string' && record['message'].trim()) {
      return record['message'].trim();
    }
    if (typeof record['error'] === 'string' && record['error'].trim()) {
      return record['error'].trim();
    }
    const str = String(error);
    if (str !== '[object Object]' && str !== '[object Event]') {
      return str;
    }
  }

  return 'An unexpected error occurred.';
}
