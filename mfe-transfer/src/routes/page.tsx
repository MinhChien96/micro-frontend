import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransferApp from '../components/TransferApp';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60_000, retry: 1 } } });

const MOCK_USER = { id: 'dev-001', name: 'Dev User', role: 'PREMIUM', email: 'dev@vietbank.vn', branch: 'HN' };

export default function Page() {
  useEffect(() => {
    localStorage.setItem('vietbank_user', JSON.stringify(MOCK_USER));
    localStorage.setItem('vietbank_token', 'dev-standalone-token');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: 24 }}>
        <div style={{
          marginBottom: 16, padding: '8px 14px', borderRadius: 8,
          background: '#dbeafe', color: '#1e40af', fontSize: 12, fontWeight: 600,
        }}>
          Standalone — mfe-transfer :3003 · Modern.js · Mock: PREMIUM role
        </div>
        <TransferApp />
      </div>
    </QueryClientProvider>
  );
}
