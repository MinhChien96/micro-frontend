import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  plugins: [
    appTools({ bundler: 'rspack' }),
    moduleFederationPlugin(),
  ],
  server: { port: 3001 },
});
