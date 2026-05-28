import React from 'react';

/**
 * Enterprise / Polyrepo pattern: Standalone Dev Providers
 *
 * Platform team phát triển mfe-profile độc lập.
 * PREMIUM role phù hợp test profile/security settings.
 */

const STANDALONE_USER = {
  id: 'dev-001',
  name: 'Nguyễn Văn Dev',
  email: 'dev@vietbank.vn',
  role: 'PREMIUM',
  phone: '0901234567',
  branch: 'Chi nhánh Hà Nội',
};

export default function StandaloneProviders({ children }) {
  React.useEffect(() => {
    localStorage.setItem('vietbank_user', JSON.stringify(STANDALONE_USER));
    localStorage.setItem('vietbank_token', 'dev-standalone-token');
  }, []);

  return children;
}
