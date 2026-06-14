import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'shared',
  dts: false,
  manifest: { filePath: 'static' },
  filename: 'static/remoteEntry.js',
  exposes: {
    './ui': './src/ui/index.js',
    './auth': './src/auth.js',
    './PermissionGate': './src/components/PermissionGate.jsx',
    './ThemeContext': './src/ThemeContext.jsx',
    './eventBus': './src/eventBus.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '>=18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.2.0' },
  },
});
