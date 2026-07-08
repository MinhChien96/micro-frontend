import { setupStandaloneSession } from '@app/common/mocks/standalone';
import { useEffect } from 'react';
import CardsApp from '../components/CardsApp';

export default function Page() {
  useEffect(() => {
    setupStandaloneSession('PREMIUM');
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
