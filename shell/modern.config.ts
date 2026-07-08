import { BRAND } from '@app/common/brand';
import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { buildManifestUrls } from './remote-urls';

export default defineConfig({
  plugins: [appTools({ bundler: 'rspack' }), moduleFederationPlugin()],
  builderPlugins: [pluginTailwindcss()],
  html: {
    title: `${BRAND.name} — Ngân hàng số`,
    meta: {
      description: BRAND.description,
    },
  },
  output: { assetPrefix: process.env.PUBLIC_URL || '/' },
  source: {
    define: {
      // Inline URL manifest các remote vào bundle browser (build-time!) —
      // src/remote/config.ts đọc lại để registerRemotes động lúc runtime.
      // Đổi env REMOTE_* → phải restart dev server / rebuild.
      'process.env.REMOTE_MANIFEST_URLS': JSON.stringify(JSON.stringify(buildManifestUrls())),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
});
