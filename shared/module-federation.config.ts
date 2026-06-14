import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'shared',
  dts: false,
  manifest: { filePath: 'static' },
  filename: 'static/remoteEntry.js',
  exposes: {
    './ui': './src/ui/index.ts',
    './auth': './src/auth.ts',
    './PermissionGate': './src/components/PermissionGate.tsx',
    './ThemeContext': './src/ThemeContext.tsx',
    './eventBus': './src/eventBus.ts',
    './brand': './src/config/brand.ts',
  },
  shared: {
    react: { singleton: true, requiredVersion: '>=18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.2.0' },
  },
});
