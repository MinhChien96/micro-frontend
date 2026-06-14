import { useEffect } from 'react';
import LoansApp from '../components/LoansApp';

const MOCK_USER = {
  id: 'dev-002',
  name: 'Dev Corp',
  role: 'BUSINESS',
  email: 'dev@vietbank.vn',
  branch: 'HN',
};

export default function Page() {
  useEffect(() => {
    localStorage.setItem('vietbank_user', JSON.stringify(MOCK_USER));
    localStorage.setItem('vietbank_token', 'dev-standalone-token');
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
