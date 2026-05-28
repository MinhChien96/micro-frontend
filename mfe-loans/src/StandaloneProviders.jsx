import React from 'react';

/**
 * Enterprise / Polyrepo pattern: Standalone Dev Providers
 *
 * Lending team phát triển mfe-loans độc lập.
 * BUSINESS role để test PermissionGate trên loan application flow.
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
