import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/ui/**/*.stories.@(ts|tsx)'],
  addons: [],
  async viteFinal(viteConfig) {
    // Tailwind v4 qua @tailwindcss/vite — dynamic import (top-level import vỡ
    // Storybook startup, xem tailwindlabs/tailwindcss#16451)
    const { mergeConfig } = await import('vite');
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    return mergeConfig(viteConfig, { plugins: [tailwindcss()] });
  },
};

export default config;
