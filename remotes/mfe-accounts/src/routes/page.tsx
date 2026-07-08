import { setupStandaloneSession } from '@app/common/mocks/standalone';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import AccountsApp from '../components/AccountsApp';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60_000, retry: 1 } },
});

export default function Page() {
  useEffect(() => {
    setupStandaloneSession('PREMIUM');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: 24 }}>
        <div
          style={{
            marginBottom: 16,
            padding: '8px 14px',
            borderRadius: 8,
            background: '#dcfce7',
            color: '#166534',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Standalone — mfe-accounts :3002 · Modern.js · Mock: PREMIUM role
        </div>
        <AccountsApp />
      </div>
    </QueryClientProvider>
  );
}
