# Micro-Frontend Base Template — Modern.js + Runtime Module Federation

> **Template chuẩn production cho micro-frontend**, port kiến trúc từ một hệ
> thống Internet Banking đang chạy thật: shell + 6 remotes trên **Modern.js
> (ByteDance) + Rspack**, Module Federation 2.0 **đăng ký động lúc runtime**
> (deploy remote KHÔNG rebuild shell), env đa môi trường + **mixed mode**
> (1 MFE local + phần còn lại trên SIT/UAT), global store singleton (zustand),
> tầng axios + refresh-token queue, phân quyền **P/S/F entitled-actions**,
> i18n đa instance, MSW làm mock backend, TypeScript strict, generator
> `pnpm gen:mfe`, deploy static nginx/S3.

> 🧩 **Đây là template** — domain banking (accounts/transfer/cards/loans/
> profile/auth) chỉ là **example**. Đổi brand ở `@app/common/brand`, scope
> `@app/*` → `@<org>/*`, thay/thêm MFE bằng `pnpm gen:mfe`.
>
> 🔎 Cần **SSR/SEO**? Bản federated-SSR của template nằm ở branch
> [`feat/modernjs-ssg-mfe`](../../tree/feat/modernjs-ssg-mfe).

**Chạy thử trong 2 phút:**

```bash
pnpm install && pnpm dev     # menu chọn môi trường + remote → http://localhost:3000
# Đăng nhập: CIF 0021001 · Mật khẩu 123456 · OTP 123456
# Chọn role CUSTOMER / PREMIUM / BUSINESS để thấy phân quyền P/S/F hoạt động
```

---

## Mục lục

1. [Bắt đầu nhanh](#1-bắt-đầu-nhanh)
2. [Bức tranh tổng thể](#2-bức-tranh-tổng-thể)
3. [Vòng đời khởi động](#3-vòng-đời-khởi-động)
4. [Module Federation — build-time vs runtime](#4-module-federation)
5. [Routing — 2 pattern nhúng remote](#5-routing)
6. [Env đa môi trường & mixed mode](#6-env-đa-môi-trường--mixed-mode)
7. [Global store (zustand singleton)](#7-global-store)
8. [Tầng API + mock backend](#8-tầng-api)
9. [Xác thực & phân quyền P/S/F](#9-xác-thực--phân-quyền)
10. [i18n đa instance](#10-i18n)
11. [Giải phẫu một remote](#11-giải-phẫu-một-remote)
12. [Build & Deploy (anti-stale)](#12-build--deploy)
13. [Luồng làm việc & thêm/xóa MFE](#13-luồng-làm-việc--thêmxóa-mfe)
14. [Quy ước đóng góp](#14-quy-ước-đóng-góp)
15. [Troubleshooting](#15-troubleshooting)
16. [Cheatsheet: muốn sửa X thì vào đâu](#16-cheatsheet)
17. [Quyết định kiến trúc (ADR tóm tắt)](#17-quyết-định-kiến-trúc)

---

## 1. Bắt đầu nhanh

Yêu cầu: Node ≥ 22 (khuyến nghị 24 — xem `.nvmrc`), pnpm ≥ 10 (`corepack enable`).

```bash
pnpm install

# Cách 1 (khuyến nghị): menu chọn môi trường + remote
pnpm dev
#   Môi trường [local/sit/uat/staging] (mặc định: local)
#   Chọn remote chạy kèm shell (Enter = tất cả):
#     1. mfe-accounts   2. mfe-auth   3. mfe-cards ...
#   → gõ "1 2" nếu chỉ làm việc với accounts + auth
#   Màn thuộc remote KHÔNG bật hiện "Tính năng tạm thời không khả dụng" —
#   app không crash (không cần bật đủ 6 remote).

# Cách 2: chạy tất cả (Playwright webServer dùng lệnh này)
pnpm start
```

Mở **http://localhost:3000** — đăng nhập demo `0021001` / `123456` / OTP
`123456`. **Backend là MSW** (mock trong browser) — không cần server nào khác.

Port map: shell `3000` · auth `3001` · accounts `3002` · transfer `3003` ·
common `3004` (demo UI kit) · profile `3005` · loans `3006` · cards `3007`.

**Chạy một remote độc lập** (không cần shell):
`pnpm --filter ./remotes/mfe-accounts start` → http://localhost:3002 (trang
standalone, phiên mock sẵn).

**Cây thư mục:**

```
common/     @app/common — thư viện dùng chung (store, apiClient, UI kit,
            permissions, i18n, mocks) — singleton qua MF share
shell/      host :3000 — sở hữu URL/route/auth/nav; remote/ = cơ chế load runtime
remotes/    6 MFE — mỗi cái mô phỏng một repo của một team, deploy độc lập
scripts/    sync-env · dev-select (menu pnpm dev) · with-env · deploy-localstack
docker/     Dockerfile (static+nginx) · nginx.conf · docker-compose.yml
plop-templates/  template generator `pnpm gen:mfe`
e2e/        Playwright smoke test
.env.example / .env.sit / .env.uat / .env.staging   env per môi trường (§6)
```

**Lệnh chính:**

| Lệnh | Việc |
|---|---|
| `pnpm dev` / `pnpm dev sit` | Menu môi trường + chọn remote (mixed mode §6.3) |
| `pnpm start` | Chạy tất cả local |
| `pnpm gen:mfe` | Sinh MFE mới + tự đăng ký (§13.3) |
| `pnpm lint` · `pnpm typecheck` · `pnpm test:coverage` | Gate PR |
| `pnpm test:e2e` | Smoke e2e (tự boot fleet; `SHELL_PORT=` nếu 3000 bận) |
| `pnpm build:sit` / `build:uat` / `build:staging` | Build tất cả theo môi trường |
| `pnpm storybook` | UI kit :6006 |
| `pnpm docker:build && pnpm docker:up` | Giả lập production (nginx per app) |

---

## 2. Bức tranh tổng thể

```
┌──────────────────────────── BROWSER ─────────────────────────────────┐
│                                                                       │
│  SHELL (:3000) — sở hữu: URL, router, auth flow, layout, navbar       │
│  ├─ routes/__public/*   (landing, login — không cần token)            │
│  ├─ routes/__private/*  (mọi màn nghiệp vụ — PrivateLayout guard)     │
│  │     Pattern A: mỗi page.tsx = wrapper gọi remote component         │
│  └─ routes/__private/cards/$  (Pattern B: giao cả nhánh cho remote)   │
│                                                                       │
│  ── ranh giới Module Federation (RUNTIME, qua mf-manifest.json) ──    │
│                                                                       │
│  REMOTES: mfe_auth │ mfe_accounts │ mfe_transfer │ mfe_cards          │
│           mfe_loans │ mfe_profile          (mỗi cái 1 "repo" độc lập) │
│     expose components qua src/components/export.remote.ts             │
│                                                                       │
│  ── tầng dùng chung (shared singleton — 1 instance cho tất cả) ──     │
│                                                                       │
│  @app/common: globalStore (zustand) │ apiClient (axios) │ i18nService │
│               UI kit │ permissions P/S/F │ eventBus │ Paths           │
│  + react, react-dom, react-router-dom, @tanstack/react-query          │
└───────────────────────────────────────────────────────────────────────┘
```

3 nguyên tắc thiết kế cốt lõi (thừa hưởng từ bank):

1. **Shell sở hữu khung, remote sở hữu ruột** — mọi URL do shell khai báo
   (trừ nhánh zone `/cards/*`); remote chỉ cung cấp component.
2. **Giao tiếp qua store singleton, không qua props phức tạp** — token, user,
   lang, apiHost… nằm trong `globalStore` share singleton qua MF — shell set
   1 lần, mọi remote đọc được ngay.
3. **Remote được load ĐỘNG lúc runtime** (`registerRemotes` + `loadRemote`) —
   deploy remote mới **không cần rebuild shell**, thường không cần cả F5.

---

## 3. Vòng đời khởi động

Trình tự khi user mở `http://localhost:3000`:

1. **HTML + SPA bootstrap** — nginx (prod) / dev server trả `index.html` (no-cache).
2. **Root layout mount** ([shell/src/routes/layout.tsx](shell/src/routes/layout.tsx)) — cây provider:
   ```
   AuthProvider (đọc user từ globalStore)
   └─ ToastProvider          ← useToast() cho mọi MFE (singleton @app/common/ui)
      └─ QueryProvider       ← MỘT QueryClient toàn hệ thống
         └─ MswGate          ← CHẶN render tới khi MSW worker sẵn sàng (dev)
            └─ <Outlet/>
   ```
   Trong `useEffect`: `initSentry()` (no-op nếu thiếu DSN) + `setApiHost(...)`
   từ `MODERN_API_BASE_URL` — **mở khóa** apiClient (mọi request chờ apiHost).
3. **Store hydrate** — khi `@app/common/stores` được import lần đầu,
   `globalStore` tự nạp state từ `localStorage` (preferences) + `sessionStorage`
   (phiên) — vì vậy **F5 không mất phiên đăng nhập** (§7).
4. **Route `/`** — có user → redirect `/accounts`; chưa → landing.
5. Khi user vào một route, page wrapper gọi `lazyRemoteWithFallback(...)` →
   lúc này mới fetch `mf-manifest.json` của remote và tải chunk (§4.2).

---

## 4. Module Federation

### 4.1. Tầng build-time

**Shell** ([shell/module-federation.config.ts](shell/module-federation.config.ts)):

| Field | Giá trị | Ý nghĩa |
|---|---|---|
| `remotes` | Chỉ khai báo **khi dev** (`NODE_ENV=development`) | Prod build = `{}` — remote đăng ký **động lúc runtime**. Dev khai tĩnh để MF plugin init share scope + HMR |
| `runtimePlugins` | `error-handling-plugin` (chỉ dev) | Dev không cần bật đủ remote (§4.3) |
| `shared` | react, react-dom, react-router-dom, `@app/common/{ui,stores,eventBus}`, react-query | Tất cả singleton — xem "quy tắc sắt" bên dưới |

**Nguồn sự thật URL manifest**: [shell/remote-urls.ts](shell/remote-urls.ts) —
map `mfe_x → port dev`, build URL theo ưu tiên
`REMOTE_HOST_MFE_X` → `REMOTE_BASE` (CDN) → `localhost:<port>`.
Dùng bởi CẢ MF config (dev) lẫn `source.define` (inline cho runtime).

**Remote** (vd [remotes/mfe-accounts/module-federation.config.ts](remotes/mfe-accounts/module-federation.config.ts)):

- `name: 'mfe_accounts'` — bắt buộc trùng key shell dùng khi `loadRemote('mfe_accounts/...')`.
- `exposes` **sinh tự động** bởi `generateExposes()`: đọc
  `src/components/export.remote.ts` bằng regex — mỗi dòng `import X from './x'`
  thành expose `"./X"`. **Quy ước quan trọng nhất**: expose component mới =
  thêm 1 dòng import.
- `getPublicPath` + `output.assetPrefix` = **URL TUYỆT ĐỐI** của remote, resolve
  bởi `public-path.ts` (§6.2) — thiếu nó, browser resolve
  `remoteEntry.js`/chunks theo origin của SHELL → 404.

**Quy tắc sắt về share scope**: mọi module có **state module-level**
(store, ToastContext, eventBus `_last` cache, QueryClient context) PHẢI
`singleton: true` và key phải **khớp import specifier** (`@app/common/stores`).
Lệch version giữa shell/remote = lỗi runtime khó hiểu.

### 4.2. Tầng runtime — shell load remote thế nào

Toàn bộ nằm trong [shell/src/remote/](shell/src/remote/):

**`config.ts`** — `REMOTE_MANIFEST_URLS` được inline lúc BUILD qua
`source.define` trong `modern.config.ts` (⚠️ đổi env `REMOTE_*` phải restart
dev/rebuild). Đọc trong try/catch: khi biến chưa set, `process` không tồn tại
ở browser.

**`load.tsx` — `lazyRemoteWithFallback(remote, exposeKey, {fallback})`** —
trái tim của MFE, xử lý 3 vấn đề thực tế:

```
React.lazy(async () => {
  1. registerRemotes([{name, entry: manifestUrl + '?t=' + Date.now()}], {force: true})
     → mỗi lần load LUÔN đăng ký lại remote với manifest mới nhất
     → '?t=' bypass cache browser/CDN; force ghi đè registration cũ
     → hệ quả: remote vừa deploy xong, user điều hướng là dùng bản mới,
       KHÔNG cần rebuild shell
  2. mod = await loadRemote('mfe_accounts/AccountList') → unwrap default
  3. Lỗi (chunk 404 do deploy đổi hash, manifest chết...):
     → tryForceReload(): reload trang đúng 1 lần (sessionStorage đánh dấu,
       chống loop 30s; dev không reload)
     → Reload rồi vẫn lỗi → render <RemoteUnavailable/> (@app/common/ui)
})
```

Kèm `prefetchRemote(remote, expose)` — Nav gọi khi hover link.

### 4.3. `error-handling-plugin.ts` (chỉ dev)

MF runtime plugin hook `errorLoadRemote`: manifest fetch fail (`afterResolve`)
→ trả manifest fallback rỗng; module load fail (`onLoad`) → `undefined` để
load.tsx render fallback. Nhờ nó, **dev không cần bật đủ 6 remote** —
`pnpm dev` chọn 1-2 cái là làm việc được.

---

## 5. Routing

### 5.1. Quy ước file-based routing của Modern.js

| File/thư mục | Ý nghĩa |
|---|---|
| `layout.tsx` | Layout bọc route con cùng cấp (render `<Outlet/>`) |
| `page.tsx` | Component của chính path đó |
| `$.tsx` | **Catch-all (splat)** — khớp mọi path còn lại |
| `[id]/` | Dynamic param → `useParams().id` |
| `__tên/` | **Pathless group** — chung layout, KHÔNG thêm segment URL |

Route tree của shell:

```
/                    __public/page.tsx      → landing; đã login → /accounts
/login               __public/login/        → remote mfe_auth (state machine OTP)
/accounts            __private/accounts/page.tsx            → AccountList    (Pattern A)
/accounts/:id        __private/accounts/[id]/page.tsx       → AccountDetail  (Pattern A)
/accounts/:id/transactions  __private/accounts/[id]/transactions/ → TransactionList
/cards/*             __private/cards/$.tsx  → CardsRoutes — remote TỰ QUẢN   (Pattern B)
/transfer/* /loans/* /profile/*  __private/<x>/$.tsx → App splat đơn giản
/*                   $.tsx                  → 404
```

`__public/layout.tsx` = header tối giản; `__private/layout.tsx` =
[PrivateLayout](shell/src/components/PrivateLayout.tsx): guard `!user → /login`
(kèm `from` để quay lại), Nav, AutoSignOut, consume `navigateLink`.

### 5.2. Hai pattern nhúng remote (học từ bank)

**Pattern A — shell giữ từng route, remote cấp component** (95% màn của bank; exemplar: mfe-accounts):

```tsx
// shell/src/routes/__private/accounts/[id]/page.tsx
export default function AccountDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  return (
    <RemoteErrorBoundary remote="mfe_accounts/AccountDetail">
      <AccountDetail accountId={id} navigator={navigate} />
    </RemoteErrorBoundary>
  );
}
```

Quy ước: remote **không tự import router runtime** (chỉ type
`NavigateFunction`), nhận `navigator` + params qua props. Ưu điểm: URL do
shell kiểm soát tập trung, remote thuần túy là component.

**Pattern B — remote sở hữu cả nhánh router** (bank: card-zone; exemplar: mfe-cards):

```tsx
// shell/src/routes/__private/cards/$.tsx
import * as MRouter from '@modern-js/runtime/router';
<CardsRoutes {...MRouter} />   // truyền NGUYÊN MODULE router của shell
```

Phía remote ([CardsRoutes.tsx](remotes/mfe-cards/src/components/CardsRoutes.tsx))
nhận `{Routes, Route, Link, useNavigate, useParams}` từ props, tự dựng cây
route con, lưu vào `CardsRouteContext` cho component con dùng
(`useCardsRouter()`), và `syncNavigateFunction` cho code ngoài React tree.
Ưu điểm: **thêm màn trong zone không đụng shell** — hợp với domain lớn có
team riêng.

**Splat đơn giản** (transfer/loans/profile): remote render `<Routes>` bằng
react-router-dom import trực tiếp — hoạt động nhờ `react-router-dom` là
shared singleton. Là dạng rút gọn của Pattern B; khi cần chặt chẽ, nâng lên
Pattern B chuẩn như cards.

### 5.3. Điều hướng "ngược" từ remote/common về shell

Component không có `navigator` prop (code trong common, service...) muốn
chuyển trang: `setNavigateLink({ to, data })` vào globalStore →
`PrivateLayout` subscribe, thấy link thì `navigate(to, {state})` rồi xóa.
Đây là "event bus điều hướng" của hệ thống (bank pattern).

### 5.4. Menu điều hướng

Khai báo tĩnh tại [shell/src/constants/menu.ts](shell/src/constants/menu.ts)
(`NavItem {to, labelKey|label, tag, prefetch}`). Nav render từ đây — thêm màn
mới = thêm 1 NavItem.

---

## 6. Env đa môi trường & mixed mode

### 6.1. Bản đồ file (bank format — chia SECTION per module)

| File | Commit? | Vai trò |
|---|---|---|
| `.env.example` | ✅ | Template local + tài liệu mọi biến |
| `.env.sit` / `.env.uat` / `.env.staging` | ✅ (domain placeholder) | Config per môi trường — thay domain thật của công ty vào |
| `.env.local` (root) | ❌ | Giá trị local cá nhân (tự tạo từ example) |
| `<module>/.env.local` | ❌ | Sinh bởi `pnpm sync-env` — file Modern.js của app thực sự đọc khi chạy lẻ |

Format section (KHÔNG xóa marker):

```env
# global
MODERN_API_BASE_URL=https://api.sit.company.com/gateway
MODERN_MSW=false
# end global

# mfe-accounts
REMOTE_HOST_MFE_ACCOUNTS=https://mfe-accounts.sit.company.com
REMOTE_PORT_MFE_ACCOUNTS=
REMOTE_BASE_PATH_MFE_ACCOUNTS=
# end mfe-accounts
```

### 6.2. Đường đi của một biến env

```
.env.<env> (root, chia section)
   │  dev:      pnpm dev <env>   → dev-select nạp vào process env lệnh con
   │  build:    node scripts/with-env.mjs <env> pnpm --filter ... build
   │  ghim hẳn: pnpm sync-env .env.sit [--force] → <module>/.env.local
   ▼
modern.config.ts đọc process.env lúc START DEV/BUILD:
   ├─ shell: source.define    ← REMOTE_* → inline REMOTE_MANIFEST_URLS
   ├─ remote: public-path.ts  ← assetPrefix + getPublicPath TUYỆT ĐỐI, ưu tiên:
   │      1. PUBLIC_URL (docker/CI build-arg per app)
   │      2. REMOTE_HOST_MFE_<SELF>[+PORT][+BASE_PATH]  (env per môi trường)
   │      3. http://localhost:<port dev>/
   └─ MODERN_* → inline literal vào browser bundle
```

⚠️ **Mọi biến env là build-time** — đổi env phải restart dev/rebuild.

⚠️ **Gotcha `process is not defined`**: Modern.js chỉ inline `MODERN_*` khi
biến ĐƯỢC set; khi không, biểu thức giữ nguyên literal → `process` không tồn
tại ở browser. Luôn bọc try/catch khi đọc (xem `shell/src/routes/layout.tsx`).

### 6.3. Mixed mode — 1 MFE local + phần còn lại trên SIT/UAT

Đây là workflow chính khi làm dự án thật (cải tiến so với bank — bank phải
sửa tay section env):

```bash
pnpm dev sit          # hỏi chọn remote nào chạy LOCAL
pnpm dev sit 1        # chạy mfe-accounts local, KHÔNG hỏi
pnpm dev:uat          # tương tự với UAT
```

Cơ chế ([scripts/dev-select.mjs](scripts/dev-select.mjs)): nạp `.env.sit` vào
process env của lệnh con, rồi **xóa `REMOTE_HOST/PORT/BASE_PATH_MFE_<X>` của
remote được chọn** → shell + chính remote đó fallback `localhost:<port>`:

- Remote được chọn: chạy `modern dev` local, có HMR — code sửa thấy ngay.
- Các remote còn lại: shell load manifest từ domain SIT.
- `MODERN_API_BASE_URL` trỏ gateway SIT → gọi API thật (MSW tự tắt — §8.4).

MSW theo môi trường: `MODERN_MSW=true` luôn bật / `false` luôn tắt / không
set → chỉ bật khi dev VÀ chưa trỏ gateway.

### 6.4. Build/deploy per môi trường

```bash
pnpm build:sit                                              # tất cả
node scripts/with-env.mjs sit pnpm --filter ./remotes/mfe-accounts build   # 1 app
```

`with-env.mjs` = thay `dotenvx` của bank: nạp `.env.<env>` rồi spawn lệnh
(biến shell cha thắng — cho phép override tay). Docker/CI vẫn dùng build-arg
`PUBLIC_URL` per app như cũ (ưu tiên 1).

### 6.5. Biến chính

| Biến | Ý nghĩa |
|---|---|
| `MODERN_API_BASE_URL` | Base URL API gateway. TRỐNG = same-origin → MSW mock |
| `MODERN_MSW` | `true`/`false` ép bật/tắt MSW (xem §6.3) |
| `REMOTE_HOST/PORT/BASE_PATH_MFE_X` | URL của remote X per môi trường (shell build manifest URL; chính remote X build publicPath) |
| `REMOTE_BASE` | (shell) base CDN chung — thay cho từng REMOTE_HOST |
| `PUBLIC_URL` | (docker/CI) URL static assets per app — ưu tiên cao nhất |
| `SHELL_PORT` | Port shell (ưu tiên hơn `PORT` — PORT dính mọi app khi spawn parallel) |

---

## 7. Global store

File lõi: [common/src/stores/global.store.ts](common/src/stores/global.store.ts)
(zustand vanilla — bank dùng effector, semantics giữ nguyên).

### 7.1. Singleton "3 lớp"

1. `@app/common/stores` đánh dấu shared singleton trong MF config.
2. Phòng khi vẫn bị 2 bản (import relative nội bộ, lệch version):
   `getOrCreateSingleton('__APP_GLOBAL_STORE__', factory)` cache instance trên
   **globalThis** — bản nạp sau tái dùng store của bản trước.
3. React đọc qua `useGlobalStore(selector)` (useSyncExternalStore — không cần
   Provider).

### 7.2. Nội dung store & persistence

State: `authToken`, `refreshToken`, `user`, `deviceId` (nanoid), `lang`,
`theme`, `apiHost`, `navigateLink`, `pinnedNav`.

Persistence (debounce 150ms + flush `beforeunload`) **tách 2 nơi**:

| Storage | Chứa | Hệ quả |
|---|---|---|
| `sessionStorage.app_global` | `user`, `authToken`, `refreshToken` | Phiên **chết khi đóng tab** (F5 vẫn giữ) |
| `localStorage.app_global` | phần còn lại (trừ `navigateLink`, `apiHost`) | lang/theme/deviceId giữ vĩnh viễn |

`clearAuthState()` (logout/401) xóa phiên nhưng **giữ preferences**.

### 7.3. Cách dùng

- Đổi state: qua actions export sẵn (`setAuthToken`, `setGlobalUser`,
  `setLang`, `batchUpdate`…).
- Đọc trong React: `useGlobalStore((s) => s.user)`; ngoài React:
  `globalStore.getState()`.
- `@app/common/auth` là facade mỏng giữ API cũ (`getUser/setToken/clearAuth`).
- State riêng của remote: tự quản trong remote — KHÔNG nhét vào global store.

---

## 8. Tầng API

File: [common/src/services/api.ts](common/src/services/api.ts) — export
`apiGet/apiPost/apiPut/apiDelete` dùng chung toàn hệ thống (shell + mọi remote
đi qua đúng **một** axios instance).

### 8.1. Request interceptor (theo thứ tự)

1. **Prefix `[public]`** (login, refresh-token — xem
   `common/src/constants/endpoints.ts`): bỏ prefix, **không** chờ/gắn token.
2. **`waitForApiHost()`**: chờ `apiHost` được set trong store (shell set lúc
   boot) rồi mới gán `baseURL` — giải quyết race "remote gọi API trước khi
   shell kịp cấu hình".
3. **`waitForAuthToken()`**: URL private chờ token xuất hiện (subscribe store),
   quá **30s** → `handleLogout()`.
4. Headers tự gắn: `Authorization: Bearer`, `Accept-Language`, `X-Device-Id`.
5. Nếu đang refresh token: request private mới bị **xếp hàng**
   (`pendingRequestsQueue`) chờ token mới.

### 8.2. Response interceptor

- **Unwrap envelope**: body dạng `{data, message, status}` → trả thẳng `data`.
  (Mock backend MSW trả đúng format này.)
- **Chuẩn hóa lỗi** thành `APIError {message, status, code, details, traceId}`.

### 8.3. Máy trạng thái refresh token (401)

```
401 (đang ở private path, không phải chính API refresh)
 ├─ retryNumber++ > MAX_REFRESH_RETRY(3)? → handleLogout
 ├─ đang refresh rồi? → vào failedRequestQueue, chờ token mới rồi tự retry
 └─ chưa: isRefreshingToken=true
     → POST /auth/refresh-token (skipRefresh, timeout 10s) {refreshToken, deviceId}
     ├─ OK: setAuthToken mới → xả cả 2 queue → retry request gốc
     └─ Fail: handleLogout() → clearAuthState + chờ persist + replace /login
```

### 8.4. Mock backend (MSW)

[common/src/mocks/handlers.ts](common/src/mocks/handlers.ts) là "backend"
của template: auth (login → OTP → token, refresh, guard Bearer
`access-<expiry>`), accounts + transactions (phân trang), transfers. Bật/tắt
theo §6.3; `MswGate` chặn render tới khi worker sẵn sàng. Dự án thật: trỏ
`MODERN_API_BASE_URL` sang gateway — MSW tắt, mọi `apiGet/apiPost` giữ nguyên.

---

## 9. Xác thực & phân quyền

### 9.1. Login là một state machine

`POST /api/auth/login` trả `nextStep` — UI switch-case
([Login.tsx](remotes/mfe-auth/src/components/Login.tsx)):

| nextStep | UI xử lý |
|---|---|
| `OTP` | Hiện form OTP (kèm `otpSession`) → `POST /api/auth/verify-otp` |
| `HOME` | `batchUpdate({authToken, refreshToken, user})` → navigate `from` |

Thêm bước mới (đổi mật khẩu lần đầu, kích hoạt thiết bị…) = thêm case
`nextStep`, không đổi khung.

### 9.2. Phiên

Token trong sessionStorage (§7.2). `AutoSignOutProvider`
([common/src/components/AutoSignOut.tsx](common/src/components/AutoSignOut.tsx)):
idle **5 phút** → modal đếm ngược 30s → signOut. Logout = API logout
best-effort → `clearAuth()` → `/login`.

### 9.3. Phân quyền: mô hình P/S/F (Product / Sub-product / Function)

- Backend trả `user.entitledActions: {p, s, f}[]`
  (vd `{p:'PAYMNT', s:'TRANSFER', f:'transfer:international'}`).
- Frontend định nghĩa tên dễ đọc `ActionEnum.fTransferInternational` + bảng
  `PSFMapping` ([common/src/permissions/](common/src/permissions/)) → build
  ngược `ENTITLED_ACTIONS` (throw nếu trùng key).
- `canAction(action, user?)` — dùng ở 3 nơi: menu, route, nút chức năng.
- Component: `<PermissionCheck actions={ActionEnum.fX} logic="OR|AND"
  showLocked fallback>` — reactive theo store.
- **Role chỉ là nhãn hiển thị** — quyền thật do backend quyết qua
  entitledActions (mock: [entitlements.ts](common/src/mocks/data/entitlements.ts)).
- Thêm quyền mới: thêm `ActionEnum` + 1 dòng trong `PSFMapping`; backend trả
  bộ `{p,s,f}` tương ứng.

---

## 10. i18n

Kiến trúc "**mỗi module một i18n instance, đổi ngôn ngữ đồng loạt**"
([common/src/i18n/](common/src/i18n/)):

- `i18nService` giữ `Map<tên, i18n>` (singleton globalThis). Mỗi app gọi
  `useAppTranslation('<tên>', resources)` với resources bundle trong app đó
  (shell: `src/i18n/resources.ts`; remote: tương tự, key prefix theo module).
- `changeAppLanguage(lang)` = set store.lang + `changeLanguage` **mọi
  instance** → toàn bộ shell + remotes đổi cùng lúc, không reload; lang persist
  localStorage.
- Config: fallback `vi`, supported `vi en` (thêm lang = sửa `SUPPORTED_LANGS`).

---

## 11. Giải phẫu một remote

Lấy `remotes/mfe-accounts` làm mẫu — remote là **một app Modern.js hoàn
chỉnh**, đồng thời là container MF:

```
remotes/mfe-accounts/
├── modern.config.ts            # port 3002, assetPrefix qua public-path.ts, Tailwind
├── module-federation.config.ts # name mfe_accounts, generateExposes(), getPublicPath, shared
├── public-path.ts              # URL tuyệt đối per môi trường (§6.2)
├── config/public/              # mockServiceWorker.js (chỉ app có gọi API)
└── src/
    ├── components/
    │   ├── export.remote.ts    # ★ contract công khai của remote (danh sách expose)
    │   ├── AccountList.tsx     # màn hình — nhận navigator prop (Pattern A)
    │   └── AccountsApp.tsx     # CHỈ cho standalone (tự dựng router + QueryClient)
    ├── routes/                 # ⚠️ CHỈ để chạy standalone — route thật do shell khai
    ├── api/accounts.ts         # types + fetch qua apiGet (@app/common/services)
    ├── i18n/resources.ts       # key prefix 'accounts.*'
    └── tailwind.css            # @source ../../../common/src (quét class shared)
```

Điểm cần nhớ khi làm việc trong remote:

1. Component expose theo Pattern A nhận `navigator` từ shell — **không dùng
   useNavigate của remote** cho điều hướng liên-module (hoặc dùng
   `setNavigateLink`).
2. Import từ `@app/common/*` thoải mái — chắc chắn cùng instance với shell.
3. API bọc qua `with*Service()` (`common/src/constants/endpoints.ts`) — đổi
   gateway một chỗ.
4. Chạy độc lập: `pnpm --filter ./remotes/mfe-accounts start` → `:3002` trang
   standalone (phiên mock qua `setupStandaloneSession`), manifest tại
   `/static/mf-manifest.json` cho shell tiêu thụ.

---

## 12. Build & Deploy

### 12.1. Lệnh

- `pnpm build:sit` (tất cả) hoặc
  `node scripts/with-env.mjs sit pnpm --filter ./remotes/mfe-accounts build`
  (1 app) → static vào `dist/`. **Mỗi app build & deploy độc lập** — lợi ích
  chính của MFE.
- Docker: `pnpm docker:build && pnpm docker:up` — mỗi app 1 container nginx;
  shell build `MODERN_MSW=true` (demo tự chạy).
- AWS reference: [.github/workflows/deploy-aws.yml](.github/workflows/deploy-aws.yml)
  — build per app → S3 → CloudFront (không cần server).

### 12.2. Nginx ([docker/nginx.conf](docker/nginx.conf))

| Location | Rule | Lý do |
|---|---|---|
| `/` | `try_files $uri /index.html` + **no-cache** | SPA fallback; HTML không cache để nhận bundle mới |
| `= /static/mf-manifest.json` | **no-cache + CORS** | Shell luôn đọc được manifest mới nhất sau deploy |
| `/static/` | cache 1 năm + immutable + CORS | chunk có hash trong tên |
| `= /health` | 200 "ok" | probe cho orchestrator |

### 12.3. Chuỗi chống-stale sau deploy (3 lớp)

1. Nginx/S3: manifest + html **no-cache**.
2. Client: `registerRemotes(force)` + `?t=` mỗi lần load component.
3. `lazyRemoteWithFallback`: chunk 404 (hash cũ) → auto reload trang 1 lần.

→ **Deploy remote mới: shell KHÔNG rebuild, user KHÔNG cần F5.**

---

## 13. Luồng làm việc & thêm/xóa MFE

### 13.1. Thêm màn hình vào remote CÓ SẴN (Pattern A)

1. Viết component trong `remotes/<m>/src/components/MyScreen.tsx`
   (nhận `navigator: NavigateFunction` qua props nếu cần điều hướng).
2. `export.remote.ts` — thêm `import MyScreen from './MyScreen'` + vào object
   export default → tự động expose.
3. Shell: thêm export vào `remotePages.tsx`
   (`remotePage('mfe_<m>', 'MyScreen', <skeleton/>)`) + tạo
   `shell/src/routes/__private/<path>/page.tsx`.
4. Menu? Thêm `NavItem` vào `shell/src/constants/menu.ts`.
   Quyền? Bọc `<PermissionCheck actions={ActionEnum.fX}>`.

### 13.2. Thêm màn hình vào ZONE (Pattern B — mfe-cards)

Chỉ sửa remote: thêm `<Route>` trong
`remotes/mfe-cards/src/components/CardsRoutes.tsx`. **Không đụng shell.**

### 13.3. Tạo MFE hoàn toàn mới (generator)

```bash
pnpm gen:mfe          # hỏi tương tác
pnpm exec plop mfe payments 3008 "Thanh toán"   # bypass prompt
```

Generator sinh `remotes/mfe-<name>/` đầy đủ (CSR, Tailwind, export.remote.ts,
public-path.ts, standalone page, test) và **tự đăng ký 8 điểm nối** qua anchor
`// @plop:*`:

1. `remotes/mfe-<name>/` — package (workspace glob tự nhận)
2. `shell/src/routes/__private/<name>/$.tsx` — route splat
3. `shell/remote-urls.ts` — port dev (`@plop:remote-port`)
4. `shell/src/components/remotePages.tsx` (`@plop:remote-page`)
5. `shell/src/constants/menu.ts` — NavItem (`@plop:nav-link`)
6. `package.json` — `pnpm start` (3 chỗ)
7. `docker/docker-compose.yml` (`@plop:service`)
8. `.github/workflows/deploy-aws.yml` — DEFAULT list

Sau khi gen: `pnpm install && pnpm lint:fix && pnpm dev`. Checklist tùy chọn
(generator in ra): section env vào `.env.example` + `.env.sit/...`, entry
`remotes.json`, `depends_on` shell trong compose, i18n labelKey, worker MSW
nếu gọi API.

Không dùng generator? Copy `remotes/mfe-accounts` (module mẫu đầy đủ nhất)
→ đổi tên/port → tự wire 8 điểm theo anchor.

### 13.4. Xóa một MFE

```bash
grep -rn "mfe-<name>\|mfe_<name>" --include="*.ts*" --include="*.json" --include="*.yml" . | grep -v node_modules
rm -rf remotes/mfe-<name> shell/src/routes/__private/<name>
pnpm install
```

### 13.5. Gọi API mới

1. Thêm handler mock vào `common/src/mocks/handlers.ts` (envelope `{ data }`).
2. Remote: `export const fetchX = (): Promise<X[]> => apiGet(withMyService('/x'));`
3. Dùng với react-query. apiClient tự lo token/refresh/lỗi.

### 13.6. Nối backend thật

Sửa `MODERN_API_BASE_URL` trong `.env.<env>` → `pnpm dev <env>` / `pnpm
build:<env>`. Backend cần trả envelope `{data, message?, code?}` + endpoints
auth (`/auth/login` nextStep, `/auth/refresh-token`) — hoặc sửa
`common/src/services/api.ts` + `Login.tsx` theo contract thật.

---

## 14. Quy ước đóng góp

- **Commit**: Conventional Commits (`feat:`, `fix:`, `docs:`…) — commitlint
  chặn ở `commit-msg`; Biome format ở pre-commit (Lefthook).
- **TypeScript strict** toàn bộ — không thêm `.js/.jsx` mới.
- **State/phiên**: qua `@app/common/stores` hoặc facade `@app/common/auth` —
  đừng tự đọc/ghi storage.
- **API**: mọi request qua `apiGet/apiPost` (`@app/common/services`) — đừng
  gọi fetch/axios trực tiếp. Endpoint bọc `with*Service()`.
- **Phân quyền**: check bằng `canAction`/`<PermissionCheck>` — đừng suy quyền
  từ `user.role`.
- **Routing trong remote**: Pattern A nhận `navigator` prop (không import
  router runtime); zone lấy router từ context.
- **MF singleton**: module có state module-level PHẢI có trong `shared` của
  MỌI MF config, key khớp import specifier.
- **Env browser**: biến `MODERN_*` là build-time; khi có thể KHÔNG set, đọc
  qua try/catch.
- **Styling**: Tailwind v4 — tokens `@theme` ở `common/src/styles/theme.css`,
  dark qua `[data-theme]`; mỗi app `src/tailwind.css` có `@source` quét common.
- **i18n**: chuỗi hiển thị qua `useAppTranslation`, key prefix theo module.
- **Gate PR**: `pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build`
  (CI chạy đúng các bước này; e2e nightly + thủ công, không chặn PR).

---

## 15. Troubleshooting

| Triệu chứng | Nguyên nhân / cách xử lý |
|---|---|
| Màn hình hiện "Tính năng tạm thời không khả dụng" | Remote tương ứng chưa chạy → `pnpm dev` chọn thêm nó; hoặc check `http://localhost:<port>/static/mf-manifest.json` |
| `ReferenceError: process is not defined` (browser) | Đọc `process.env.MODERN_*` khi biến chưa set — bọc try/catch (§6.2) |
| Đổi env không ăn | Env là build-time → restart/rebuild; `<module>/.env.local` có key cũ → `pnpm sync-env --force` |
| Trang tự reload 1 lần rồi vẫn lỗi | Cơ chế chống stale-chunk (1 lần/30s). Vẫn lỗi = remote thực sự chết |
| Console "Unsatisfied version ... shared" | Lệch version thư viện shared giữa shell và remote — đồng bộ package.json |
| Chunks của remote 404 theo origin shell | Thiếu publicPath tuyệt đối — check `public-path.ts` + env `REMOTE_HOST_MFE_X`/`PUBLIC_URL` (§6.2) |
| Đăng nhập xong F5 bị văng | Phiên nằm `sessionStorage.app_global` — trình duyệt chặn storage? |
| 401 liên tục / văng về login | refreshToken hết hạn (mock: access token sống 1h) — đăng nhập lại |
| Port bị chiếm | App tự nhảy port kế → lệch manifest URL. Giải phóng port; shell dùng `SHELL_PORT` |
| Mixed mode: remote local không được dùng | Check log dev-select có dòng "(LOCAL)"; env file có đúng section tên `# mfe-<x>` không |
| Test treo khi gọi api | Test cần phiên: `beforeAll(() => setupStandaloneSession())` |

---

## 16. Cheatsheet

| Muốn… | Vào đâu |
|---|---|
| Tạo MFE mới | `pnpm gen:mfe` (§13.3) |
| Thêm màn cho remote sẵn có | §13.1 (Pattern A) / §13.2 (zone) |
| Thêm/đổi API endpoint | `remotes/<m>/src/api/*.ts` bọc `with*Service`; mock → `common/src/mocks/handlers.ts` |
| Đổi API gateway / domain remote per môi trường | `.env.<env>` (đúng section) → chạy `pnpm dev <env>` / `build:<env>` |
| Thêm quyền mới | `common/src/permissions/` (ActionEnum + PSFMapping) + mock `entitlements.ts` |
| Thêm ngôn ngữ/key dịch | `<app>/src/i18n/resources.ts`; thêm lang → `SUPPORTED_LANGS` |
| Thêm state global | `common/src/stores/global.store.ts` (field + action) — cân nhắc persist (`persist()`) |
| Sửa UI kit chung | `common/src/ui/` (+ stories); tokens `common/src/styles/theme.css` |
| Debug remote không load | Network: `mf-manifest.json?t=...` → 404/CORS? console `[MF] Load failed` |
| Xem UI không backend | Dev mặc định MSW; thêm handler ở `common/src/mocks/handlers.ts` |

---

## 17. Quyết định kiến trúc

Tóm tắt các quyết định lớn (chi tiết trong git history của `docs/adr/` cũ):

| # | Quyết định | Lý do chính |
|---|---|---|
| 1 | **Modern.js + Rspack** thay Next.js/webpack | Stack MF chính chủ ByteDance, cùng stack với dự án bank production; Rspack nhanh |
| 2 | **Biome + Vitest + Lefthook + Changesets** | Một tool lint+format (Rust, nhanh); test nhẹ jsdom; hooks + versioning chuẩn |
| 3 | **`@app/common` hai vai trò** (workspace package + MF shared) | Import tự nhiên khi dev; singleton khi runtime — key shared = import specifier |
| 4 | **Scoped namespace `@app/*` + brand tập trung** | Template hóa: đổi org/brand một chỗ |
| 5 | **Health check qua nginx `/health`** | CSR static không cần server runtime — probe ở tầng nginx |
| 6 | **Tailwind v4 + Sentry browser + Storybook + MSW** | Bộ styling/observability/docs/mocking mà team thực sự dùng |
| 7 | **CSR + runtime MF theo bank** (từ SSR+static) | Deploy remote không rebuild shell = giá trị vận hành lớn nhất của MFE; app sau đăng nhập không cần SEO; hạ tầng static rẻ. Bản SSR giữ ở branch `feat/modernjs-ssg-mfe` cho dự án cần SEO. Store chọn **zustand** thay effector (phổ biến, dễ học — semantics giữ nguyên); mock bằng **MSW** thay mock-server rời |
| 8 | **Env đa môi trường namespaced + mixed mode** | Mỗi remote đọc `REMOTE_HOST_MFE_<SELF>` cho publicPath (như bank) → chạy 1 MFE local ghép SIT/UAT không sửa tay env |
