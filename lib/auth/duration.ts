/** Convert a JWT-style duration string ("15m", "7d") to seconds. */
export function durationToSeconds(duration: string, fallbackSeconds: number): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return fallbackSeconds;

  const value = Number(match[1]);
  switch (match[2]) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    default:
      return value * 86400;
  }
}
