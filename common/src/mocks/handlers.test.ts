import { describe, expect, it } from 'vitest';
import { handlers } from './handlers';

// Kiểm mock backend khai báo đủ endpoint contract (ổn định mọi Node version).
// Live interception (server.listen + fetch) hoạt động ở runtime/dev + CI Node 24;
// không assert ở đây vì @mswjs/interceptors chưa patch undici của Node 25.
describe('MSW handlers', () => {
  const paths = handlers.map((h) => (h.info as { path: string }).path);

  it('khai báo endpoint auth (login/otp/refresh/logout)', () => {
    expect(paths).toContain('/api/auth/login');
    expect(paths).toContain('/api/auth/verify-otp');
    expect(paths).toContain('/api/auth/refresh-token');
    expect(paths).toContain('/api/auth/logout');
  });

  it('khai báo endpoint accounts + transactions', () => {
    expect(paths).toContain('/api/accounts');
    expect(paths).toContain('/api/accounts/:id');
    expect(paths).toContain('/api/accounts/:id/transactions');
    expect(paths).toContain('/api/accounts/:id/transactions/paged');
  });

  it('khai báo endpoint transfers', () => {
    expect(paths).toContain('/api/transfers');
  });
});
