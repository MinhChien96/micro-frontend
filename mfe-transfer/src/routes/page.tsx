import { setToken, setUser, type User } from '@app/shared/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import TransferApp from '../components/TransferApp';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60_000, retry: 1 } },
});

const MOCK_USER: User = {
  id: 'dev-001',
  name: 'Dev User',
  role: 'PREMIUM',
  email: 'dev@example.com',
  branch: 'HN',
};

export default function Page() {
  useEffect(() => {
    setUser(MOCK_USER);
    setToken('dev-standalone-token');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: 24 }}>
        <div
          style={{
            marginBottom: 16,
            padding: '8px 14px',
            borderRadius: 8,
            background: '#dbeafe',
            color: '#1e40af',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Standalone — mfe-transfer :3003 · Modern.js · Mock: PREMIUM role
        </div>
        <TransferApp />
      </div>
    </QueryClientProvider>
  );
}
