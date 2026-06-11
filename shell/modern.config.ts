import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  plugins: [
    appTools({ bundler: 'rspack' }),
    moduleFederationPlugin(),
  ],
  output: {
    // Pre-render static shell pages at build time.
    // MFE-mounted pages (accounts, transfer...) render an empty shell with
    // loading state; actual MFE content hydrates at runtime on the client.
    ssg: {
      routes: ['/', '/login'],
    },
  },
  server: { port: 3000 },
});
