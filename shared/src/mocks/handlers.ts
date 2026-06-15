import { HttpResponse, http } from 'msw';

// MSW handlers — mock API layer dùng chung cho dev (worker) + test (node).
// Đây là REFERENCE; thay bằng endpoint thật của bạn. Hiện api/*.ts của MFE
// trả mock trực tiếp (không qua HTTP) — khi chuyển sang fetch('/api/...') thì
// MSW trở thành "backend" dev (bật bằng MODERN_MSW=true).
export const handlers = [
  http.get('/api/ping', () => HttpResponse.json({ ok: true, ts: Date.now() })),

  // Ví dụ domain (banking): khi mfe-accounts chuyển api sang fetch, MSW phục vụ
  http.get('/api/accounts', () =>
    HttpResponse.json([
      { id: 'TK001', name: 'Tài khoản thanh toán', balance: 15_420_000, currency: 'VND' },
    ]),
  ),
];
