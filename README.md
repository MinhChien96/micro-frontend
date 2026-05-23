# VietBank — Vite Module Federation

> Ứng dụng ngân hàng micro frontend hoàn chỉnh — minh họa kiến trúc `@module-federation/vite` theo chuẩn production: localStorage auth, React Query per-MFE, shared package bundled at build time via Vite alias.

**Live demo:** https://minhchien96.github.io/micro-frontend/  
**Đăng nhập:** CIF `0021001` · Mật khẩu `123456` · Chọn role CUSTOMER / PREMIUM / BUSINESS

---

## Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Module Federation — Cấu hình cốt lõi](#module-federation--cấu-hình-cốt-lõi)
4. [Intra-MFE Routing](#intra-mfe-routing)
5. [Auth — localStorage + Custom Event](#auth--localstorage--custom-event)
6. [Data Fetching — React Query per MFE](#data-fetching--react-query-per-mfe)
7. [Shared Package — Build-time Alias](#shared-package--build-time-alias)
8. [Authorization — RBAC](#authorization--rbac)
9. [Performance Optimization](#performance-optimization)
10. [Chạy local](#chạy-local)
11. [CI/CD với GitHub Actions](#cicd-với-github-actions)
12. [Quy trình làm việc theo team](#quy-trình-làm-việc-theo-team)
13. [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BROWSER (Runtime)                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    shell  (port 3000)                        │   │
│  │         Host App — HashRouter, AuthContext, Nav              │   │
│  │                                                              │   │
│  │  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐  │   │
│  │  │ mfe-auth │  │mfe-accounts│  │mfe-transfer│  │mfe-cards│  │   │
│  │  │  :3001   │  │   :3002   │  │   :3003   │  │  :3007  │  │   │
│  │  └──────────┘  └────────────┘  └────────────┘  └─────────┘  │   │
│  │  ┌──────────┐  ┌────────────┐                               │   │
│  │  │mfe-loans │  │mfe-profile │                               │   │
│  │  │  :3006   │  │   :3005   │                               │   │
│  │  └──────────┘  └────────────┘                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               localStorage                                   │   │
│  │  vietbank_user  ←── auth state (đọc bởi mọi MFE)           │   │
│  │  vietbank_token ←── JWT token                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

BUILD TIME (Vite alias — không phải runtime MF remote):
  shared/src/auth.js          → bundled vào mỗi MFE
  shared/src/ui/*.jsx         → bundled vào mỗi MFE
  shared/src/components/*.jsx → bundled vào mỗi MFE
```

### Nguyên tắc thiết kế

| Quyết định | Cách làm | Lý do |
|-----------|---------|-------|
| Auth state | localStorage | Đơn giản, hoạt động cross-MFE không cần runtime dependency |
| Reactivity | Custom event `auth:changed` | Shell subscribe → re-render Nav/ProtectedRoute khi login/logout |
| Data fetching | React Query per MFE | Mỗi MFE tự fetch domain của mình, cache 5 phút |
| Shared utilities | Vite alias (build-time) | Không có runtime port dependency, không có MF container deferred init |
| Shared singletons | `singleton: true` | Shell và MFE dùng chung một instance react/react-dom/react-router-dom |
| Build tool | Vite + `@module-federation/vite` | HMR nhanh, cấu hình đơn giản, không cần `import: false` hay `hot: false` |

---

## Cấu trúc thư mục

```
micro-frontend/
├── remotes.config.js        # URL registry cho 6 MFE remotes
├── pnpm-workspace.yaml
│
├── shared/                  # Build-time package (UI components + auth utils)
│   └── src/
│       ├── auth.js          # localStorage helpers: getUser, setUser, getToken…
│       ├── utils/permissions.js   # RBAC: role → permissions mapping
│       ├── components/PermissionGate.jsx
│       └── ui/              # Design system: Button, Card, Badge, Toast, Spinner…
│
├── shell/                   # Host app (port 3000)
│   ├── index.html
│   └── src/
│       ├── main.jsx         # ReactDOM.createRoot + HashRouter
│       ├── AuthContext.jsx  # React context wrapping localStorage auth state
│       ├── App.jsx          # Routes: lazy import mỗi MFE
│       └── components/
│           ├── Nav.jsx
│           └── ProtectedRoute.jsx
│
├── mfe-auth/     :3001      # Login form, demo role selector
├── mfe-accounts/ :3002      # AccountList → AccountDetail → TransactionList
├── mfe-transfer/ :3003      # TransferDashboard → NewTransfer → History
├── mfe-profile/  :3005      # ProfilePage → EditProfile → SecuritySettings
├── mfe-loans/    :3006      # LoanList → LoanDetail → PaymentSchedule
└── mfe-cards/    :3007      # CardList → CardDetail
```

Mỗi MFE có cấu trúc:

```
mfe-xxx/
├── index.html               # Entry HTML (Vite yêu cầu ở root package)
├── vite.config.js           # Vite + @module-federation/vite config
├── package.json
└── src/
    ├── main.jsx             # Standalone entry: ReactDOM.createRoot (chỉ dùng khi dev độc lập)
    ├── App.jsx              # Standalone app wrapper
    ├── components/
    │   └── XxxApp.jsx       # Exposed component — dùng <Routes>, KHÔNG dùng <Router>
    └── styles.css
```

---

## Module Federation — Cấu hình cốt lõi

### Shell (host)

```js
// shell/vite.config.js
import { federation } from '@module-federation/vite';
import remotes from '../remotes.config.js';

federation({
  name: 'shell',
  remotes,   // { mfe_auth: 'http://localhost:3001/remoteEntry.js', … }
  shared: {
    react:              { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
  },
})
```

### MFE (remote) — pattern chuẩn

```js
// mfe-accounts/vite.config.js
import { fileURLToPath } from 'url';
import { federation } from '@module-federation/vite';

const sharedSrc = fileURLToPath(new URL('../shared/src', import.meta.url));

federation({
  name: 'mfe_accounts',
  filename: 'remoteEntry.js',
  exposes: { './AccountsApp': './src/components/AccountsApp' },
  shared: {
    react:                   { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom':             { singleton: true, requiredVersion: '^18.2.0' },
    'react-router-dom':      { singleton: true, requiredVersion: '^6.22.0' },
    '@tanstack/react-query': { singleton: true, requiredVersion: '^5.28.0' },
  },
})

// resolve.alias để bundle shared/ tại build time
resolve: {
  alias: {
    'shared/ui':             `${sharedSrc}/ui/index.js`,
    'shared/auth':           `${sharedSrc}/auth.js`,
    'shared/PermissionGate': `${sharedSrc}/components/PermissionGate.jsx`,
  },
}
```

### remotes.config.js

```js
const base  = process.env.BASE_GH_PAGES;
const local = (port) => `http://localhost:${port}/remoteEntry.js`;
const pages = (path) => `${base}/${path}/remoteEntry.js`;

module.exports = {
  mfe_auth:     process.env.MFE_AUTH_URL     || (base ? pages('mfe-auth')     : local(3001)),
  mfe_accounts: process.env.MFE_ACCOUNTS_URL || (base ? pages('mfe-accounts') : local(3002)),
  mfe_transfer: process.env.MFE_TRANSFER_URL || (base ? pages('mfe-transfer') : local(3003)),
  mfe_profile:  process.env.MFE_PROFILE_URL  || (base ? pages('mfe-profile')  : local(3005)),
  mfe_loans:    process.env.MFE_LOANS_URL    || (base ? pages('mfe-loans')    : local(3006)),
  mfe_cards:    process.env.MFE_CARDS_URL    || (base ? pages('mfe-cards')    : local(3007)),
};
```

> **Lưu ý:** Vite MF dùng URL thuần (`http://...`), khác với Webpack dùng format `name@url`.

### Shell lazy import MFE

```jsx
// shell/src/App.jsx
const AccountsApp = lazy(() => import('mfe_accounts/AccountsApp'));
const TransferApp = lazy(() => import('mfe_transfer/TransferApp'));

<Route path="/accounts/*" element={
  <ProtectedRoute>
    <Suspense fallback={<PageSpinner />}><AccountsApp /></Suspense>
  </ProtectedRoute>
} />
```

---

## Intra-MFE Routing

Shell mount mỗi MFE tại một path prefix, MFE quản lý sub-routes của mình:

```jsx
// shell/src/App.jsx — shell dùng path="/*" để pass context xuống
<Route path="/accounts/*" element={<ProtectedRoute>{mfe('Tài khoản', <AccountsApp />)}</ProtectedRoute>} />

// mfe-accounts/src/components/AccountsApp.jsx — dùng <Routes>, KHÔNG dùng <Router>
export default function AccountsApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route index element={<AccountList />} />
        <Route path=":id" element={<Suspense fallback={<PageSpinner />}><AccountDetail /></Suspense>} />
        <Route path=":id/transactions" element={<Suspense fallback={<PageSpinner />}><TransactionList /></Suspense>} />
      </Routes>
    </QueryClientProvider>
  );
}
```

Router context (HashRouter) đến từ shell — MFE consume mà không tạo Router mới. Điều này hoạt động nhờ `react-router-dom` được khai báo `singleton: true` trong cả shell lẫn MFE.

### Bảng routes

| Path | MFE | Component |
|------|-----|-----------|
| `/login` | mfe-auth | Login |
| `/accounts` | mfe-accounts | AccountList |
| `/accounts/:id` | mfe-accounts | AccountDetail (lazy) |
| `/accounts/:id/transactions` | mfe-accounts | TransactionList (lazy) |
| `/transfer` | mfe-transfer | TransferDashboard |
| `/transfer/new` | mfe-transfer | NewTransfer (lazy) |
| `/transfer/history` | mfe-transfer | TransferHistory (lazy) |
| `/cards` | mfe-cards | CardList |
| `/cards/:id` | mfe-cards | CardDetail (lazy) |
| `/loans` | mfe-loans | LoanList |
| `/loans/:id` | mfe-loans | LoanDetail (lazy) |
| `/loans/:id/schedule` | mfe-loans | PaymentSchedule (lazy) |
| `/profile` | mfe-profile | ProfilePage |
| `/profile/edit` | mfe-profile | EditProfile (lazy) |
| `/profile/security` | mfe-profile | SecuritySettings (lazy) |

---

## Auth — localStorage + Custom Event

Không dùng shared Zustand store hay shared MF runtime. Auth state được lưu trong localStorage và propagate qua DOM event.

```
Login (mfe-auth)                    Shell / tất cả MFE
     │                                     │
     │── setUser({name, role, …})          │
     │── setToken('mock-jwt-…')            │
     │── dispatchEvent('auth:changed') ───►│── AuthContext.useEffect re-read localStorage
     │                                     │── Nav re-render (hiện tên user)
     │                                     │── ProtectedRoute cho qua
```

### Shell AuthContext

```jsx
// shell/src/AuthContext.jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('vietbank_user') || 'null')
  );
  useEffect(() => {
    const handler = () =>
      setUser(JSON.parse(localStorage.getItem('vietbank_user') || 'null'));
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
```

### MFE đọc user (không cần hook, không cần import từ shell)

```js
// Inline trong bất kỳ MFE nào
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('vietbank_user') || 'null'); }
  catch { return null; }
};
```

---

## Data Fetching — React Query per MFE

Mỗi MFE tạo `QueryClient` riêng — không share cache cross-MFE. Đây là cách Zalando, Klarna, DAZN áp dụng trong production.

```jsx
// mfe-accounts/src/components/AccountsApp.jsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

export default function AccountsApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>…</Routes>
    </QueryClientProvider>
  );
}
```

```jsx
// mfe-accounts/src/components/AccountList.jsx
export default function AccountList() {
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,   // mock API với 400ms delay
  });
  // …
}
```

Mock API nằm trong `mfe-xxx/src/api/` — thay bằng real endpoint khi cần, không ảnh hưởng MFE khác.

---

## Shared Package — Build-time Alias

`shared/` là **workspace package** được bundle trực tiếp vào mỗi MFE tại build time — không phải MF runtime remote.

```js
// mfe-accounts/vite.config.js
const sharedSrc = fileURLToPath(new URL('../shared/src', import.meta.url));

resolve: {
  alias: {
    'shared/auth':           `${sharedSrc}/auth.js`,
    'shared/ui':             `${sharedSrc}/ui/index.js`,
    'shared/PermissionGate': `${sharedSrc}/components/PermissionGate.jsx`,
  },
}
```

```jsx
// Trong bất kỳ MFE nào — import giống nhau, Vite tự resolve
import { Card, CardHeader, Button, useToast } from 'shared/ui';
import { getUser, hasPermission } from 'shared/auth';
import PermissionGate from 'shared/PermissionGate';
```

### Tại sao không dùng MF runtime remote cho shared?

Khi `shared` expose React components, MF container phải register chúng vào share scope. Điều này tạo ra **initial chunk dependencies** trên `remoteEntry.js`. Vấn đề này phổ biến với Webpack 5 (`import: false`, `hot: false` là các workaround). Với build-time alias: không có `remoteEntry.js`, không có deferred init, không có lỗi.

### Phát triển shared components

`shared/` không cần devserver khi phát triển cùng các MFE — code được bundle trực tiếp. Chỉ cần restart devserver của MFE khi thay đổi shared để Vite recompile.

Nếu muốn phát triển shared components riêng lẻ:

```bash
pnpm --filter shared start   # port 3004
```

---

## Authorization — RBAC

Ba role với permission khác nhau:

| Role | Permissions |
|------|------------|
| CUSTOMER | `accounts:view`, `transfer:domestic`, `cards:view`, `loans:view`, `profile:edit` |
| PREMIUM | + `transfer:international`, `cards:freeze`, `cards:limit`, `loans:apply` |
| BUSINESS | + `transfer:bulk`, `accounts:manage` |

```jsx
// Dùng PermissionGate để ẩn/hiện feature
import PermissionGate from 'shared/PermissionGate';

<PermissionGate permission="transfer:international" showLocked requiredRole="PREMIUM">
  <InternationalTransferForm />
</PermissionGate>
```

```js
// Hoặc check trực tiếp
import { hasPermission } from 'shared/auth';
if (hasPermission('loans:apply')) { /* … */ }
```

---

## Performance Optimization

### Code splitting & Lazy load

Sub-pages trong mỗi MFE được lazy load với `React.lazy`:

```jsx
// mfe-accounts/src/components/AccountsApp.jsx
const AccountDetail   = lazy(() => import('./AccountDetail'));
const TransactionList = lazy(() => import('./TransactionList'));
```

Vite tự động tạo async chunks cho mỗi dynamic import — không cần magic comments như Webpack.

### React Query cache

```js
// staleTime: 5 phút — data không bị refetch khi navigate giữa các trang
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});
```

### Chunk caching

| Loại | Cache header |
|------|-------------|
| Assets có hash (`main-[hash].js`) | `max-age=31536000, immutable` |
| `remoteEntry.js` (không hash) | `max-age=0, must-revalidate` |

---

## Chạy local

### Yêu cầu

- Node.js 18+
- pnpm 10+

### Cài đặt

```bash
git clone https://github.com/minhchien96/micro-frontend.git
cd micro-frontend
pnpm install
```

### Chạy development

```bash
pnpm start
```

Lệnh này khởi động **6 MFE devservers** và shell song song:

```
auth     → http://localhost:3001  (mfe-auth)
accounts → http://localhost:3002  (mfe-accounts)
transfer → http://localhost:3003  (mfe-transfer)
profile  → http://localhost:3005  (mfe-profile)
loans    → http://localhost:3006  (mfe-loans)
cards    → http://localhost:3007  (mfe-cards)
shell    → http://localhost:3000  ← mở trình duyệt ở đây
```

> Vite khởi động rất nhanh (~300ms/MFE). Không cần `wait-on` như Webpack — Vite MF lazy-load remoteEntry.js khi user navigate đến route tương ứng, nên shell có thể start trước các MFE.

### Build production

```bash
pnpm build
```

Mỗi MFE output `dist/remoteEntry.js` + asset chunks. Shell output `dist/index.html` với lazy imports đến các remote.

### Preview production build

```bash
pnpm --filter shell preview      # port 3000
pnpm --filter mfe-auth preview   # port 3001
# …
```

---

## CI/CD với GitHub Actions

### Workflow trigger

| Workflow | Trigger | Mô tả |
|---------|---------|--------|
| `deploy-all.yml` | Push vào `shared/**`, `remotes.config.js`, `pnpm-lock.yaml`, `.github/workflows/**` | Full rebuild tất cả packages |
| `deploy-mfe-auth.yml` | Push vào `mfe-auth/**` | Build + deploy chỉ mfe-auth |
| `deploy-mfe-accounts.yml` | Push vào `mfe-accounts/**` | Build + deploy chỉ mfe-accounts |
| … | … | Tương tự cho các MFE khác |
| `deploy-shell.yml` | Push vào `shell/**` | Build + deploy shell |

### Tại sao shared thay đổi → deploy-all?

`shared/` được bundle vào mỗi MFE tại build time (Vite alias). Khi `shared/src/ui/Button.jsx` thay đổi, tất cả MFE cần rebuild để có bản mới. `deploy-all` đảm bảo toàn bộ hệ thống được rebuild đồng bộ.

### Remote URL trong production

```js
// remotes.config.js — env var BASE_GH_PAGES được set trong CI
env:
  BASE_GH_PAGES: https://minhchien96.github.io/micro-frontend
```

---

## Quy trình làm việc theo team

```
Team Auth (mfe-auth)
  ├── Phát triển độc lập trên port 3001: pnpm --filter mfe-auth start
  ├── Commit → push → deploy-mfe-auth.yml chạy tự động
  └── Shell tự động dùng bản mới (remoteEntry.js không có hash)

Team Accounts (mfe-accounts)
  ├── Phát triển độc lập trên port 3002: pnpm --filter mfe-accounts start
  └── Commit → push → deploy-mfe-accounts.yml

Team Shared (shared package)
  ├── Phát triển: pnpm --filter shared start (port 3004)
  ├── Commit → push → deploy-all.yml chạy (rebuild toàn bộ MFE)
  └── Cẩn thận: breaking change trong shared ảnh hưởng tất cả MFE
```

---

## Xử lý sự cố thường gặp

### MFE không load — lỗi network khi fetch remoteEntry.js

**Nguyên nhân phổ biến:**

1. **MFE devserver chưa khởi động** — Vite MF lazy-load khi user navigate, nên MFE phải running khi user truy cập route đó.

2. **CORS** — Vite config phải có `server: { cors: true }`. Kiểm tra:
   ```bash
   curl -I http://localhost:3002/remoteEntry.js
   # Phải có: Access-Control-Allow-Origin: *
   ```

3. **Port bị chiếm** — kiểm tra `lsof -i :3002` và kill process cũ.

### MFE load OK nhưng không render gì — lỗi routing

Kiểm tra `react-router-dom` có được khai báo là `singleton: true` trong cả shell lẫn MFE không. Nếu MFE tạo `<Router>` riêng thay vì dùng `<Routes>`, nested routes sẽ không hoạt động vì có 2 Router context.

### Import `{ federation }` — lỗi "is not a function"

`@module-federation/vite` xuất **named export**, không phải default:

```js
// ĐÚNG
import { federation } from '@module-federation/vite';

// SAI
import federation from '@module-federation/vite';
```

### Đổi code trong `shared/` nhưng MFE không cập nhật

Vite HMR theo dõi file trong `src/` của package hiện tại. Với cross-package alias (`../shared/src`), cần restart devserver của MFE để Vite recompile và pick up thay đổi mới.

### Build lỗi: `Cannot read file 'tsconfig.json'`

Warning từ `@module-federation/dts-plugin` — plugin này cố generate TypeScript declarations. Với project JavaScript thuần, warning này an toàn để bỏ qua. Không ảnh hưởng đến output build.

---

## Công nghệ sử dụng

| Công nghệ | Version | Vai trò |
|-----------|---------|---------|
| Vite | 6.3 | Build tool, HMR, dev server |
| `@module-federation/vite` | 1.x | Module Federation cho Vite |
| React | 18.3 | UI framework |
| React Router | 6.22 | Client-side routing |
| TanStack React Query | 5.28 | Data fetching + cache per MFE |
| pnpm | 10 | Workspace package manager |
| GitHub Actions | — | CI/CD, deploy GitHub Pages |
