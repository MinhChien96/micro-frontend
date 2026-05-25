import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import remotes from '../remotes.config.js';

export default defineConfig({
  base: process.env.PUBLIC_URL || '/',
  plugins: [
    react(),
    federation({ dts: false,
      name: 'mfe_profile',
      filename: 'remoteEntry.js',
      exposes: {
        './ProfileApp':  './src/components/ProfileApp',
        './ProfilePage': './src/components/ProfilePage',
      },
      remotes: { shared: remotes.shared },
      shared: {
        react:              { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
      },
    }),
  ],
  server:  { port: 3005, cors: true, origin: 'http://localhost:3005' },
  preview: { port: 3005, cors: true },
  build:   { target: 'esnext' },
});
