# VietBank — Webpack 5 Module Federation

> Ứng dụng ngân hàng micro frontend hoàn chỉnh — minh họa kiến trúc Webpack 5 Module Federation theo chuẩn production: localStorage auth, React Query per-MFE, shared package bundled at build time.

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

BUILD TIME (webpack alias — không phải runtime MF remote):
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
| Shared utilities | Webpack alias (build-time) | Không có runtime port dependency, không có MF container deferred init |
| Shared singletons | `import: false` + singleton | Shell provide react/react-dom/react-router-dom, remotes chỉ consume |

---

## Cấu trúc thư mục

```
micro-frontend/
├── babel.config.js          # Root babel config — áp dụng cho toàn bộ monorepo
├── webpack.optimization.js  # Shared optimization config (splitChunks, output hash)
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
│   └── src/
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

---

## Module Federation — Cấu hình cốt lõi

### Shell (host)

```js
// shell/webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    mfe_auth:     'mfe_auth@http://localhost:3001/remoteEntry.js',
    mfe_accounts: 'mfe_accounts@http://localhost:3002/remoteEntry.js',
    mfe_transfer: 'mfe_transfer@http://localhost:3003/remoteEntry.js',
    mfe_profile:  'mfe_profile@http://localhost:3005/remoteEntry.js',
    mfe_loans:    'mfe_loans@http://localhost:3006/remoteEntry.js',
    mfe_cards:    'mfe_cards@http://localhost:3007/remoteEntry.js',
  },
  shared: {
    // Shell là HOST — provide react cho toàn bộ share scope
    react:              { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
  },
}),
```

### MFE (remote) — pattern chuẩn

```js
// mfe-accounts/webpack.config.js
new ModuleFederationPlugin({
  name: 'mfe_accounts',
  filename: 'remoteEntry.js',
  exposes: { './AccountsApp': './src/components/AccountsApp' },
  remotes: {},  // ← không có runtime remote nào khác
  shared: {
    // import: false = remote KHÔNG provide, chỉ CONSUME từ shell
    // Thiếu flag này → webpack tạo provide-chunk → remoteEntry.js bị deferred init
    react:              { singleton: true, requiredVersion: '^18.2.0', import: false },
    'react-dom':        { singleton: true, requiredVersion: '^18.2.0', import: false },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0', import: false },
  },
}),
devServer: {
  port: 3002,
  headers: { 'Access-Control-Allow-Origin': '*' },
  // hot/liveReload/client: false — ngăn webpack-dev-server inject HMR client
  // vào initial chunk. Thiếu 3 flag này → remoteEntry.js phụ thuộc vendors chunk
  // → shell chỉ load remoteEntry.js, không bao giờ load vendors → mfe_accounts = undefined
  hot: false,
  liveReload: false,
  client: false,
},
```

### Tại sao `import: false` và `hot: false`?

Không có 2 flag này, webpack tạo **initial chunk dependencies** cho `remoteEntry.js`:

```js
// remoteEntry.js bị DEFERRED (lỗi):
var mfe_accounts = __webpack_require__.O(undefined,
  ["vendors-react-dom-...", "webpack_sharing_provide_default_react..."],
  () => __webpack_require__("webpack/container/entry/mfe_accounts")
);
// Shell chỉ fetch remoteEntry.js → vendors chunk không bao giờ được load
// → mfe_accounts = undefined → ScriptExternalLoadError

// remoteEntry.js ĐÚNG (sau khi fix):
var mfe_accounts = __webpack_require__("webpack/container/entry/mfe_accounts");
// Synchronous — shell fetch xong là dùng được ngay
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

Router context (HashRouter) đến từ shell — MFE consume mà không tạo Router mới.

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
// mfe-accounts/webpack.config.js
resolve: {
  alias: {
    'shared/auth':           path.resolve(__dirname, '../shared/src/auth'),
    'shared/ui':             path.resolve(__dirname, '../shared/src/ui/index'),
    'shared/PermissionGate': path.resolve(__dirname, '../shared/src/components/PermissionGate'),
  },
},
```

```jsx
// Trong bất kỳ MFE nào — import giống nhau, webpack tự resolve
import { Card, CardHeader, Button, useToast } from 'shared/ui';
import { getUser, hasPermission } from 'shared/auth';
import PermissionGate from 'shared/PermissionGate';
```

### Tại sao không dùng MF runtime remote cho shared?

MF container (`remoteEntry.js`) phải tải đồng bộ. Khi `shared` expose React components, webpack tạo **consume-shared chunks** để register react vào share scope. Những chunks này là **initial chunks** → `remoteEntry.js` bị deferred:

```
remoteEntry.js bị deferred → shell fetch file xong nhưng container = undefined
→ ScriptExternalLoadError khi shell gọi container.get('./auth')
```

Với build-time alias: không có remoteEntry.js, không có deferred init, không có lỗi.

### Babel config cho monorepo

`.babelrc` chỉ áp dụng trong package boundary. Khi webpack alias trỏ ra `../shared/src/*.jsx`, babel không tìm được preset-react. Fix:

```js
// babel.config.js (root — áp dụng cho toàn bộ workspace)
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
};

// Mỗi MFE webpack.config.js
{ test: /\.(js|jsx)$/, exclude: /node_modules/,
  use: { loader: 'babel-loader', options: { rootMode: 'upward' } } }
//                                                ↑ tìm babel.config.js lên thư mục cha
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

Sub-pages trong mỗi MFE được lazy load với `webpackChunkName` + `webpackPrefetch`:

```jsx
const AccountDetail = lazy(() =>
  import(/* webpackChunkName: "account-detail", webpackPrefetch: true */
    './AccountDetail')
);
```

### Chunk strategy

| Loại chunk | Tên file | Cache |
|-----------|---------|-------|
| Entrypoint | `main.[hash8].js` | `max-age=31536000, immutable` |
| Async vendor | `async-vendor.[pkg].[hash8].chunk.js` | `max-age=31536000, immutable` |
| Lazy page | `[name].[hash8].chunk.js` | `max-age=31536000, immutable` |
| MF container | `remoteEntry.js` | `max-age=0, must-revalidate` |

Initial vendor chunks bị **tắt trong development** để tránh remoteEntry.js bị deferred (bật lại trong production).

### React Query cache

```js
// staleTime: 5 phút — data không bị refetch khi navigate giữa các trang
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});
```

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

Lệnh này khởi động **6 MFE devservers** song song, chờ tất cả `remoteEntry.js` sẵn sàng (qua `wait-on`), rồi mới khởi động shell.

```
auth     → http://localhost:3001  (mfe-auth)
accounts → http://localhost:3002  (mfe-accounts)
transfer → http://localhost:3003  (mfe-transfer)
profile  → http://localhost:3005  (mfe-profile)
loans    → http://localhost:3006  (mfe-loans)
cards    → http://localhost:3007  (mfe-cards)
shell    → http://localhost:3000  ← mở trình duyệt ở đây
```

> **Lưu ý:** `shared/` không cần chạy devserver — code được bundle trực tiếp vào mỗi MFE tại build time. Nếu muốn phát triển shared components riêng lẻ: `pnpm --filter shared start`

### Build production

```bash
pnpm build
```

---

## CI/CD với GitHub Actions

### Workflow trigger

| Workflow | Trigger | Mô tả |
|---------|---------|--------|
| `deploy-all.yml` | Push vào `shared/**`, `webpack.optimization.js`, `remotes.config.js`, `pnpm-lock.yaml` | Full rebuild tất cả packages |
| `deploy-mfe-auth.yml` | Push vào `mfe-auth/**` | Build + deploy chỉ mfe-auth |
| `deploy-mfe-accounts.yml` | Push vào `mfe-accounts/**` | Build + deploy chỉ mfe-accounts |
| … | … | Tương tự cho các MFE khác |

### Tại sao shared thay đổi → deploy-all?

`shared/` được bundle vào mỗi MFE tại build time (webpack alias). Khi `shared/src/ui/Button.jsx` thay đổi, tất cả MFE cần rebuild để có bản mới. `deploy-all` đảm bảo toàn bộ hệ thống được rebuild đồng bộ.

### Remote URL trong production

```js
// remotes.config.js — hỗ trợ env var cho từng team
const base = process.env.BASE_GH_PAGES;
const URLS = {
  mfe_auth: process.env.MFE_AUTH_URL ||
    (base ? `${base}/mfe-auth/remoteEntry.js` : 'http://localhost:3001/remoteEntry.js'),
  // …
};
```

---

## Quy trình làm việc theo team

```
Team Auth (mfe-auth)
  ├── Phát triển độc lập trên port 3001
  ├── Commit → push → deploy-mfe-auth.yml chạy tự động
  └── Shell tự động dùng bản mới (remoteEntry.js không có hash)

Team Accounts (mfe-accounts)
  ├── Phát triển độc lập trên port 3002
  └── Commit → push → deploy-mfe-accounts.yml

Team Shared (shared package)
  ├── Phát triển: pnpm --filter shared start (port 3004)
  ├── Commit → push → deploy-all.yml chạy (rebuild toàn bộ MFE)
  └── Cẩn thận: breaking change trong shared ảnh hưởng tất cả MFE
```

---

## Xử lý sự cố thường gặp

### `ScriptExternalLoadError: Loading script failed. (missing: http://localhost:300X/remoteEntry.js)`

**Nguyên nhân phổ biến:**

1. **MFE devserver chưa khởi động xong** — `wait-on` trong `pnpm start` đã xử lý vấn đề này, nhưng lần compile đầu tiên có thể mất 15–30 giây.

2. **remoteEntry.js bị deferred init** — xảy ra nếu thiếu `import: false` hoặc `hot: false` trong webpack config của MFE. Kiểm tra:
   ```bash
   curl -s http://localhost:3001/remoteEntry.js | grep -B3 "mfe_auth = __webpack_exports"
   # ĐÚNG:  var mfe_auth = __webpack_require__("webpack/container/entry/mfe_auth");
   # SAI:   var mfe_auth = __webpack_require__.O(undefined, ["vendors-..."], ...)
   ```

3. **Port bị chiếm** — kiểm tra `lsof -i :3001` và kill process cũ.

### `Support for the experimental syntax 'jsx' isn't currently enabled`

Thiếu `rootMode: 'upward'` trong babel-loader config của MFE, hoặc thiếu `babel.config.js` ở root. Xem [Shared Package — Build-time Alias](#shared-package--build-time-alias).

### MFE load OK nhưng không render gì

Kiểm tra `react-router-dom` có được khai báo là singleton trong cả shell lẫn MFE không. Nếu MFE tạo router riêng thay vì dùng `<Routes>`, nested routes sẽ không hoạt động.

### Đổi code trong `shared/` nhưng MFE không cập nhật

`shared` được bundle vào MFE tại build time. Cần **restart devserver của MFE** để webpack recompile và pick up thay đổi mới từ `shared/src/`.

---

## Công nghệ sử dụng

| Công nghệ | Version | Vai trò |
|-----------|---------|---------|
| Webpack 5 | 5.107 | Module Federation, code splitting |
| React | 18.3 | UI framework |
| React Router | 6.22 | Client-side routing |
| TanStack React Query | 5.28 | Data fetching + cache per MFE |
| pnpm | 10 | Workspace package manager |
| webpack-dev-server | 5 | Development server |
| GitHub Actions | — | CI/CD, deploy GitHub Pages |
