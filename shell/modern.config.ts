import { BRAND } from '@app/common/brand';
import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

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
  server: {
    port: Number(process.env.PORT) || 3000,
  },
});
