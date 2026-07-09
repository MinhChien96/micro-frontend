# Kiến trúc chi tiết — Template Micro-Frontend (CSR + Runtime Module Federation)

> Tài liệu "mổ xẻ" cơ chế bên trong của template, viết theo cấu trúc tài liệu của
> dự án bank production mà template này port kiến trúc. Đọc kèm
> [getting-started.md](./getting-started.md) (cách chạy cho người mới).
> Bản **SSR** của template nằm ở branch `feat/modernjs-ssg-mfe` (dùng khi dự án cần SEO).

---

## Mục lục

1. [Bức tranh tổng thể](#1-bức-tranh-tổng-thể)
2. [Vòng đời khởi động (boot sequence)](#2-vòng-đời-khởi-động)
3. [Module Federation — build-time vs runtime](#3-module-federation)
4. [Routing — 2 pattern nhúng remote](#4-routing)
5. [Đường đi của biến env](#5-env)
6. [Global store (zustand singleton)](#6-global-store)
7. [Tầng API (axios + refresh token)](#7-tầng-api)
8. [Xác thực & phân quyền P/S/F](#8-xác-thực--phân-quyền)
9. [i18n đa instance](#9-i18n)
10. [Giải phẫu một remote](#10-giải-phẫu-một-remote)
11. [Build & Deploy (anti-stale)](#11-build--deploy)
12. [Cheatsheet: muốn sửa X thì vào đâu](#12-cheatsheet)

---

## 1. Bức tranh tổng thể

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
   lang, apiHost… nằm trong `globalStore` (zustand) share singleton qua MF —
   shell set 1 lần, mọi remote đọc được ngay.
3. **Remote được load ĐỘNG lúc runtime** (`registerRemotes` + `loadRemote`) —
   deploy remote mới **không cần rebuild shell**, thường không cần cả F5.

---

## 2. Vòng đời khởi động

Trình tự khi user mở `http://localhost:3000`:

1. **HTML + SPA bootstrap** — nginx (prod) / dev server trả `index.html` (no-cache).
2. **Root layout mount** ([shell/src/routes/layout.tsx](../shell/src/routes/layout.tsx)) — cây provider:
   ```
   AuthProvider (đọc user từ globalStore)
   └─ ToastProvider          ← useToast() cho mọi MFE (singleton @app/common/ui)
      └─ QueryProvider       ← MỘT QueryClient toàn hệ thống
         └─ MswGate          ← CHẶN render tới khi MSW worker sẵn sàng (dev)
            └─ <Outlet/>
   ```
   Trong `useEffect`: `initSentry()` (no-op nếu thiếu DSN) + `setApiHost(...)`
   từ `MODERN_API_BASE_URL` — **mở khóa** apiClient (mọi request chờ apiHost).
3. **Store hydrate** — khi module `@app/common/stores` được import lần đầu,
   `globalStore` tự nạp state từ `localStorage` (preferences) + `sessionStorage`
   (phiên) — vì vậy **F5 không mất phiên đăng nhập** (xem §6).
4. **Route `/`** — có user → redirect `/accounts`; chưa → landing.
5. Khi user vào một route, page wrapper gọi `lazyRemoteWithFallback(...)` →
   lúc này mới fetch `mf-manifest.json` của remote và tải chunk (xem §3.2).

---

## 3. Module Federation

### 3.1. Tầng build-time

**Shell** ([shell/module-federation.config.ts](../shell/module-federation.config.ts)):

| Field | Giá trị | Ý nghĩa |
|---|---|---|
| `remotes` | Chỉ khai báo **khi dev** (`NODE_ENV=development`) | Prod build = `{}` — remote đăng ký **động lúc runtime**. Dev khai tĩnh để MF plugin init share scope + HMR |
| `runtimePlugins` | `error-handling-plugin` (chỉ dev) | Dev không cần bật đủ remote (xem §3.3) |
| `shared` | react, react-dom, react-router-dom, `@app/common/{ui,stores,eventBus}`, react-query | Tất cả singleton — xem "quy tắc sắt" bên dưới |

**Nguồn sự thật URL manifest**: [shell/remote-urls.ts](../shell/remote-urls.ts) —
map `mfe_x → port dev`, build URL theo ưu tiên
`REMOTE_HOST_MFE_X` → `REMOTE_BASE` (CDN) → `localhost:<port>`.
Dùng bởi CẢ MF config (dev) lẫn `source.define` (inline cho runtime).

**Remote** (vd [remotes/mfe-accounts/module-federation.config.ts](../remotes/mfe-accounts/module-federation.config.ts)):

- `name: 'mfe_accounts'` — bắt buộc trùng key shell dùng khi `loadRemote('mfe_accounts/...')`.
- `exposes` **sinh tự động** bởi `generateExposes()`: đọc
  `src/components/export.remote.ts` bằng regex — mỗi dòng `import X from './x'`
  thành expose `"./X"`. **Quy ước quan trọng nhất**: expose component mới =
  thêm 1 dòng import.
- `getPublicPath` + `output.assetPrefix` = **URL TUYỆT ĐỐI** của remote
  (fallback `http://localhost:<port>/`) — thiếu nó, browser resolve
  `remoteEntry.js`/chunks theo origin của SHELL → 404.

**Quy tắc sắt về share scope**: mọi module có **state module-level**
(store, ToastContext, eventBus `_last` cache, QueryClient context) PHẢI
`singleton: true` và key phải **khớp import specifier** (`@app/common/stores`).
Lệch version giữa shell/remote = lỗi runtime khó hiểu.

### 3.2. Tầng runtime — shell load remote thế nào

Toàn bộ nằm trong [shell/src/remote/](../shell/src/remote/):

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

### 3.3. `error-handling-plugin.ts` (chỉ dev)

MF runtime plugin hook `errorLoadRemote`: manifest fetch fail (`afterResolve`)
→ trả manifest fallback rỗng; module load fail (`onLoad`) → `undefined` để
load.tsx render fallback. Nhờ nó, **dev không cần bật đủ 6 remote** —
`pnpm dev` chọn 1-2 cái là làm việc được, màn thiếu remote chỉ hiện fallback.

---

## 4. Routing

### 4.1. Quy ước file-based routing của Modern.js

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
[PrivateLayout](../shell/src/components/PrivateLayout.tsx): guard `!user → /login`
(kèm `from` để quay lại), Nav, AutoSignOut, consume `navigateLink`.

### 4.2. Hai pattern nhúng remote (học từ bank)

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

Phía remote ([CardsRoutes.tsx](../remotes/mfe-cards/src/components/CardsRoutes.tsx))
nhận `{Routes, Route, Link, useNavigate, useParams}` từ props, tự dựng cây
route con, lưu vào `CardsRouteContext` cho component con dùng
(`useCardsRouter()`), và `syncNavigateFunction` cho code ngoài React tree.
Ưu điểm: **thêm màn trong zone không đụng shell** — hợp với domain lớn có
team riêng.

**Splat đơn giản** (transfer/loans/profile): remote render `<Routes>` bằng
react-router-dom import trực tiếp — hoạt động nhờ `react-router-dom` là
shared singleton (cùng router context với shell). Là dạng rút gọn của Pattern
B; khi cần chặt chẽ (không tin singleton), nâng lên Pattern B chuẩn như cards.

### 4.3. Điều hướng "ngược" từ remote/common về shell

Component không có `navigator` prop (code trong common, service...) muốn
chuyển trang: `setNavigateLink({ to, data })` vào globalStore →
`PrivateLayout` subscribe, thấy link thì `navigate(to, {state})` rồi xóa.
Đây là "event bus điều hướng" của hệ thống (bank pattern).

### 4.4. Menu điều hướng

Khai báo tĩnh tại [shell/src/constants/menu.ts](../shell/src/constants/menu.ts)
(`NavItem {to, labelKey|label, tag, prefetch}`). Nav render từ đây — thêm màn
mới = thêm 1 NavItem. `labelKey` đi qua i18n; `prefetch` chỉ định
remote/expose để tải trước khi hover.

---

## 5. Env

### 5.1. Bản đồ file

| File | Phạm vi | Quyết định gì |
|---|---|---|
| `.env.example` | committed | Template + tài liệu mọi biến, chia section |
| `.env.local` (root) | gitignore | Nguồn sự thật local — section per module |
| `<module>/.env.local` | gitignore, sinh bởi sync | File Modern.js của từng app THỰC SỰ đọc |

### 5.2. Đường đi của một biến env (quan trọng, dễ nhầm)

```
.env.local (root, chia section "# mfe-accounts ... # end mfe-accounts")
   │  node scripts/sync-env.mjs  (tự chạy trong pnpm dev)
   │  → đẩy từng section (kèm # global) xuống <module>/.env.local
   │    CHỈ THÊM key thiếu, không ghi đè — muốn ghi đè: --force
   ▼
<module>/.env.local → Modern.js nạp lúc START DEV/BUILD:
   ├─ server.port / assetPrefix        ← PORT / PUBLIC_URL
   ├─ source.define (chỉ shell)        ← REMOTE_* → inline REMOTE_MANIFEST_URLS
   └─ MODERN_* → inline literal vào browser bundle
```

⚠️ **Mọi biến env là build-time** — đổi env phải restart dev server (dev)
hoặc rebuild (prod).

⚠️ **Gotcha `process is not defined`**: Modern.js chỉ inline `MODERN_*` khi
biến ĐƯỢC set; khi không, biểu thức giữ nguyên literal → `process` không tồn
tại ở browser → ReferenceError. Luôn bọc try/catch khi đọc (xem
`shell/src/routes/layout.tsx`, `common/src/observability/sentry.ts`).

### 5.3. Biến chính

| Biến | Ý nghĩa |
|---|---|
| `MODERN_API_BASE_URL` | Base URL API gateway. TRỐNG = same-origin → MSW mock |
| `MODERN_MSW` | `true` → bản build prod vẫn dùng MSW (demo/e2e) |
| `REMOTE_HOST/PORT/BASE_PATH_MFE_X` | (shell) URL manifest từng remote per môi trường |
| `REMOTE_BASE` | (shell) base CDN chung — thay cho từng REMOTE_HOST |
| `PUBLIC_URL` | (mỗi app) URL tuyệt đối static assets của app đó |

---

## 6. Global store

File lõi: [common/src/stores/global.store.ts](../common/src/stores/global.store.ts)
(zustand vanilla — bank dùng effector, semantics giữ nguyên).

### 6.1. Singleton "3 lớp"

1. `@app/common/stores` đánh dấu shared singleton trong MF config.
2. Phòng khi vẫn bị 2 bản (import relative nội bộ, lệch version):
   `getOrCreateSingleton('__APP_GLOBAL_STORE__', factory)` cache instance trên
   **globalThis** — bản nạp sau tái dùng store của bản trước.
3. React đọc qua `useGlobalStore(selector)` (useSyncExternalStore — không cần
   Provider).

### 6.2. Nội dung store & persistence

State: `authToken`, `refreshToken`, `user`, `deviceId` (nanoid), `lang`,
`theme`, `apiHost`, `navigateLink`, `pinnedNav`.

Persistence (debounce 150ms + flush `beforeunload`) **tách 2 nơi**:

| Storage | Chứa | Hệ quả |
|---|---|---|
| `sessionStorage.app_global` | `user`, `authToken`, `refreshToken` | Phiên **chết khi đóng tab** (F5 vẫn giữ) |
| `localStorage.app_global` | phần còn lại (trừ `navigateLink`, `apiHost`) | lang/theme/deviceId giữ vĩnh viễn |

`clearAuthState()` (logout/401) xóa phiên nhưng **giữ preferences**.

### 6.3. Cách dùng

- Đổi state: qua actions export sẵn (`setAuthToken`, `setGlobalUser`,
  `setLang`, `batchUpdate`…).
- Đọc trong React: `useGlobalStore((s) => s.user)`; ngoài React:
  `globalStore.getState()`.
- `@app/common/auth` là facade mỏng giữ API cũ (`getUser/setToken/clearAuth`).
- State riêng của remote: tự quản trong remote (useState/react-query) —
  KHÔNG nhét vào global store.

---

## 7. Tầng API

File: [common/src/services/api.ts](../common/src/services/api.ts) — export
`apiGet/apiPost/apiPut/apiDelete` dùng chung toàn hệ thống (shell + mọi remote
đi qua đúng **một** axios instance).

### 7.1. Request interceptor (theo thứ tự)

1. **Prefix `[public]`** (login, refresh-token — xem
   `common/src/constants/endpoints.ts`): bỏ prefix, **không** chờ/gắn token.
2. **`waitForApiHost()`**: chờ `apiHost` được set trong store (shell set lúc
   boot) rồi mới gán `baseURL` — giải quyết race "remote gọi API trước khi
   shell kịp cấu hình".
3. **`waitForAuthToken()`**: URL private chờ token xuất hiện (subscribe store),
   quá **30s** → `handleLogout()`.
4. Headers tự gắn: `Authorization: Bearer`, `Accept-Language` (theo lang),
   `X-Device-Id`.
5. Nếu đang refresh token: request private mới bị **xếp hàng**
   (`pendingRequestsQueue`) chờ token mới.

### 7.2. Response interceptor

- **Unwrap envelope**: body dạng `{data, message, status}` → trả thẳng `data`.
  (Mock backend MSW trả đúng format này.)
- **Chuẩn hóa lỗi** thành `APIError {message, status, code, details, traceId}`.

### 7.3. Máy trạng thái refresh token (401)

```
401 (đang ở private path, không phải chính API refresh)
 ├─ retryNumber++ > MAX_REFRESH_RETRY(3)? → handleLogout
 ├─ đang refresh rồi? → vào failedRequestQueue, chờ token mới rồi tự retry
 └─ chưa: isRefreshingToken=true
     → POST /auth/refresh-token (skipRefresh, timeout 10s) {refreshToken, deviceId}
     ├─ OK: setAuthToken mới → xả cả 2 queue → retry request gốc
     └─ Fail: handleLogout() → clearAuthState + chờ persist + replace /login
```

### 7.4. Mock backend (MSW)

[common/src/mocks/handlers.ts](../common/src/mocks/handlers.ts) là "backend"
của template: auth (login → OTP → token, refresh, guard Bearer
`access-<expiry>`), accounts + transactions (phân trang), transfers. Bật khi
**dev** hoặc build với `MODERN_MSW=true`; `MswGate` chặn render tới khi worker
sẵn sàng. Dự án thật: trỏ `MODERN_API_BASE_URL` sang gateway — MSW tắt, mọi
`apiGet/apiPost` giữ nguyên.

---

## 8. Xác thực & phân quyền

### 8.1. Login là một state machine

`POST /api/auth/login` trả `nextStep` — UI switch-case
([Login.tsx](../remotes/mfe-auth/src/components/Login.tsx)):

| nextStep | UI xử lý |
|---|---|
| `OTP` | Hiện form OTP (kèm `otpSession`) → `POST /api/auth/verify-otp` |
| `HOME` | `batchUpdate({authToken, refreshToken, user})` → navigate `from` |

Thêm bước mới (đổi mật khẩu lần đầu, kích hoạt thiết bị…) = thêm case
`nextStep`, không đổi khung. Demo: `0021001 / 123456`, OTP `123456`.

### 8.2. Phiên

Token trong sessionStorage (§6.2). `AutoSignOutProvider`
([common/src/components/AutoSignOut.tsx](../common/src/components/AutoSignOut.tsx)):
idle **5 phút** (mouse/keyboard/scroll/touch) → modal đếm ngược 30s →
signOut. Logout = API logout best-effort → `clearAuth()` → `/login`.

### 8.3. Phân quyền: mô hình P/S/F (Product / Sub-product / Function)

- Backend trả `user.entitledActions: {p, s, f}[]`
  (vd `{p:'PAYMNT', s:'TRANSFER', f:'transfer:international'}`).
- Frontend định nghĩa tên dễ đọc `ActionEnum.fTransferInternational` + bảng
  `PSFMapping` ([common/src/permissions/](../common/src/permissions/)) → build
  ngược `ENTITLED_ACTIONS` (throw nếu trùng key).
- `canAction(action, user?)` — dùng ở 3 nơi: menu, route, nút chức năng.
- Component: `<PermissionCheck actions={ActionEnum.fX} logic="OR|AND"
  showLocked fallback>` — reactive theo store.
- **Role chỉ là nhãn hiển thị** — quyền thật do backend quyết qua
  entitledActions (mock: [entitlements.ts](../common/src/mocks/data/entitlements.ts)).
- Thêm quyền mới: thêm `ActionEnum` + 1 dòng trong `PSFMapping`; backend trả
  bộ `{p,s,f}` tương ứng.

---

## 9. i18n

Kiến trúc "**mỗi module một i18n instance, đổi ngôn ngữ đồng loạt**"
([common/src/i18n/](../common/src/i18n/)):

- `i18nService` giữ `Map<tên, i18n>` (singleton globalThis). Mỗi app gọi
  `useAppTranslation('<tên>', resources)` với resources bundle trong app đó
  (shell: `src/i18n/resources.ts`; remote: tương tự, key prefix theo module).
- `changeAppLanguage(lang)` = set store.lang + `changeLanguage` **mọi
  instance** → toàn bộ shell + remotes đổi cùng lúc, không reload; lang persist
  localStorage.
- Config: fallback `vi`, supported `vi en` (thêm lang = sửa
  `SUPPORTED_LANGS`), init đồng bộ (resources bundle sẵn).

---

## 10. Giải phẫu một remote

Lấy `remotes/mfe-accounts` làm mẫu — remote là **một app Modern.js hoàn
chỉnh**, đồng thời là container MF:

```
remotes/mfe-accounts/
├── modern.config.ts            # port 3002, assetPrefix TUYỆT ĐỐI, Tailwind
├── module-federation.config.ts # name mfe_accounts, generateExposes(), getPublicPath, shared
├── config/public/              # mockServiceWorker.js (chỉ app có gọi API)
└── src/
    ├── components/
    │   ├── export.remote.ts    # ★ contract công khai (danh sách expose)
    │   ├── AccountList.tsx     # màn hình — nhận navigator prop (Pattern A)
    │   └── AccountsApp.tsx     # CHỈ cho standalone (tự dựng router + QueryClient)
    ├── routes/                 # ⚠️ CHỈ để chạy standalone — route thật do shell khai
    ├── api/accounts.ts         # types + fetch qua apiGet (@app/common/services)
    ├── i18n/resources.ts       # key prefix 'accounts.*'
    └── tailwind.css            # @source ../../../common/src (Tailwind quét class shared)
```

Điểm cần nhớ khi làm việc trong remote:

1. Component expose theo Pattern A nhận `navigator` từ shell — **không dùng
   useNavigate của remote** cho điều hướng liên-module (hoặc dùng
   `setNavigateLink`).
2. Import từ `@app/common/*` thoải mái — chắc chắn cùng instance với shell
   (shared singleton).
3. API bọc qua `with*Service()` (`common/src/constants/endpoints.ts`) — đổi
   gateway một chỗ.
4. Chạy độc lập: `pnpm --filter ./remotes/mfe-accounts start` → `:3002` trang
   demo standalone (tự setup phiên mock qua `setupStandaloneSession`), manifest
   tại `/static/mf-manifest.json` cho shell tiêu thụ.

---

## 11. Build & Deploy

### 11.1. Lệnh

- `pnpm --filter ./remotes/mfe-accounts build` → static vào `dist/`
  (html/main + static + public). **Mỗi app build & deploy độc lập** — lợi ích
  chính của MFE.
- Docker: `docker compose -f docker/docker-compose.yml up --build` — mỗi app
  1 container nginx; shell build `MODERN_MSW=true` (demo tự chạy).
- AWS reference: `.github/workflows/deploy-aws.yml` — build per app → S3 →
  CloudFront (không cần server).

### 11.2. Nginx ([docker/nginx.conf](../docker/nginx.conf))

| Location | Rule | Lý do |
|---|---|---|
| `/` | `try_files $uri /index.html` + **no-cache** | SPA fallback; HTML không cache để nhận bundle mới |
| `= /static/mf-manifest.json` | **no-cache + CORS** | Shell luôn đọc được manifest mới nhất sau deploy |
| `/static/` | cache 1 năm + immutable + CORS | chunk có hash trong tên |
| `= /health` | 200 "ok" | probe cho orchestrator |

### 11.3. Chuỗi chống-stale sau deploy (3 lớp)

1. Nginx/S3: manifest + html **no-cache**.
2. Client: `registerRemotes(force)` + `?t=` mỗi lần load component.
3. `lazyRemoteWithFallback`: chunk 404 (hash cũ) → auto reload trang 1 lần →
   nhận manifest/chunk mới.

→ **Deploy remote mới: shell KHÔNG rebuild, user KHÔNG cần F5** (điều hướng
là nhận bản mới).

---

## 12. Cheatsheet

| Muốn… | Vào đâu |
|---|---|
| Tạo MFE mới | `pnpm gen:mfe` (sinh package + wire 8 điểm — xem [add-new-mfe.md](./add-new-mfe.md)) |
| Thêm màn hình cho remote có sẵn (Pattern A) | Component trong `remotes/<m>/src/components/` → thêm import vào `export.remote.ts` → tạo `shell/src/routes/__private/<path>/page.tsx` gọi `lazyRemoteWithFallback`/`remotePage` → `Paths` + NavItem |
| Thêm màn trong zone cards (Pattern B) | CHỈ sửa `remotes/mfe-cards`: thêm `<Route>` trong `CardsRoutes.tsx` — không đụng shell |
| Thêm/đổi API endpoint | `remotes/<m>/src/api/*.ts` bọc `with*Service`; endpoint chung → `common/src/constants/endpoints.ts`; mock → `common/src/mocks/handlers.ts` |
| Đổi API gateway | `MODERN_API_BASE_URL` section `# global` trong `.env.local` (build-time!) |
| Thêm quyền mới | `common/src/permissions/` (ActionEnum + PSFMapping) + mock `entitlements.ts` |
| Thêm ngôn ngữ/key dịch | `<app>/src/i18n/resources.ts` của app đó; thêm lang → `SUPPORTED_LANGS` |
| Thêm state global | `common/src/stores/global.store.ts` (field + action) — cân nhắc có persist không (sửa `persist()`) |
| Sửa UI kit chung | `common/src/ui/` (+ stories) — Tailwind tokens ở `common/src/styles/theme.css` |
| Đổi port/host remote per môi trường | `.env.local` root (đúng section) → `pnpm sync-env` → restart |
| Debug remote không load | DevTools Network: tìm `mf-manifest.json?t=...` → 404/CORS? Check `REMOTE_*` env + remote có chạy không; console có `[MF] Load failed for "..."` |
| Debug lệch version shared | Console warning "Unsatisfied version" → đồng bộ version trong package.json của app lệch (§3.1) |
| Xem UI không có backend | Mặc định dev đã dùng MSW; sửa/thêm handler ở `common/src/mocks/handlers.ts` |
