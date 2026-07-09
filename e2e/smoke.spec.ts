import { expect, test } from '@playwright/test';

// Smoke E2E (CSR + runtime MF): landing → login (remote, OTP state machine)
// → accounts → detail (splat) → các MFE → hard reload authed → logout.
// Assert không có lỗi console nghiêm trọng (invalid hook call / chunk load).
test('mfe runtime smoke flow', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 250));
  });
  page.on('pageerror', (e) => errors.push(`PAGEERROR: ${String(e).slice(0, 250)}`));

  // 1. Landing public (SSR)
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('h1').first()).toContainText('Ngân hàng số');

  // 2. Login — form từ remote mfe_auth (load động runtime)
  await page.click('a[href="/login"]');
  await page.waitForSelector('input', { timeout: 30_000 });

  // 3. Đăng nhập: credentials → OTP (state machine theo nextStep)
  const inputs = await page.$$('input');
  await inputs[0].fill('0021001');
  await inputs[1].fill('123456');
  await page.click('button[type="submit"]');
  await page.waitForSelector('#otp-input', { timeout: 30_000 });
  await page.fill('#otp-input', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/accounts', { timeout: 30_000 });

  // 4. AccountList (data qua MSW backend) → detail (Pattern A: Card onClick → navigator)
  await page.waitForSelector('text=Tài khoản thanh toán', { timeout: 15_000 });
  await page.click('text=Tài khoản thanh toán');
  await page.waitForURL('**/accounts/**', { timeout: 15_000 });

  // 5. Các MFE còn lại (eventBus/toast singleton hoạt động)
  for (const path of ['/transfer', '/cards', '/loans', '/profile']) {
    await page.click(`a[href*="${path}"]`);
    await page.waitForTimeout(2500);
  }

  // 6. Hard reload trang protected khi đã đăng nhập (phiên sessionStorage)
  await page.goto('/accounts', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Tài khoản thanh toán', { timeout: 15_000 });

  // 7. Logout → về login, phiên bị xóa
  await page.click('button:has-text("Đăng xuất")');
  await page.waitForURL('**/login', { timeout: 15_000 });

  const fatal = errors.filter((e) =>
    /invalid hook call|Minified React error|Hydration failed|before it finished hydrating|PAGEERROR|ChunkLoadError/i.test(
      e,
    ),
  );
  expect(fatal, `Lỗi console nghiêm trọng:\n${fatal.join('\n')}`).toHaveLength(0);
});
