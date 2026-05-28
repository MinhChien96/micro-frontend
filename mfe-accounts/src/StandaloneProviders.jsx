import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Enterprise / Polyrepo pattern: Standalone Dev Providers
 *
 * Khi team accounts phát triển độc lập (không cần shell, không cần shell's providers),
 * component này thay thế ThemeProvider + AuthProvider của shell bằng mock data.
 *
 * Auth state được inject vào localStorage — shared/auth.js đọc từ localStorage,
 * không phụ thuộc vào React context hay shell.
 *
 * Team chỉ cần: shared server (port 3004) + mfe-accounts server (port 3002)
 * Không cần: shell (port 3000) hay bất kỳ MFE khác.
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
  // Inject mock auth — shared/auth.js reads from these keys
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
