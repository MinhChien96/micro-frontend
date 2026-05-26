import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  base: process.env.PUBLIC_URL || '/',
  plugins: [
    react(),
    federation({
      dts: false,
      name: 'shared',
      filename: 'remoteEntry.js',
      exposes: {
        './ui':             './src/ui/index.js',
        './auth':           './src/auth.js',
        './PermissionGate': './src/components/PermissionGate.jsx',
        './ThemeContext':   './src/ThemeContext.jsx',
        './eventBus':       './src/eventBus.js',
      },
      shared: {
        react:       { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
      },
    }),
  ],
  server:  { port: 3004, cors: true, origin: 'http://localhost:3004' },
  preview: { port: 3004, cors: true },
  build:   { target: 'esnext' },
});
