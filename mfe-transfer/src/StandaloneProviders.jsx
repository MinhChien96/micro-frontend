import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Enterprise / Polyrepo pattern: Standalone Dev Providers
 *
 * Payments team phát triển mfe-transfer độc lập.
 * ToastProvider không cần thiết standalone vì useToast() trả noop khi không có provider.
 * Auth mock đủ để test transfer wizard với PREMIUM role.
 */

const STANDALONE_USER = {
  id: 'dev-001',
  name: 'Dev User',
  email: 'dev@vietbank.vn',
  role: 'PREMIUM',
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function StandaloneProviders({ children }) {
  React.useEffect(() => {
    localStorage.setItem('vietbank_user', JSON.stringify(STANDALONE_USER));
    localStorage.setItem('vietbank_token', 'dev-standalone-token');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
