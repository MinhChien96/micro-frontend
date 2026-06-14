import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  plugins: [appTools({ bundler: 'rspack' }), moduleFederationPlugin()],
  output: { assetPrefix: process.env.PUBLIC_URL || '/' },
  tools: {
    bundlerChain(chain, { isServer }) {
      // Race trong MF ssrPlugin: externals cho web đôi khi không kịp apply
      // → tự externalize node-only utils khỏi browser bundle (an toàn, lib cũng làm vậy)
      if (!isServer) chain.externals({ '@module-federation/node/utils': 'NOT_USED_IN_BROWSER' });
    },
  },
  server: {
    ssr: { mode: 'stream' },
    port: Number(process.env.PORT) || 3001,
  },
});
