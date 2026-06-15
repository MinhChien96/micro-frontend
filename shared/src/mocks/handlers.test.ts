import { describe, expect, it } from 'vitest';
import { handlers } from './handlers';

// Kiểm mock layer được khai báo đúng (ổn định mọi Node version).
// Live interception (server.listen + fetch) hoạt động ở runtime/dev + CI Node 24;
// không assert ở đây vì @mswjs/interceptors chưa patch undici của Node 25.
describe('MSW handlers', () => {
  it('khai báo các endpoint reference', () => {
    const paths = handlers.map((h) => (h.info as { path: string }).path);
    expect(paths).toContain('/api/ping');
    expect(paths).toContain('/api/accounts');
  });
});
