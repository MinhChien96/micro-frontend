import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// MSW server cho Node/Vitest (xem vitest.setup.ts: listen/reset/close).
export const server = setupServer(...handlers);
