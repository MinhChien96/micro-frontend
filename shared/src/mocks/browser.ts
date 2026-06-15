import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// MSW worker cho browser dev — opt-in qua MODERN_MSW=true (mặc định tắt để
// không can thiệp SSR/build). Cần file public/mockServiceWorker.js:
//   pnpm dlx msw init <app>/public --save
export const worker = setupWorker(...handlers);

export async function startMockWorker(): Promise<void> {
  if (typeof window === 'undefined') return;
  // Gọi từ shell layout chỉ khi MODERN_MSW=true → start trực tiếp (không re-check
  // process.env vì `process` không tồn tại ở browser khi var chưa inline).
  await worker.start({ onUnhandledRequest: 'bypass' });
}
