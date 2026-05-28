import React from 'react';

/**
 * Enterprise / Polyrepo pattern: Standalone Dev Providers
 *
 * Cards team phát triển mfe-cards độc lập.
 * Không cần QueryClient (cards dùng mock data).
 * Auth mock inject BUSINESS role để test PermissionGate (limit/PIN controls).
 */

const STANDALONE_USER = {
  id: 'dev-001',
  name: 'Dev User',
  email: 'dev@vietbank.vn',
  role: 'BUSINESS',
};

export default function StandaloneProviders({ children }) {
  React.useEffect(() => {
    localStorage.setItem('vietbank_user', JSON.stringify(STANDALONE_USER));
    localStorage.setItem('vietbank_token', 'dev-standalone-token');
  }, []);

  return children;
}
