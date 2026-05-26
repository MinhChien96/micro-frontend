# VietBank — Micro Frontend với Vite Module Federation

> Demo ứng dụng ngân hàng micro frontend theo chuẩn production, sử dụng `@module-federation/vite` (Vite 6), pnpm workspaces, React 18 (Concurrent), React Router 6, TanStack React Query 5 (Infinite + Optimistic), Virtual Scrolling, Dark mode, localStorage auth, và GitHub Actions CI/CD.

**Live demo:** https://minhchien96.github.io/micro-frontend/  
**Đăng nhập:** CIF `0021001` · Mật khẩu `123456` · Chọn role CUSTOMER / PREMIUM / BUSINESS

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Cấu hình Module Federation](#3-cấu-hình-module-federation)
4. [Routing — Shell + Intra-MFE](#4-routing--shell--intra-mfe)
5. [Auth — localStorage + Custom Event](#5-auth--localstorage--custom-event)
6. [Data Fetching — React Query per MFE](#6-data-fetching--react-query-per-mfe)
7. [Shared Package — MF Runtime Remote](#7-shared-package--mf-runtime-remote)
8. [Authorization — RBAC](#8-authorization--rbac)
9. [Performance & Advanced Techniques](#9-performance--advanced-techniques)
10. [Chạy local](#10-chạy-local)
11. [CI/CD — GitHub Actions](#11-cicd--github-actions)
12. [Quy trình làm việc theo team](#12-quy-trình-làm-việc-theo-team)
13. [Xử lý sự cố thường gặp](#13-xử-lý-sự-cố-thường-gặp)
14. [Công nghệ sử dụng](#14-công-nghệ-sử-dụng)

---

## 1. Tổng quan kiến trúc

```
┌───────────────────────────────────────────────────────────────────────┐
│                            BROWSER (Runtime)                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    shell  :3000                                │   │
│  │     HashRouter · AuthProvider · Nav · ProtectedRoute          │   │
│  │                                                               │   │
│  │  lazy import (Module Federation) khi user navigate:           │   │
│  │  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │   │
│  │  │ mfe-auth │  │mfe-accounts│  │mfe-transfer│  │mfe-cards │  │   │
│  │  │  :3001   │  │   :3002    │  │   :3003    │  │  :3007   │  │   │
│  │  └──────────┘  └────────────┘  └────────────┘  └──────────┘  │   │
│  │  ┌──────────┐  ┌────────────┐                                 │   │
│  │  │mfe-loans │  │mfe-profile │                                 │   │
│  │  │  :3006   │  │   :3005    │                                 │   │
│  │  └──────────┘  └────────────┘                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  localStorage                                                  │   │
│  │  vietbank_user  — { name, customerId, role, branch, … }       │   │
│  │  vietbank_token — mock JWT token                               │   │
│  └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘

RUNTIME (MF Remote — localhost:3004 / GitHub Pages /shared/):
  shared/src/auth.js                 → fetch qua shared/remoteEntry.js
  shared/src/ui/{Button,Card,…}.jsx  → fetch qua shared/remoteEntry.js
  shared/src/components/PermissionGate.jsx → fetch qua shared/remoteEntry.js
```

### Các quyết định kiến trúc quan trọng

| Vấn đề | Giải pháp | Lý do |
|--------|-----------|-------|
| Auth state cross-MFE | `localStorage` + DOM event `auth:changed` | Không cần runtime dependency, hoạt động ngay khi MFE được mount |
| Shared UI/utils | MF runtime remote (:3004) | Single source of truth — update shared 1 lần, mọi MFE nhận ngay; không bundle duplicate |
| Singleton React | `singleton: true` trong MF shared | Shell cung cấp 1 instance react/react-dom/react-router-dom cho toàn bộ |
| Data fetching | `QueryClient` riêng mỗi MFE | Domain isolation, mỗi team tự quản lý cache |
| Routing | Shell dùng `path="/*"`, MFE dùng `<Routes>` | MFE nhận Router context từ shell, không tạo Router mới |
| remoteEntry type | `type: 'module'` trong remotes config | `remoteEntry.js` của Vite là ES Module, cần `<script type="module">` |

---

## 2. Cấu trúc thư mục

```
micro-frontend/
├── remotes.config.js        # URL registry tập trung cho shared + 6 MFE remotes
├── pnpm-workspace.yaml      # 8 workspace packages
├── package.json             # Root: script start + build
│
├── shared/                  # MF remote package — port 3004
│   ├── index.html
│   ├── vite.config.js       # MF remote server :3004 — exposes ui/auth/PermissionGate/ThemeContext
│   └── src/
│       ├── auth.js          # getUser/setUser/getToken/hasPermission/…
│       ├── ThemeContext.jsx # ThemeProvider + useTheme — dark/light mode cross-MFE
│       ├── utils/
│       │   └── permissions.js  # ROLE_PERMISSIONS map, getPermissionsForRole()
│       ├── components/
│       │   └── PermissionGate.jsx  # Gate UI dựa trên role/permission
│       └── ui/
│           ├── index.js     # Re-export tất cả UI components
│           ├── Button.jsx
│           ├── Card.jsx     # Card, CardHeader
│           ├── Badge.jsx    # StatusBadge
│           ├── Spinner.jsx  # PageSpinner
│           ├── Skeleton.jsx
│           └── Toast.jsx    # useToast hook
│
├── shell/                   # Host app — port 3000
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx         # ReactDOM.createRoot + HashRouter
│       ├── App.jsx          # Routes + ErrorBoundary + lazy MFE imports
│       ├── AuthContext.jsx  # React Context + localStorage listener
│       ├── styles.css
│       └── components/
│           ├── Nav.jsx          # Navigation + prefetch on hover + logout
│           └── ProtectedRoute.jsx  # Redirect /login nếu chưa auth
│
├── mfe-auth/     :3001  # Login form + demo role selector
├── mfe-accounts/ :3002  # AccountList → AccountDetail → TransactionList
├── mfe-transfer/ :3003  # TransferDashboard → NewTransfer → TransferHistory
├── mfe-profile/  :3005  # ProfilePage → EditProfile → SecuritySettings
├── mfe-loans/    :3006  # LoanList → LoanDetail → PaymentSchedule
└── mfe-cards/    :3007  # CardList → CardDetail
```

Mỗi MFE có cấu trúc sau:

```
mfe-xxx/
├── index.html               # Vite yêu cầu ở root (dùng khi chạy standalone)
├── vite.config.js           # federation config + resolve.alias + server.origin
├── package.json             # scripts: start / build / preview
└── src/
    ├── main.jsx             # Standalone entry — HashRouter + ReactDOM.createRoot
    ├── App.jsx              # Standalone wrapper — hiện banner màu vàng
    ├── styles.css
    ├── api/                 # Mock API functions (thay bằng real endpoint)
    └── components/
        ├── XxxApp.jsx       # ← EXPOSED qua MF — dùng <Routes> không có <Router>
        ├── XxxList.jsx      # Route index
        ├── XxxDetail.jsx    # lazy loaded
        └── …
```

---

## 3. Cấu hình Module Federation

### Shell (host) — `shell/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import remotes from '../remotes.config.js';

export default defineConfig({
  base: process.env.PUBLIC_URL || '/',
  plugins: [
    react(),
    federation({ dts: false,
      name: 'shell',
      remotes,    // object format { type:'module', name, entry } — xem remotes.config.js
      shared: {
        react:              { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
      },
    }),
  ],
  server:  { port: 3000, cors: true },
  preview: { port: 3000, cors: true },
  build:   { target: 'esnext' },
});
```

### MFE (remote) — ví dụ `mfe-accounts/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import remotes from '../remotes.config.js';

export default defineConfig({
  base: process.env.PUBLIC_URL || '/',
  plugins: [
    react(),
    federation({ dts: false,
      name: 'mfe_accounts',
      filename: 'remoteEntry.js',
      exposes: {
        './AccountsApp': './src/components/AccountsApp',
      },
      remotes: { shared: remotes.shared },   // load shared/ui, shared/auth, shared/PermissionGate từ MF runtime
      shared: {
        react:                   { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom':             { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom':      { singleton: true, requiredVersion: '^6.22.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.28.0' },
      },
    }),
  ],
  server:  { port: 3002, cors: true, origin: 'http://localhost:3002' },
  preview: { port: 3002, cors: true },
  build:   { target: 'esnext' },
});
```

**Lưu ý quan trọng:**
- `dts: false` — tắt TypeScript declaration generation (project thuần JS, không cần)
- `server.origin` — Vite cần biết absolute URL khi serve assets cross-origin
- `build.target: 'esnext'` — bắt buộc cho `@module-federation/vite` (dùng ES features hiện đại)

### `remotes.config.js` — URL registry tập trung

```js
const base  = process.env.BASE_GH_PAGES;
const local = (port) => `http://localhost:${port}/remoteEntry.js`;
const pages = (path) => `${base}/${path}/remoteEntry.js`;

// type: 'module' — remoteEntry.js của Vite là ESM (có import statement).
// Nếu dùng plain URL string, MF runtime load bằng <script> classic → SyntaxError.
const remote = (name, entry) => ({ type: 'module', name, entry });

module.exports = {
  shared:       remote('shared',       process.env.SHARED_URL       || (base ? pages('shared')       : local(3004))),
  mfe_auth:     remote('mfe_auth',     process.env.MFE_AUTH_URL     || (base ? pages('mfe-auth')     : local(3001))),
  mfe_accounts: remote('mfe_accounts', process.env.MFE_ACCOUNTS_URL || (base ? pages('mfe-accounts') : local(3002))),
  mfe_transfer: remote('mfe_transfer', process.env.MFE_TRANSFER_URL || (base ? pages('mfe-transfer') : local(3003))),
  mfe_profile:  remote('mfe_profile',  process.env.MFE_PROFILE_URL  || (base ? pages('mfe-profile')  : local(3005))),
  mfe_loans:    remote('mfe_loans',    process.env.MFE_LOANS_URL    || (base ? pages('mfe-loans')    : local(3006))),
  mfe_cards:    remote('mfe_cards',    process.env.MFE_CARDS_URL    || (base ? pages('mfe-cards')    : local(3007))),
};
```

### Bảng exposed modules

| MFE | Exposed | Import trong shell |
|-----|---------|-------------------|
| mfe-auth | `./Login`, `./UserProfile` | `import('mfe_auth/Login')` |
| mfe-accounts | `./AccountsApp` | `import('mfe_accounts/AccountsApp')` |
| mfe-transfer | `./TransferApp` | `import('mfe_transfer/TransferApp')` |
| mfe-cards | `./CardsApp` | `import('mfe_cards/CardsApp')` |
| mfe-loans | `./LoansApp` | `import('mfe_loans/LoansApp')` |
| mfe-profile | `./ProfileApp`, `./ProfilePage` | `import('mfe_profile/ProfileApp')` |

---

## 4. Routing — Shell + Intra-MFE

### Shell lazy import và route mounting

```jsx
// shell/src/App.jsx
const Login       = lazy(() => import('mfe_auth/Login'));
const AccountsApp = lazy(() => import('mfe_accounts/AccountsApp'));
const TransferApp = lazy(() => import('mfe_transfer/TransferApp'));
const CardsApp    = lazy(() => import('mfe_cards/CardsApp'));
const LoansApp    = lazy(() => import('mfe_loans/LoansApp'));
const ProfileApp  = lazy(() => import('mfe_profile/ProfileApp'));

// Mỗi MFE được wrap ErrorBoundary + Suspense
const mfe = (name, element) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback name={name} />}>
      {element}
    </Suspense>
  </ErrorBoundary>
);

<Routes>
  <Route path="/"          element={<Navigate to="/accounts" replace />} />
  <Route path="/login"     element={mfe('Đăng nhập', <Login />)} />
  <Route path="/accounts/*" element={<ProtectedRoute>{mfe('Tài khoản',  <AccountsApp />)}</ProtectedRoute>} />
  <Route path="/transfer/*" element={<ProtectedRoute>{mfe('Chuyển tiền', <TransferApp />)}</ProtectedRoute>} />
  <Route path="/cards/*"    element={<ProtectedRoute>{mfe('Thẻ',         <CardsApp />)}</ProtectedRoute>} />
  <Route path="/loans/*"    element={<ProtectedRoute>{mfe('Vay vốn',     <LoansApp />)}</ProtectedRoute>} />
  <Route path="/profile/*"  element={<ProtectedRoute>{mfe('Hồ sơ',       <ProfileApp />)}</ProtectedRoute>} />
</Routes>
```

### Intra-MFE routing — MFE tự quản lý sub-routes

Mỗi `*App` component exposed qua MF dùng `<Routes>` (không có `<Router>`). Router context (`HashRouter`) được cung cấp bởi shell.

```jsx
// mfe-accounts/src/components/AccountsApp.jsx
const AccountDetail   = lazy(() => import('./AccountDetail'));
const TransactionList = lazy(() => import('./TransactionList'));

export default function AccountsApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route index element={<AccountList />} />
        <Route
          path=":id"
          element={<Suspense fallback={<PageSpinner label="Đang tải tài khoản..." />}><AccountDetail /></Suspense>}
        />
        <Route
          path=":id/transactions"
          element={<Suspense fallback={<PageSpinner label="Đang tải lịch sử..." />}><TransactionList /></Suspense>}
        />
      </Routes>
    </QueryClientProvider>
  );
}
```

> **Nguyên tắc bắt buộc:** Shell khai báo `path="/accounts/*"` (có `/*`) để React Router pass phần còn lại xuống cho MFE. MFE dùng `path=":id"` (relative, không có `/`).

### Bảng route đầy đủ

| URL | MFE | Component | Auth |
|-----|-----|-----------|------|
| `/` | shell | → redirect `/accounts` | — |
| `/login` | mfe-auth | `Login` | public |
| `/accounts` | mfe-accounts | `AccountList` | required |
| `/accounts/:id` | mfe-accounts | `AccountDetail` (lazy) | required |
| `/accounts/:id/transactions` | mfe-accounts | `TransactionList` (lazy) | required |
| `/transfer` | mfe-transfer | `TransferDashboard` | required |
| `/transfer/new` | mfe-transfer | `NewTransfer` (lazy) | required |
| `/transfer/history` | mfe-transfer | `TransferHistory` (lazy) | required |
| `/cards` | mfe-cards | `CardList` | required |
| `/cards/:id` | mfe-cards | `CardDetail` (lazy) | required |
| `/loans` | mfe-loans | `LoanList` | required |
| `/loans/:id` | mfe-loans | `LoanDetail` (lazy) | required |
| `/loans/:id/schedule` | mfe-loans | `PaymentSchedule` (lazy) | required |
| `/profile` | mfe-profile | `ProfilePage` | required |
| `/profile/edit` | mfe-profile | `EditProfile` (lazy) | required |
| `/profile/security` | mfe-profile | `SecuritySettings` (lazy) | required |

### ProtectedRoute

```jsx
// shell/src/components/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const user     = useAuth();          // đọc từ AuthContext
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
```

Sau khi login thành công, `Login.jsx` navigate đến `location.state?.from?.pathname || '/accounts'` để quay lại trang ban đầu.

---

## 5. Auth — localStorage + Custom Event

Không dùng Zustand store hay runtime MF remote cho auth. State lưu trong `localStorage`, sync qua DOM event.

```
mfe-auth/Login                        shell/AuthContext + Nav + ProtectedRoute
       │                                          │
       ├─ setUser({ name, customerId,             │
       │            role, branch, … })            │
       ├─ setToken('mock-jwt-' + Date.now())      │
       └─ dispatchEvent('auth:changed') ─────────►├─ handler() re-reads localStorage
                                                  ├─ setUser(newUser) → re-render
                                                  ├─ Nav: hiện tên + avatar + badge role
                                                  └─ ProtectedRoute: cho qua
```

### AuthContext — shell

```jsx
// shell/src/AuthContext.jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('vietbank_user') || 'null')
  );

  useEffect(() => {
    const handler = () =>
      setUser(JSON.parse(localStorage.getItem('vietbank_user') || 'null'));
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

### Helpers từ `shared/src/auth.js`

```js
import { getUser, setUser, getToken, setToken,
         clearAuth, isAuthenticated, hasPermission } from 'shared/auth';

// Login
setUser({ name: 'Nguyễn Văn Demo', customerId: '0021001', role: 'PREMIUM', … });
setToken('mock-jwt-1234');
window.dispatchEvent(new CustomEvent('auth:changed'));

// Logout
clearAuth();
window.dispatchEvent(new CustomEvent('auth:changed'));

// Check quyền
if (hasPermission('transfer:international')) { /* … */ }

// Đọc user trong MFE (không cần import từ shell)
const user = getUser();   // { name, role, customerId, branch, … } | null
```

### Payload user object

```js
{
  name:       'Nguyễn Văn Demo',
  customerId: '0021001',
  email:      'demo@vietbank.vn',
  phone:      '0901 234 567',
  branch:     'Chi nhánh TP.HCM',
  role:       'CUSTOMER' | 'PREMIUM' | 'BUSINESS',
}
```

---

## 6. Data Fetching — React Query per MFE

Mỗi MFE tạo `QueryClient` riêng, độc lập hoàn toàn. Đây là pattern của Zalando, Klarna, DAZN trong production.

```jsx
// mfe-accounts/src/components/AccountsApp.jsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});
// staleTime 5 phút: navigate qua lại không trigger refetch

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
const { data: accounts = [], isLoading } = useQuery({
  queryKey: ['accounts'],
  queryFn: fetchAccounts,  // mock 400ms delay, thay bằng real API
});
```

Mock API nằm trong `mfe-xxx/src/api/` — chỉ cần thay `queryFn`, không ảnh hưởng MFE khác.

---

## 7. Shared Package — MF Runtime Remote

`shared/` là **Module Federation remote** riêng, chạy tại port 3004. Tất cả MFE load `shared/ui`, `shared/auth`, `shared/PermissionGate` qua MF runtime — không bundle vào mỗi MFE.

### Cấu hình shared remote (`shared/vite.config.js`)

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  base: process.env.PUBLIC_URL || '/',
  plugins: [
    react(),
    federation({
      dts: false,
      name: 'shared',
      filename: 'remoteEntry.js',
      exposes: {
        './ui':             './src/ui/index.js',
        './auth':           './src/auth.js',
        './PermissionGate': './src/components/PermissionGate.jsx',
        './ThemeContext':   './src/ThemeContext.jsx',
      },
      shared: {
        react:       { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
      },
    }),
  ],
  server:  { port: 3004, cors: true, origin: 'http://localhost:3004' },
  preview: { port: 3004, cors: true },
  build:   { target: 'esnext' },
});
```

### Dùng trong MFE — import path giống nhau

```jsx
import { Card, CardHeader, Button, PageSpinner, StatusBadge, useToast } from 'shared/ui';
import { getUser, setUser, hasPermission, clearAuth } from 'shared/auth';
import PermissionGate from 'shared/PermissionGate';
import { ThemeProvider, useTheme } from 'shared/ThemeContext';
// MF runtime tự fetch từ localhost:3004/remoteEntry.js (hoặc GitHub Pages /shared/)
```

### UI Components (`shared/src/ui/`)

| Component | Props / API |
|-----------|------------|
| `<Button>` | `variant` (primary/secondary/danger/ghost), `size`, `loading`, `disabled` |
| `<Card>` | container với shadow |
| `<CardHeader>` | `title`, `subtitle`, `action` — tiêu đề section trong Card |
| `<Divider>` | `margin` — đường kẻ ngang ngăn cách |
| `<Badge>` | `count`, `max`, `color`, `size` — badge số đếm |
| `<StatusBadge>` | `label`, `color` (blue/green/yellow/purple/…) — badge trạng thái |
| `<PageSpinner>` | `label` — full-page loading indicator |
| `<SkeletonCard>` `<SkeletonRow>` `<SkeletonList>` | placeholder loading |
| `<ToastProvider>` | wrap component tree cần dùng `useToast` |
| `useToast()` | `{ show }` — `show(message, type, duration)` hiển thị toast notification |
| `<ThemeProvider>` | wrap root app — quản lý dark/light mode, persist vào localStorage |
| `useTheme()` | `{ isDark, toggle }` — toggle dark/light từ bất kỳ component nào |

### Lợi ích của MF runtime remote

| | Build-time alias (cũ) | MF runtime remote (hiện tại) |
|-|-----------------------|------------------------------|
| Shared UI trong bundle MFE | ~7KB × 6 MFE = ~42KB duplicate | Không — chỉ có ở shared/dist |
| Update shared → cần làm gì | Rebuild tất cả 6 MFE | Chỉ deploy shared, MFE nhận ngay |
| Shared server phải chạy | Không | Có — MFE crash nếu shared offline |

### Phát triển shared components

```bash
pnpm --filter shared start   # http://localhost:3004
```

Khi thay đổi file trong `shared/src/`, Vite HMR tự cập nhật — không cần restart MFE devserver.

---

## 8. Authorization — RBAC

### Phân quyền theo role

| Permission | CUSTOMER | PREMIUM | BUSINESS |
|-----------|:--------:|:-------:|:--------:|
| `accounts:view` | ✓ | ✓ | ✓ |
| `accounts:download` | ✓ | ✓ | ✓ |
| `accounts:manage` | | | ✓ |
| `transfer:domestic` | ✓ | ✓ | ✓ |
| `transfer:international` | | ✓ | ✓ |
| `transfer:bulk` | | | ✓ |
| `cards:view` | ✓ | ✓ | ✓ |
| `cards:freeze` | ✓ | ✓ | ✓ |
| `cards:change_pin` | ✓ | ✓ | ✓ |
| `cards:manage_limit` | | ✓ | ✓ |
| `loans:view` | ✓ | ✓ | ✓ |
| `loans:apply` | | ✓ | ✓ |
| `loans:pay_early` | | ✓ | ✓ |
| `profile:view` | ✓ | ✓ | ✓ |
| `profile:edit` | ✓ | ✓ | ✓ |
| `profile:security` | ✓ | ✓ | ✓ |

### `PermissionGate` component

```jsx
import PermissionGate from 'shared/PermissionGate';

// Ẩn hoàn toàn khi không có quyền
<PermissionGate permission="transfer:international">
  <InternationalTransferForm />
</PermissionGate>

// Hiện nút bị khóa với badge "PREMIUM" khi không có quyền
<PermissionGate permission="transfer:international" showLocked requiredRole="PREMIUM">
  <InternationalTransferForm />
</PermissionGate>

// Custom fallback
<PermissionGate permission="loans:apply" fallback={<UpgradePrompt />}>
  <LoanApplicationForm />
</PermissionGate>
```

### Check trực tiếp

```js
import { hasPermission, getPermissions } from 'shared/auth';

// Check single permission
if (hasPermission('accounts:manage')) { /* chỉ BUSINESS */ }

// Lấy toàn bộ permissions của user hiện tại
const perms = getPermissions();  // string[]
```

---

## 9. Performance & Advanced Techniques

### 9.1 Dark mode — ThemeContext + CSS Custom Properties

Dark mode được implement qua `shared/ThemeContext` — exposed từ MF runtime remote, dùng được ở mọi MFE mà không cần props drilling.

```jsx
// shared/src/ThemeContext.jsx
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('vietbank_theme') === 'dark'
  );

  useEffect(() => {
    // Set data-theme lên <html> → CSS custom properties tự kích hoạt
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('vietbank_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

CSS custom properties được định nghĩa trong `shell/src/styles.css`:

```css
:root {
  --bg-page:    #f8fafc;
  --bg-card:    #ffffff;
  --text-main:  #0f172a;
  --text-muted: #64748b;
  --border:     #e2e8f0;
}

[data-theme="dark"] {
  --bg-page:    #0f172a;
  --bg-card:    #1e293b;
  --text-main:  #f1f5f9;
  --text-muted: #94a3b8;
  --border:     #334155;
}

.app {
  background: var(--bg-page);
  color: var(--text-main);
  transition: background 0.2s, color 0.2s;
}
```

Dùng toggle từ bất kỳ component nào:

```jsx
// shell/src/components/Nav.jsx
import { useTheme } from 'shared/ThemeContext';

const { isDark, toggle } = useTheme();
<button onClick={toggle}>{isDark ? '☀️' : '🌙'}</button>
```

**Tại sao dùng `data-theme` + CSS vars thay vì class?** CSS custom properties tự cascade xuống tất cả elements — không cần truyền prop, không cần inline style override. `data-theme` trên `<html>` ảnh hưởng toàn bộ trang kể cả nội dung MFE.

---

### 9.2 React 18 Concurrent — `useTransition` + `useDeferredValue`

Áp dụng trong `mfe-accounts/src/components/TransactionList.jsx`:

**`useTransition`** — wrap state update không khẩn cấp (filter switch) để UI input/scroll không bị block:

```jsx
const [isPending, startTransition] = useTransition();
const [filter, setFilter] = useState('all');

const handleFilter = useCallback((key) => {
  startTransition(() => setFilter(key));
}, []);

// isPending = true trong lúc React đang re-render → hiện visual feedback
<button style={{ opacity: isPending ? 0.6 : 1 }}>Tất cả</button>
```

**`useDeferredValue`** — search input cập nhật ngay (không lag), list filter chạy sau khi browser rảnh:

```jsx
const [searchText, setSearchText] = useState('');
const deferredSearch = useDeferredValue(searchText);
const isSearchStale  = searchText !== deferredSearch; // true trong lúc defer

// Input dùng searchText (cập nhật ngay)
<input value={searchText} onChange={(e) => setSearchText(e.target.value)} />

// Filter list dùng deferredSearch (chạy sau)
const filtered = useMemo(() => {
  return allTxns.filter((t) => t.desc.toLowerCase().includes(deferredSearch.toLowerCase()));
}, [allTxns, deferredSearch]);

// Hiện "đang lọc..." khi deferred chưa bắt kịp
{isSearchStale && <span>đang lọc...</span>}
```

| Hook | Dùng khi | Cách hoạt động |
|------|----------|----------------|
| `useTransition` | User click button → state update nặng | React ưu tiên input events, defer state update |
| `useDeferredValue` | Controlled input → tính toán đắt phụ thuộc vào value | Giữ value cũ cho expensive render, dùng value mới khi browser rảnh |

---

### 9.3 Virtual Scrolling — `@tanstack/react-virtual`

Với danh sách lớn (120+ giao dịch), DOM chỉ render rows đang visible trong viewport — không render toàn bộ list:

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef(null);

const virtualizer = useVirtualizer({
  count:            filtered.length,   // tổng số items (kể cả chưa render)
  getScrollElement: () => parentRef.current,
  estimateSize:     () => 80,          // chiều cao ước tính mỗi row (px)
  overscan:         5,                 // render thêm 5 rows ngoài viewport để scroll mượt
});

// Container fixed height với overflow scroll
<div ref={parentRef} style={{ height: 480, overflowY: 'auto' }}>
  {/* Div cao bằng tổng chiều cao tất cả rows — tạo scrollbar đúng kích thước */}
  <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
    {virtualizer.getVirtualItems().map((vItem) => (
      <div
        key={vItem.key}
        ref={virtualizer.measureElement}   // đo chiều cao thực của row sau khi render
        style={{
          position:  'absolute',
          top:       0,
          transform: `translateY(${vItem.start}px)`,  // dịch đến vị trí đúng
        }}
      >
        <TransactionRow tx={filtered[vItem.index]} />
      </div>
    ))}
  </div>
</div>
```

Khi scroll qua 120 rows: DOM chỉ có ~8 nodes thay vì 120. `overscan: 5` render sẵn 5 rows trên/dưới viewport để tránh flash khi scroll nhanh.

---

### 9.4 React Query Advanced

#### `useInfiniteQuery` — load dữ liệu theo trang

Thay vì load 1 lần rồi paginate ở client, `useInfiniteQuery` fetch từng trang và gộp kết quả:

```js
// mfe-accounts/src/api/accounts.js
export const fetchTransactionPage = async ({ accountId, pageParam = 0 }) => {
  await delay(300);
  const all = MOCK_TRANSACTIONS[accountId] || [];
  return {
    items:    all.slice(pageParam * 20, (pageParam + 1) * 20),
    nextPage: (pageParam + 1) * 20 < all.length ? pageParam + 1 : undefined,
    total:    all.length,
  };
};
```

```jsx
// mfe-accounts/src/components/TransactionList.jsx
const {
  data, fetchNextPage, hasNextPage, isFetchingNextPage,
} = useInfiniteQuery({
  queryKey:         ['transactions', id],
  queryFn:          ({ pageParam }) => fetchTransactionPage({ accountId: id, pageParam }),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextPage,  // undefined = không còn trang nào
});

// Gộp tất cả trang đã load
const allTxns = useMemo(
  () => data?.pages.flatMap((p) => p.items) ?? [],
  [data],
);

// Nút tải thêm
{hasNextPage && (
  <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
    {isFetchingNextPage ? 'Đang tải...' : `Tải thêm (còn ${total - allTxns.length})`}
  </button>
)}
```

#### `useMutation` + Optimistic Update

Khi user submit chuyển tiền, item xuất hiện ngay trong `TransferHistory` trước khi API trả về. Nếu API lỗi → rollback tự động:

```jsx
// mfe-transfer/src/components/NewTransfer.jsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: submitTransfer,

  // 1. Chạy TRƯỚC API call — thêm item vào cache ngay lập tức
  onMutate: async (newForm) => {
    await queryClient.cancelQueries({ queryKey: ['transfer-history'] });
    const previousHistory = queryClient.getQueryData(['transfer-history']);

    queryClient.setQueryData(['transfer-history'], (old = []) => [
      { id: `optimistic-${Date.now()}`, ...newForm, status: 'pending', _optimistic: true },
      ...old,
    ]);

    return { previousHistory };  // context để rollback
  },

  // 2. Rollback nếu API thất bại
  onError: (_err, _form, context) => {
    queryClient.setQueryData(['transfer-history'], context.previousHistory);
  },

  // 3. Luôn invalidate sau khi xong — fetch lại data thật từ server
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['transfer-history'] });
  },
});
```

`TransferHistory` đọc từ cùng `queryKey: ['transfer-history']` nên tự nhận optimistic item:

```jsx
// mfe-transfer/src/components/TransferHistory.jsx
const { data: history = [] } = useQuery({
  queryKey: ['transfer-history'],
  queryFn:  fetchTransferHistory,
});

// Item optimistic có flag _optimistic: true → render "Đang xử lý..."
{h._optimistic && <span>Đang xử lý...</span>}
```

**Flow optimistic update:**

```
User nhấn "Xác nhận"
  │
  ├─ onMutate: cache['transfer-history'] = [optimisticItem, ...old]
  │            TransferHistory re-render ngay — hiện item mờ "Đang xử lý..."
  │
  ├─ API call (1.2s delay mock)
  │    │
  │    ├─ Success → onSettled: invalidate → refetch → item thật thay thế optimistic
  │    │
  │    └─ Error → onError: rollback cache về previousHistory → item biến mất
  │               onSettled: invalidate → refetch để chắc chắn đồng bộ
```

---

### 9.5 Các kỹ thuật performance khác

#### Prefetch MFE khi hover nav link

```jsx
// shell/src/components/Nav.jsx
const NAV_LINKS = [
  { to: '/accounts', label: 'Tài khoản',   prefetch: () => import('mfe_accounts/AccountsApp') },
  { to: '/transfer', label: 'Chuyển tiền', prefetch: () => import('mfe_transfer/TransferApp') },
  { to: '/cards',    label: 'Thẻ',         prefetch: () => import('mfe_cards/CardsApp') },
  { to: '/loans',    label: 'Vay vốn',     prefetch: () => import('mfe_loans/LoansApp') },
];

<Link onMouseEnter={prefetch}>…</Link>
// Khi user hover vào nav link, MFE đã được download trước → navigate instant
```

#### Lazy load sub-pages trong MFE

```jsx
// mfe-accounts/src/components/AccountsApp.jsx
const AccountDetail   = lazy(() => import('./AccountDetail'));
const TransactionList = lazy(() => import('./TransactionList'));
// Vite tự động code-split, chỉ download khi navigate đến
```

#### React.memo + useMemo + useCallback

```jsx
// Tránh re-render khi virtualizer scroll — chỉ re-render khi props thực sự thay đổi
const TransactionRow = memo(function TransactionRow({ tx }) { … });

// Tính toán đắt chỉ chạy khi dependency thay đổi
const filtered = useMemo(() => allTxns.filter(…), [allTxns, filter, deferredSearch]);

// Stable reference cho event handler — tránh re-render child
const handleFilter = useCallback((key) => { startTransition(() => setFilter(key)); }, []);
```

#### React Query staleTime

```js
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },  // 5 phút
});
// Navigate /accounts → /transfer → /accounts: không refetch, dùng cache
```

#### Chunk caching strategy

| File | Caching |
|------|---------|
| `assets/main-[hash8].js` | `max-age=31536000, immutable` (hash thay đổi khi code thay đổi) |
| `assets/[chunk]-[hash8].js` | `max-age=31536000, immutable` |
| `remoteEntry.js` | `max-age=0, must-revalidate` (không có hash, phải check mỗi lần) |

---

## 10. Chạy local

### Yêu cầu

- Node.js 18+
- pnpm 10+

### Cài đặt

```bash
git clone https://github.com/MinhChien96/micro-frontend.git
cd micro-frontend
pnpm install
```

### Chạy toàn bộ stack

```bash
pnpm start
```

Khởi động 8 devserver song song:

```
[shared]   VITE ready in ~500ms  →  http://localhost:3004  (shared MF remote)
[auth]     VITE ready in ~600ms  →  http://localhost:3001  (mfe-auth)
[accounts] VITE ready in ~650ms  →  http://localhost:3002  (mfe-accounts)
[transfer] VITE ready in ~650ms  →  http://localhost:3003  (mfe-transfer)
[profile]  VITE ready in ~620ms  →  http://localhost:3005  (mfe-profile)
[loans]    VITE ready in ~650ms  →  http://localhost:3006  (mfe-loans)
[cards]    VITE ready in ~660ms  →  http://localhost:3007  (mfe-cards)
[shell]    VITE ready in ~660ms  →  http://localhost:3000  ← mở tại đây
```

> Shared server (:3004) phải chạy trước khi MFE fetch `shared/ui`. Nếu chạy MFE riêng lẻ mà thiếu shared server, các components sẽ resolve thành `undefined`.

### Chạy từng MFE độc lập (standalone mode)

Mỗi MFE có `src/main.jsx` + `src/App.jsx` riêng để dev/test độc lập:

```bash
pnpm --filter mfe-auth     start   # http://localhost:3001
pnpm --filter mfe-accounts start   # http://localhost:3002
pnpm --filter mfe-transfer start   # http://localhost:3003
pnpm --filter mfe-profile  start   # http://localhost:3005
pnpm --filter mfe-loans    start   # http://localhost:3006
pnpm --filter mfe-cards    start   # http://localhost:3007
```

Khi mở browser, sẽ thấy banner vàng "Standalone — mfe-xxx" ở trên cùng. MFE chạy hoàn toàn độc lập với HashRouter riêng — không cần shell hay các MFE khác.

```
┌─ Standalone — mfe-accounts :3002 ─────────────────────┐  ← banner vàng
│                                                        │
│  Danh sách tài khoản                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ Tài khoản thanh toán │  │ Tài khoản tiết kiệm  │    │
│  └──────────────────────┘  └──────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

### Build production

```bash
pnpm build          # build tất cả 8 packages
pnpm -r run build   # tương đương
```

Output của mỗi package:

```
mfe-accounts/dist/
├── remoteEntry.js          # MF entry — không có hash, phải serve với no-cache
├── assets/
│   ├── AccountsApp-[hash].js
│   ├── AccountDetail-[hash].js   # lazy chunk
│   └── TransactionList-[hash].js # lazy chunk
└── index.html              # standalone entry
```

### Preview production build

```bash
# Chạy từng package ở production mode
pnpm --filter shell       preview   # :3000
pnpm --filter mfe-auth    preview   # :3001
pnpm --filter mfe-accounts preview  # :3002
# … tương tự các MFE khác
```

---

## 11. CI/CD — GitHub Actions

### Tổng quan workflow

```
push to main
     │
     ├─ changed: shared/** hoặc remotes.config.js hoặc pnpm-lock.yaml
     │   └─► deploy-all.yml  ── rebuild + deploy toàn bộ 8 packages
     │
     ├─ changed: mfe-auth/**
     │   └─► deploy-mfe-auth.yml  ── build shared + mfe-auth, deploy chỉ mfe-auth/
     │
     ├─ changed: mfe-accounts/**
     │   └─► deploy-mfe-accounts.yml ── build shared + mfe-accounts, deploy mfe-accounts/
     │
     ├─ changed: shell/**
     │   └─► deploy-shell.yml ── build shared + shell, deploy shell (root Pages)
     │
     └─ changed: .github/workflows/**
         └─► deploy-all.yml ── full rebuild
```

### Per-MFE deploy (ví dụ `deploy-mfe-accounts.yml`)

Tách thành 2 job để tránh race condition khi nhiều MFE deploy đồng thời:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'mfe-accounts/**'

concurrency:
  group: deploy-mfe-accounts   # ngăn cùng workflow chạy song song
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm install --frozen-lockfile

      - name: Build shared        # cần build shared trước để MFE resolve remoteEntry URL
        run: pnpm --filter shared build
        env:
          PUBLIC_URL: ${{ env.BASE }}/shared/

      - name: Build mfe-accounts
        run: pnpm --filter mfe-accounts build
        env:
          PUBLIC_URL: ${{ env.BASE }}/mfe-accounts/
          BASE_GH_PAGES: ${{ env.BASE }}

      - uses: actions/upload-artifact@v4
        with:
          name: mfe-accounts-dist
          path: mfe-accounts/dist
          retention-days: 1

  deploy:
    needs: build
    runs-on: ubuntu-latest
    concurrency:
      group: deploy-gh-pages      # shared với mọi workflow — xếp hàng, không tranh nhau push gh-pages
      cancel-in-progress: false
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: mfe-accounts-dist
          path: mfe-accounts/dist

      - uses: peaceiris/actions-gh-pages@v4
        with:
          publish_dir: ./mfe-accounts/dist
          destination_dir: mfe-accounts
          keep_files: true    # chỉ update mfe-accounts/, giữ nguyên các folder khác
```

**Tại sao cần 2 job?** Khi merge PR thay đổi nhiều MFE, các workflow build song song — nhưng nếu cùng push lên `gh-pages` thì bị reject ("cannot lock ref"). `deploy` job dùng shared concurrency group `deploy-gh-pages, cancel-in-progress: false` → xếp hàng tuần tự, không race condition.

### Full deploy (`deploy-all.yml`)

Build tất cả theo thứ tự, assemble vào 1 thư mục rồi deploy:

```yaml
steps:
  - build shared, mfe-auth, mfe-accounts, mfe-transfer,
    mfe-cards, mfe-loans, mfe-profile, shell  (tuần tự để tránh conflict)

  - name: Assemble
    run: |
      mkdir -p pages
      cp -r shell/dist/.        pages/           # index.html + shell assets
      cp -r mfe-auth/dist       pages/mfe-auth
      cp -r mfe-accounts/dist   pages/mfe-accounts
      cp -r mfe-transfer/dist   pages/mfe-transfer
      cp -r mfe-cards/dist      pages/mfe-cards
      cp -r mfe-loans/dist      pages/mfe-loans
      cp -r mfe-profile/dist    pages/mfe-profile
      touch pages/.nojekyll

  - uses: peaceiris/actions-gh-pages@v4
    with:
      publish_dir: ./pages
      keep_files: false   # full replace — xóa sạch, deploy lại toàn bộ
```

### GitHub Pages layout

```
https://minhchien96.github.io/micro-frontend/
├── index.html                      # shell
├── assets/                         # shell chunks
├── mfe-auth/
│   ├── remoteEntry.js
│   └── assets/
├── mfe-accounts/
│   ├── remoteEntry.js
│   └── assets/
├── mfe-transfer/ …
├── mfe-cards/    …
├── mfe-loans/    …
└── mfe-profile/  …
```

### Tại sao `shared` thay đổi → `deploy-all`?

`deploy-shared.yml` (chỉ deploy shared) và `deploy-all.yml` đều trigger khi `shared/**` thay đổi. `deploy-all` đảm bảo shared/dist được đặt đúng vị trí trong cây Pages cùng với toàn bộ MFE. Nếu chỉ chạy `deploy-shared`, cấu trúc folder `/shared/` trên Pages phải đã tồn tại — dùng `deploy-all` cho lần đầu hoặc khi cần rebuild toàn bộ.

---

## 12. Quy trình làm việc theo team

### Phát triển feature mới

```bash
# 1. Chạy standalone — không cần các MFE khác
pnpm --filter mfe-accounts start
# Mở http://localhost:3002, dev với HMR

# 2. Test tích hợp với shell — chạy full stack
pnpm start
# Mở http://localhost:3000

# 3. Commit và push
git add mfe-accounts/
git commit -m "feat: thêm filter giao dịch theo ngày"
git push
# → deploy-mfe-accounts.yml tự động chạy (~60s) → live trên GitHub Pages
```

### Thay đổi shared components

```bash
# 1. Phát triển shared — HMR tự cập nhật, không cần restart
pnpm --filter shared start   # http://localhost:3004

# 2. Test trong full stack (MFE nhận shared update qua HMR)
pnpm start

# 3. Commit
git add shared/
git commit -m "feat: thêm variant danger cho Button"
git push
# → deploy-all.yml chạy — build shared + toàn bộ MFE (~3-4 phút)
# Sau khi deploy shared lên GitHub Pages, mọi MFE nhận update ngay khi user reload
```

### Concurrency — tránh conflict deploy

Hai tầng concurrency group để giải quyết hai vấn đề khác nhau:

**Tầng 1 — top-level (ngăn duplicate run của cùng workflow):**

| Workflow | Group | cancel-in-progress |
|----------|-------|--------------------|
| `deploy-all` | `deploy-pages` | `false` — full rebuild không bị interrupt |
| `deploy-shell` | `deploy-shell` | `true` |
| `deploy-mfe-auth` | `deploy-mfe-auth` | `true` |
| `deploy-mfe-accounts` | `deploy-mfe-accounts` | `true` |
| … (các MFE khác) | `deploy-mfe-{name}` | `true` |

**Tầng 2 — job-level `deploy` (ngăn race condition khi nhiều workflow push gh-pages cùng lúc):**

Tất cả job `deploy` dùng chung `group: deploy-gh-pages, cancel-in-progress: false` → xếp hàng tuần tự.

`remotes.config.js` thay đổi chỉ trigger `deploy-all` (không trigger per-MFE), tránh tình huống 8 workflows race nhau cùng một push.

---

## 13. Xử lý sự cố thường gặp

### `SyntaxError: Cannot use import statement outside a module`

`remoteEntry.js` của Vite là ES Module. MF runtime phải load nó bằng `<script type="module">`.

**Fix:** Dùng object format trong `remotes.config.js`:
```js
// SAI — plain URL string → classic <script>
mfe_auth: 'http://localhost:3001/remoteEntry.js'

// ĐÚNG — object với type:'module'
mfe_auth: { type: 'module', name: 'mfe_auth', entry: 'http://localhost:3001/remoteEntry.js' }
```

### `useNavigate() may be used only in the context of a <Router>`

Xảy ra khi chạy MFE standalone mà `src/main.jsx` thiếu `HashRouter`.

**Fix:** Wrap `App` trong `HashRouter`:
```jsx
// mfe-xxx/src/main.jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter><App /></HashRouter>
);
```

### MFE không render khi mount vào shell — lỗi routing

`react-router-dom` bị khởi tạo 2 lần (shell + MFE mỗi bên 1 instance).

**Fix:** Khai báo `singleton: true` trong `shared` của **cả** shell lẫn MFE:
```js
'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
```
MFE tuyệt đối không dùng `<BrowserRouter>` hay `<HashRouter>` trong exposed component — chỉ dùng `<Routes>`.

### Devserver crash: `Cannot read file 'tsconfig.json'`

`@module-federation/dts-plugin` fork worker để generate TypeScript types, crash vì không có `tsconfig.json`.

**Fix:** Thêm `dts: false` trong federation config:
```js
federation({ dts: false, name: 'mfe_xxx', … })
```

### `Element type is invalid: expected a string...but got: undefined`

Xảy ra khi shared server không chạy. MFE fetch `shared/remoteEntry.js` thất bại → component resolve thành `undefined` → React throw khi render.

**Fix:** Đảm bảo shared server đang chạy:
```bash
pnpm start           # khởi động shared cùng tất cả MFE
# hoặc riêng lẻ:
pnpm --filter shared start   # :3004
```

### Lỗi CORS khi shell fetch remoteEntry.js

Kiểm tra `server.cors: true` trong vite.config.js của MFE:

```bash
curl -I http://localhost:3002/remoteEntry.js
# Phải có: Access-Control-Allow-Origin: *
```

### Port bị chiếm sau khi kill process

```bash
lsof -ti :3002 | xargs kill -9
```

---

## 14. Công nghệ sử dụng

| Công nghệ | Version | Vai trò |
|-----------|---------|---------|
| [Vite](https://vitejs.dev/) | 6.4 | Build tool, HMR, dev server |
| [@module-federation/vite](https://github.com/module-federation/vite) | 1.15 | Module Federation plugin cho Vite |
| [React](https://react.dev/) | 18.3 | UI framework |
| [React Router](https://reactrouter.com/) | 6.22 | Client-side routing (HashRouter) |
| [TanStack React Query](https://tanstack.com/query) | 5.28 | Data fetching + cache, useInfiniteQuery, useMutation + optimistic update |
| [TanStack Virtual](https://tanstack.com/virtual) | 3.x | Virtual scrolling — chỉ render visible rows trong danh sách lớn |
| [pnpm](https://pnpm.io/) | 10 | Workspace package manager |
| [GitHub Actions](https://github.com/features/actions) | — | CI/CD |
| [GitHub Pages](https://pages.github.com/) | — | Hosting (static) |
| [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) | v4 | Deploy to GitHub Pages |
