import { setupStandaloneSession } from '@app/common/mocks/standalone';
import { beforeAll, describe, expect, it } from 'vitest';
import { fetchAccount, fetchAccounts, fetchTransactionPage } from './accounts';

// api đi qua apiClient thật (chờ apiHost + token) → cấp phiên standalone
// trước; MSW node server (vitest.setup.ts) đóng vai backend.
beforeAll(() => {
  setupStandaloneSession();
});

describe('accounts api (mock)', () => {
  it('fetchAccounts trả danh sách tài khoản', async () => {
    const accounts = await fetchAccounts();
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0]).toHaveProperty('balance');
  });

  it('fetchAccount ném lỗi khi id không tồn tại', async () => {
    await expect(fetchAccount('KHONG_TON_TAI')).rejects.toThrow();
  });

  it('fetchTransactionPage phân trang đúng (nextPage + total)', async () => {
    const page0 = await fetchTransactionPage({ accountId: 'TK001', pageParam: 0 });
    expect(page0.items.length).toBe(20);
    expect(page0.nextPage).toBe(1);
    expect(page0.total).toBeGreaterThan(20);
  });

  it('trang cuối có nextPage = undefined', async () => {
    const last = await fetchTransactionPage({ accountId: 'TK002', pageParam: 0 });
    expect(last.nextPage).toBeUndefined();
  });
});
