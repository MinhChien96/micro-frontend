import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'shell',
  remotes: {
    mfe_auth:     'mfe_auth@http://localhost:3001/static/mf-manifest.json',
    mfe_accounts: 'mfe_accounts@http://localhost:3002/static/mf-manifest.json',
    mfe_transfer: 'mfe_transfer@http://localhost:3003/static/mf-manifest.json',
    mfe_cards:    'mfe_cards@http://localhost:3007/static/mf-manifest.json',
    mfe_loans:    'mfe_loans@http://localhost:3006/static/mf-manifest.json',
    mfe_profile:  'mfe_profile@http://localhost:3005/static/mf-manifest.json',
  },
  shared: {
    react:              { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
  },
});
