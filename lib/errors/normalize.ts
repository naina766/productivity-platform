/**
 * Turn any thrown value into a message that is safe to render.
 *
 * `fetch` rejects with a TypeError, API routes throw ApiError/AppError, and a
 * defensive catch may receive anything at all — so every shape is handled and
 * the fallback is used rather than leaking "[object Object]" into the UI.
 */
export function getErrorMessage(error: unknown): string {
  const FALLBACK = 'An unexpected error occurred.';

  if (error === null || error === undefined) return FALLBACK;

  if (typeof error === 'string') return error.trim() || FALLBACK;

  if (error instanceof Error) return error.message || FALLBACK;

  if (typeof error === 'object') {
    const record = error as Record<string, unknown>;

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message.trim();
    }
    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error.trim();
    }
  }

  return FALLBACK;
}
