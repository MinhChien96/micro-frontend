import { setToken, setUser, type User } from '@app/shared/auth';
import { useEffect } from 'react';
import CardsApp from '../components/CardsApp';

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
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          padding: '8px 14px',
          borderRadius: 8,
          background: '#d1fae5',
          color: '#065f46',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Standalone — mfe-cards :3007 · Modern.js · Mock: PREMIUM role
      </div>
      <CardsApp />
    </div>
  );
}
