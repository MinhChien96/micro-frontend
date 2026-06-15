import { setToken, setUser, type User } from '@app/shared/auth';
import { useEffect } from 'react';
import LoansApp from '../components/LoansApp';

const MOCK_USER: User = {
  id: 'dev-002',
  name: 'Dev Corp',
  role: 'BUSINESS',
  email: 'dev@example.com',
  branch: 'HN',
};

export default function Page() {
  useEffect(() => {
    setUser(MOCK_USER);
    setToken('dev-standalone-token');
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          padding: '8px 14px',
          borderRadius: 8,
          background: '#ede9fe',
          color: '#5b21b6',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Standalone — mfe-loans :3006 · Modern.js · Mock: BUSINESS role
      </div>
      <LoansApp />
    </div>
  );
}
