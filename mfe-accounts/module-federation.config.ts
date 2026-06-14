import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'mfe_accounts',
  dts: false,
  manifest: { filePath: 'static' },
  filename: 'static/remoteEntry.js',
  exposes: {
    './AccountsApp': './src/components/AccountsApp',
  },
  shared: {
    'react/jsx-runtime': { singleton: true, requiredVersion: false },
    'react/jsx-dev-runtime': { singleton: true, requiredVersion: false },
    'shared/ui': { singleton: true, requiredVersion: false },
    'shared/eventBus': { singleton: true, requiredVersion: false },
    react: { singleton: true, requiredVersion: '>=18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
    '@tanstack/react-query': { singleton: true, requiredVersion: '^5.28.0' },
  },
});
