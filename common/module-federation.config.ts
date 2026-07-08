import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'common',
  dts: false,
  manifest: { filePath: 'static' },
  filename: 'static/remoteEntry.js',
  exposes: {
    './ui': './src/ui/index.ts',
    './auth': './src/auth.ts',
    './PermissionCheck': './src/components/PermissionCheck.tsx',
    './permissions': './src/permissions/index.ts',
    './stores': './src/stores/global.store.ts',
    './ThemeContext': './src/ThemeContext.tsx',
    './eventBus': './src/eventBus.ts',
    './brand': './src/config/brand.ts',
  },
  shared: {
    react: { singleton: true, requiredVersion: '>=18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.2.0' },
  },
});
