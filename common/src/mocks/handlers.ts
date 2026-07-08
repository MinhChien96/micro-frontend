import { delay, HttpResponse, http } from 'msw';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, TXN_PAGE_SIZE } from './data/accounts';
import { type MockTransferRecord, transferHistory } from './data/transfers';

// ============================================================================
// MSW = "backend" của template: dev (worker browser) + test (server node).
// Format response THEO ENVELOPE của bank: { data, message?, status? } —
// apiClient (common/services/api.ts) unwrap 'data' trước khi trả caller.
// Khi làm dự án thật: trỏ MODERN_API_BASE_URL sang gateway thật, tắt MSW.
// ============================================================================

const ok = (data: unknown) => HttpResponse.json({ data });
const err = (status: number, message: string, code?: string) =>
  HttpResponse.json({ message, code }, { status });

// ---- Auth ------------------------------------------------------------------

const ACCESS_TTL_MS = 60 * 60 * 1000; // 1h

const makeAccessToken = (): string => `access-${Date.now() + ACCESS_TTL_MS}`;
const makeRefreshToken = (): string => `refresh-${Date.now()}`;

/** Guard cho endpoint private: Bearer 'access-<expiry>' còn hạn */
function isAuthorized(request: Request): boolean {
  const auth = request.headers.get('Authorization') ?? '';
  const match = auth.match(/^Bearer access-(\d+)$/);
  return !!match && Number(match[1]) > Date.now();
}

const unauthorized = () => err(401, 'Token hết hạn hoặc không hợp lệ', 'TOKEN_EXPIRED');

export const handlers = [
  http.get('/api/ping', () => ok({ ok: true, ts: Date.now() })),

  // Đăng nhập: đúng 0021001/123456 → nextStep HOME + cặp token + user.
  // role lấy từ body (demo 3 hồ sơ khách hàng).
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { username?: string; password?: string; role?: string };
    if (body.username !== '0021001' || body.password !== '123456') {
      return err(401, 'Mã khách hàng hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
    }
    return ok({
      nextStep: 'HOME',
      accessToken: makeAccessToken(),
      refreshToken: makeRefreshToken(),
      user: {
        name: 'Nguyễn Văn Demo',
        customerId: '0021001',
        email: 'demo@example.com',
        phone: '0901 234 567',
        branch: 'Chi nhánh TP.HCM',
        role: body.role || 'CUSTOMER',
      },
    });
  }),

  // Refresh token: refreshToken hợp lệ (prefix 'refresh-') → cặp token mới
  http.post('/api/auth/refresh-token', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { refreshToken?: string; deviceId?: string };
    if (!body.refreshToken?.startsWith('refresh-')) {
      return err(401, 'Refresh token không hợp lệ', 'INVALID_REFRESH_TOKEN');
    }
    return ok({ accessToken: makeAccessToken(), refreshToken: makeRefreshToken() });
  }),

  http.post('/api/auth/logout', () => ok({ ok: true })),

  // ---- Accounts (private) ----------------------------------------------------

  http.get('/api/accounts', async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    await delay(400);
    return ok(MOCK_ACCOUNTS);
  }),

  http.get('/api/accounts/:id', async ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    await delay(200);
    const account = MOCK_ACCOUNTS.find((a) => a.id === params.id);
    return account ? ok(account) : err(404, `Không tìm thấy tài khoản ${params.id}`, 'NOT_FOUND');
  }),

  http.get('/api/accounts/:id/transactions', async ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    await delay(200);
    return ok(MOCK_TRANSACTIONS[String(params.id)] ?? []);
  }),

  // Phân trang cho useInfiniteQuery: ?page=0,1,2...
  http.get('/api/accounts/:id/transactions/paged', async ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    await delay(300);
    const page = Number(new URL(request.url).searchParams.get('page') ?? 0);
    const all = MOCK_TRANSACTIONS[String(params.id)] ?? [];
    return ok({
      items: all.slice(page * TXN_PAGE_SIZE, (page + 1) * TXN_PAGE_SIZE),
      nextPage: (page + 1) * TXN_PAGE_SIZE < all.length ? page + 1 : undefined,
      total: all.length,
    });
  }),

  // ---- Transfers (private) ---------------------------------------------------

  http.get('/api/transfers', async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    await delay(400);
    return ok([...transferHistory]);
  }),

  http.post('/api/transfers', async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    await delay(1200);
    // 10% thất bại — demo optimistic update rollback phía mfe-transfer
    if (Math.random() < 0.1) return err(502, 'Lỗi kết nối ngân hàng đích', 'BANK_GATEWAY_ERROR');
    const form = (await request.json()) as {
      recipientName: string;
      recipientBank: string;
      recipientAccount: string;
      amount: string;
      note?: string;
    };
    const record: MockTransferRecord = {
      id: `h${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      name: form.recipientName,
      bank: form.recipientBank,
      account: form.recipientAccount,
      amount: Number(form.amount),
      status: 'success',
      note: form.note || '',
    };
    transferHistory.unshift(record);
    return ok(record);
  }),
];
