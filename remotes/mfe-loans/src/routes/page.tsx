import { setupStandaloneSession } from '@app/common/mocks/standalone';
import { useEffect } from 'react';
import LoansApp from '../components/LoansApp';

export default function Page() {
  useEffect(() => {
    setupStandaloneSession('BUSINESS');
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
