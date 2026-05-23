import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const sharedSrc = fileURLToPath(new URL('../shared/src', import.meta.url));

export default defineConfig({
  base: process.env.PUBLIC_URL || '/',
  plugins: [
    react(),
    federation({
      name: 'mfe_loans',
      filename: 'remoteEntry.js',
      exposes: {
        './LoansApp': './src/components/LoansApp',
      },
      shared: {
        react:              { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
      },
    }),
  ],
  resolve: {
    alias: {
      'shared/ui':             `${sharedSrc}/ui/index.js`,
      'shared/auth':           `${sharedSrc}/auth.js`,
      'shared/PermissionGate': `${sharedSrc}/components/PermissionGate.jsx`,
    },
  },
  server:  { port: 3006, cors: true },
  preview: { port: 3006, cors: true },
  build:   { target: 'esnext' },
});
