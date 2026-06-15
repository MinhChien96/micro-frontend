import * as Sentry from '@sentry/react';

// Sentry browser-only. DSN từ env MODERN_PUBLIC_SENTRY_DSN (Modern.js inline
// var prefix MODERN_). Không set DSN → no-op (an toàn cho dev/SSR/CI).
let inited = false;

export function initSentry(): void {
  if (inited || typeof window === 'undefined') return;
  const dsn = process.env.MODERN_PUBLIC_SENTRY_DSN;
  if (!dsn) return; // no-op khi chưa cấu hình
  Sentry.init({
    dsn,
    environment: process.env.MODERN_PUBLIC_SENTRY_ENV || 'development',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
  inited = true;
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
