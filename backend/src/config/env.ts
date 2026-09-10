import 'dotenv/config';

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var ${name}. See backend/.env.example.`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
} as const;

export function assertJwtConfigured(): void {
  requireEnv('JWT_ACCESS_SECRET', env.jwtAccessSecret || undefined);
  requireEnv('JWT_REFRESH_SECRET', env.jwtRefreshSecret || undefined);
}
