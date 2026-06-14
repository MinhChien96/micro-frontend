import { setToken, setUser, type User } from '@app/shared/auth';
import { useEffect } from 'react';
import ProfileApp from '../components/ProfileApp';

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
          background: '#fce7f3',
          color: '#9d174d',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Standalone — mfe-profile :3005 · Modern.js · Mock: PREMIUM role
      </div>
      <ProfileApp />
    </div>
  );
}
