import { chromium } from 'playwright-core';

const errors = [];
const log = (...a) => console.log('•', ...a);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 250)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 250)));

// 1. Landing public SSR + hydrate
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
log('landing:', await page.locator('h1').first().textContent());

// 2. Vào /login — form remote đã SSR, hydrate xong thì điền được
await page.click('a[href="/login"]');
await page.waitForSelector('input', { timeout: 20000 });
log('login form (remote mfe_auth) OK');

// 3. Đăng nhập
const inputs = await page.$$('input');
await inputs[0].fill('0021001');
await inputs[1].fill('123456');
await page.click('button[type="submit"]');
await page.waitForURL('**/accounts', { timeout: 20000 });
log('login → /accounts OK');

// 4. AccountList → detail (splat route)
const link = await page.waitForSelector('a[href*="/accounts/"]', { timeout: 15000 });
await link.click();
await page.waitForURL('**/accounts/**', { timeout: 15000 });
log('account detail OK:', page.url());

// 5. Chuyển tiền — eventBus prefill + toast singleton
await page.click('a[href*="/transfer"]');
await page.waitForTimeout(3000);
log('transfer route OK');

// 6. Các MFE còn lại
for (const path of ['/cards', '/loans', '/profile']) {
  await page.click(`a[href*="${path}"]`);
  await page.waitForTimeout(2500);
  log(`${path} OK`);
}

// 7. Hard reload trang protected khi ĐÃ đăng nhập (SSR skeleton → hydrate content)
await page.goto('http://localhost:3000/accounts', { waitUntil: 'networkidle' });
await page.waitForSelector('a[href*="/accounts/"]', { timeout: 15000 });
log('hard reload /accounts (authed) → content hydrate OK');

// 8. Logout
await page.click('button:has-text("Đăng xuất")');
await page.waitForURL('**/login', { timeout: 15000 });
log('logout → /login OK');

await browser.close();

const fatal = errors.filter((e) =>
  /invalid hook call|Minified React error|Hydration failed|PAGEERROR|ChunkLoadError/i.test(e),
);
console.log('\nConsole errors:', errors.length ? '\n  ' + errors.join('\n  ') : '(none)');
if (fatal.length) { console.log('\n❌ FATAL:\n' + fatal.join('\n')); process.exit(1); }
console.log('\n✅ SSR E2E PASS');
