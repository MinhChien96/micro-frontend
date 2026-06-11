import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'mfe_accounts',
  manifest: { filePath: 'static' },
  filename: 'static/remoteEntry.js',
  exposes: {
    './AccountsApp': './src/components/AccountsApp',
  },
  shared: {
    react:                   { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom':             { singleton: true, requiredVersion: '^18.2.0' },
    'react-router-dom':      { singleton: true, requiredVersion: '^6.22.0' },
    '@tanstack/react-query': { singleton: true, requiredVersion: '^5.28.0' },
  },
});
