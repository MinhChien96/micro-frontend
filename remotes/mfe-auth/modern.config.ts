import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { resolvePublicPath } from './public-path';

export default defineConfig({
  plugins: [appTools({ bundler: 'rspack' }), moduleFederationPlugin()],
  builderPlugins: [pluginTailwindcss()],
  // assetPrefix TUYỆT ĐỐI per remote — xem ./public-path.ts (ưu tiên PUBLIC_URL
  // → REMOTE_HOST_MFE_<SELF> per môi trường → localhost dev)
  output: { assetPrefix: resolvePublicPath() },
  server: {
    port: Number(process.env.PORT) || 3001,
  },
});
