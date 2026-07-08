import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

export default defineConfig({
  plugins: [appTools({ bundler: 'rspack' }), moduleFederationPlugin()],
  builderPlugins: [pluginTailwindcss()],
  // assetPrefix TUYỆT ĐỐI: chunks của remote phải load từ origin của remote,
  // không phải origin shell (shell nhúng remote cross-origin).
  output: { assetPrefix: process.env.PUBLIC_URL || 'http://localhost:3005/' },
  server: {
    port: Number(process.env.PORT) || 3005,
  },
});
