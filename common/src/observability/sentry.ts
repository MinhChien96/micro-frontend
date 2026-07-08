import * as Sentry from '@sentry/react';

// Sentry browser-only. DSN từ env MODERN_PUBLIC_SENTRY_DSN (Modern.js inline
// var prefix MODERN_). Không set DSN → no-op (an toàn cho dev/SSR/CI).
let inited = false;

// Modern.js inline `process.env.MODERN_PUBLIC_*` thành literal KHI var được set.
// Khi KHÔNG set, biểu thức giữ nguyên → `process` không tồn tại ở browser → ReferenceError.
// Giữ literal member-access (để DefinePlugin thay khi có) + bọc try/catch để no-op an toàn.
function readEnv(read: () => string | undefined): string | undefined {
  try {
    return read();
  } catch {
    return undefined;
  }
}

export function initSentry(): void {
  if (inited || typeof window === 'undefined') return;
  const dsn = readEnv(() => process.env.MODERN_PUBLIC_SENTRY_DSN);
  if (!dsn) return; // no-op khi chưa cấu hình
  Sentry.init({
    dsn,
    environment: readEnv(() => process.env.MODERN_PUBLIC_SENTRY_ENV) || 'development',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
  inited = true;
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
