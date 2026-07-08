import '../src/tailwind.css';
import type { Decorator, Preview } from '@storybook/react-vite';

// Toolbar toggle dark mode → set [data-theme] (cùng cơ chế ThemeContext)
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  return (
    <div className="bg-bg-page p-6 text-text-main">
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
