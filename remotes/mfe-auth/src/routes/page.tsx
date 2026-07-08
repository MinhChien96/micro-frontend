import { isAuthenticated, setToken } from '@app/common/auth';
import Login from '../components/Login';

export default function Page() {
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    setToken('dev-standalone-token');
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          padding: '8px 14px',
          borderRadius: 8,
          background: '#fef3c7',
          color: '#92400e',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Standalone — mfe-auth :3001 · Modern.js dev mode
      </div>
      <Login />
    </div>
  );
}
