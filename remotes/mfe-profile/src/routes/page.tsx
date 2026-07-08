import { setupStandaloneSession } from '@app/common/mocks/standalone';
import { useEffect } from 'react';
import ProfileApp from '../components/ProfileApp';

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
