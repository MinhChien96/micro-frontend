import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'mfe_loans',
  manifest: { filePath: 'static' },
  filename: 'static/remoteEntry.js',
  exposes: {
    './LoansApp': './src/components/LoansApp',
  },
  shared: {
    react:              { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
  },
});
