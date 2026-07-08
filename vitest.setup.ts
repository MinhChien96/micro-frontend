import '@testing-library/jest-dom/vitest';
import { server } from '@app/common/mocks/server';
import { afterAll, afterEach, beforeAll } from 'vitest';

// MSW: intercept HTTP trong mọi test (bypass request không có handler)
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// jsdom thiếu matchMedia — mock no-op cho ThemeContext / responsive hooks
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
