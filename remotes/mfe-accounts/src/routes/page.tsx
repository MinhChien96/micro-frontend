import { setToken, setUser, type User } from '@app/common/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import AccountsApp from '../components/AccountsApp';

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
