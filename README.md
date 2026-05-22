# VietBank — Webpack 5 Module Federation

> Ứng dụng ngân hàng micro frontend hoàn chỉnh — minh họa kiến trúc Webpack 5 Module Federation với RBAC authorization, intra-MFE routing, shared Zustand store, và performance optimization.

**Live demo:** https://minhchien96.github.io/micro-frontend/
**Đăng nhập:** CIF `0021001` · Mật khẩu `123456` · Chọn role CUSTOMER / PREMIUM / BUSINESS

---

## Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Module Federation — Cấu hình cốt lõi](#module-federation--cấu-hình-cốt-lõi)
4. [Intra-MFE Routing](#intra-mfe-routing)
5. [Shared State với Zustand](#shared-state-với-zustand)
6. [Authorization — RBAC](#authorization--rbac)
7. [Shared UI Library](#shared-ui-library)
8. [Performance Optimization](#performance-optimization)
9. [Code Splitting & Lazy Load](#code-splitting--lazy-load)
10. [Chạy local](#chạy-local)
11. [CI/CD với GitHub Actions](#cicd-với-github-actions)
12. [Quy trình làm việc theo team](#quy-trình-làm-việc-theo-team)
13. [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)

---

## Tổng quan kiến trúc

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Runtime)                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         shell  (port 3000)                              │ │
│  │              Host App — HashRouter, ProtectedRoute, Orchestrator        │ │
│  │                                                                         │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐   │ │
│  │  │ mfe-auth │  │ mfe-accounts │  │ mfe-transfer│  │   mfe-cards    │   │ │
│  │  │  :3001   │  │    :3002     │  │    :3003    │  │     :3007      │   │ │
│  │  │  Login   │  │ AccountsApp  │  │ TransferApp │  │   CardsApp     │   │ │
│  │  └──────────┘  └──────────────┘  └─────────────┘  └────────────────┘   │ │
│  │                                                                         │ │
│  │  ┌────────────────────────┐  ┌──────────────────────────────────────┐   │ │
│  │  │      mfe-loans         │  │           mfe-profile                │   │ │
│  │  │        :3006           │  │              :3005                   │   │ │
│  │  │      LoansApp          │  │           ProfileApp                 │   │ │
│  │  └────────────────────────┘  └──────────────────────────────────────┘   │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │ │
│  │  │                     shared  (:3004)                             │    │ │
│  │  │  authStore (RBAC)  |  accountStore (persist)  |  UI Library     │    │ │
│  │  │  PermissionGate    |  SkeletonCard/List/Row                     │    │ │
│  │  └─────────────────────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Nguyên lý hoạt động

| Khái niệm | Giải thích |
|---|---|
| **Host (Shell)** | App chính, compose các MFE, quản lý top-level routing và auth guard |
| **Remote (MFE)** | App con tự chạy được, expose `*App` component ra ngoài qua `remoteEntry.js` |
| **remoteEntry.js** | File manifest do webpack tạo — shell fetch lúc runtime để biết MFE expose gì |
| **Shared modules** | React, Zustand, react-router-dom được share singleton — load 1 lần duy nhất |
| **`shared` MFE** | Package đặc biệt: state layer (stores) + UI library + authorization gate |

---

## Cấu trúc thư mục

```
micro-frontend/
│
├── remotes.config.js          # Trung tâm quản lý URL của tất cả MFE (localhost + GH Pages)
├── webpack.optimization.js    # Shared: contenthash, splitChunks config
├── pnpm-workspace.yaml        # Khai báo 8 workspace packages
├── .npmrc                     # shamefully-hoist + dedupe-peer-dependents
├── package.json               # Root scripts: start all, build all
│
├── shared/                    # Store + UI layer (port 3004)
│   └── src/
│       ├── store/
│       │   ├── authStore.js   # user, role, permissions[], login/logout, hasPermission()
│       │   └── accountStore.js# accounts[], setAccounts, getTotalBalance, getAccount (+ persist)
│       ├── utils/
│       │   └── permissions.js # ROLES, ROLE_PERMISSIONS, getPermissionsForRole()
│       ├── components/
│       │   └── PermissionGate.jsx  # Gate feature theo permission — exposed từ shared
│       └── ui/                # Shared UI Library
│           ├── Button.jsx     # 5 variants, 3 sizes
│           ├── Badge.jsx      # count badge + StatusBadge
│           ├── Card.jsx       # Card, CardHeader, Divider
│           ├── Spinner.jsx    # Spinner, PageSpinner
│           ├── Toast.jsx      # ToastProvider + useToast hook
│           ├── Skeleton.jsx   # SkeletonCard, SkeletonRow, SkeletonList
│           └── index.js       # re-export tất cả
│
├── shell/                     # Host app (port 3000)
│   └── src/
│       ├── App.jsx            # Routes: /, /login, /accounts/*, /transfer/*, /cards/*, /loans/*, /profile/*
│       └── components/
│           ├── Nav.jsx        # Selective Zustand subscribe, MFE prefetch on hover
│           └── ProtectedRoute.jsx  # Auth guard — redirect /login nếu chưa đăng nhập
│
├── mfe-auth/                  # Auth team (port 3001)
│   └── src/components/
│       └── Login.jsx          # CIF + password + role selector (CUSTOMER/PREMIUM/BUSINESS)
│
├── mfe-accounts/              # Accounts team (port 3002)
│   └── src/components/
│       ├── AccountsApp.jsx    # Expose: Routes cho /accounts/*
│       ├── AccountList.jsx    # React.memo(AccountItem)
│       ├── AccountDetail.jsx  # Lazy chunk — chi tiết + 5 giao dịch gần nhất
│       └── TransactionList.jsx# Lazy chunk — useMemo, useCallback, React.memo(TransactionRow)
│
├── mfe-transfer/              # Transfer team (port 3003)
│   └── src/components/
│       ├── TransferApp.jsx    # Expose: Routes cho /transfer/*
│       ├── TransferDashboard.jsx
│       ├── NewTransfer.jsx    # Lazy — 3-step wizard + PermissionGate quốc tế
│       └── TransferHistory.jsx# Lazy — useDebounce filter
│
├── mfe-cards/                 # Cards team (port 3007)
│   └── src/components/
│       ├── CardsApp.jsx       # Expose: Routes cho /cards/*
│       ├── CardList.jsx       # Danh sách thẻ debit/credit
│       └── CardDetail.jsx     # Lazy — lock/PIN/limit + PermissionGate hạn mức
│
├── mfe-loans/                 # Loans team (port 3006)
│   └── src/components/
│       ├── LoansApp.jsx       # Expose: Routes cho /loans/*
│       ├── LoanList.jsx       # PermissionGate cho "Đăng ký vay mới"
│       ├── LoanDetail.jsx     # Lazy chunk
│       └── PaymentSchedule.jsx# Lazy — useMemo amortization table
│
└── mfe-profile/               # Profile team (port 3005)
    └── src/components/
        ├── ProfileApp.jsx     # Expose: Routes cho /profile/*
        ├── ProfilePage.jsx
        ├── EditProfile.jsx    # Lazy chunk
        └── SecuritySettings.jsx  # Lazy chunk — 2FA, đổi mật khẩu
```

---

## Module Federation — Cấu hình cốt lõi

### Pattern `index.js → bootstrap.jsx` (bắt buộc)

```js
// src/index.js — entry point
import('./bootstrap');  // async import — KHÔNG import thẳng

// src/bootstrap.jsx — app thực sự khởi động ở đây
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

**Tại sao cần async?** Module Federation negotiate shared modules (React, Zustand) *trước khi* app khởi tạo. Import thẳng load React trước khi MF kịp xử lý → conflict version.

---

### Remote (MFE) webpack config

```js
// mfe-accounts/webpack.config.js
new ModuleFederationPlugin({
  name: 'mfe_accounts',
  filename: 'remoteEntry.js',   // URL cố định — KHÔNG có contenthash

  exposes: {
    './AccountsApp': './src/components/AccountsApp',
  },

  remotes: {
    shared: remotes.shared,     // import store + UI + PermissionGate
  },

  shared: {
    react:              { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom':        { singleton: true, requiredVersion: '^18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' }, // bắt buộc — intra-MFE routing
    zustand:            { singleton: true, requiredVersion: '^4.5.0' },
  },
})
```

> **Lưu ý quan trọng:** `react-router-dom` phải là singleton trong mọi MFE. Nếu thiếu, `useNavigate`/`Link`/`useParams` sẽ không hoạt động khi MFE được shell mount.

---

### Host (Shell) webpack config

```js
// shell/webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    shared:       remotes.shared,
    mfe_auth:     remotes.mfe_auth,
    mfe_accounts: remotes.mfe_accounts,
    mfe_transfer: remotes.mfe_transfer,
    mfe_cards:    remotes.mfe_cards,
    mfe_loans:    remotes.mfe_loans,
    mfe_profile:  remotes.mfe_profile,
  },
  shared: { react, 'react-dom', 'react-router-dom', zustand: singleton },
})
```

---

### `shared` webpack — Exposes

```js
// shared/webpack.config.js
exposes: {
  './authStore':      './src/store/authStore',
  './accountStore':   './src/store/accountStore',
  './ui':             './src/ui/index',
  './PermissionGate': './src/components/PermissionGate',
},
```

---

### remotes.config.js — Quản lý URL tập trung

```js
const base = process.env.BASE_GH_PAGES; // set khi build cho GitHub Pages

const URLS = {
  shared:       base ? `${base}/shared/remoteEntry.js`        : 'http://localhost:3004/remoteEntry.js',
  mfe_auth:     base ? `${base}/mfe-auth/remoteEntry.js`      : 'http://localhost:3001/remoteEntry.js',
  mfe_accounts: base ? `${base}/mfe-accounts/remoteEntry.js`  : 'http://localhost:3002/remoteEntry.js',
  mfe_transfer: base ? `${base}/mfe-transfer/remoteEntry.js`  : 'http://localhost:3003/remoteEntry.js',
  mfe_cards:    base ? `${base}/mfe-cards/remoteEntry.js`     : 'http://localhost:3007/remoteEntry.js',
  mfe_loans:    base ? `${base}/mfe-loans/remoteEntry.js`     : 'http://localhost:3006/remoteEntry.js',
  mfe_profile:  base ? `${base}/mfe-profile/remoteEntry.js`   : 'http://localhost:3005/remoteEntry.js',
};
```

Đổi URL 1 chỗ → áp dụng toàn bộ hệ thống.

---

## Intra-MFE Routing

Mỗi MFE expose một `*App` component chứa `<Routes>` của riêng nó. Shell mount tại path prefix với `/*`.

```
Shell                          MFE
─────────────────────────────────────────────────────
<Route path="/accounts/*">  →  <AccountsApp>
                                  <Routes>
                                    <Route index />              /accounts
                                    <Route path=":id" />         /accounts/TK001
                                    <Route path=":id/transactions" />
                                  </Routes>
```

```jsx
// mfe-accounts/src/components/AccountsApp.jsx (exposed component)
import { Routes, Route } from 'react-router-dom'; // NO <Router> — shell đã có HashRouter

export default function AccountsApp() {
  return (
    <Routes>
      <Route index element={<AccountList />} />
      <Route path=":id" element={<Suspense><AccountDetail /></Suspense>} />
      <Route path=":id/transactions" element={<Suspense><TransactionList /></Suspense>} />
    </Routes>
  );
}
```

```jsx
// shell/src/App.jsx
<Route path="/accounts/*" element={   // /* bắt buộc — pass remaining path xuống MFE
  <ProtectedRoute>
    {mfe('Tài khoản', <AccountsApp />)}
  </ProtectedRoute>
} />
```

---

## Shared State với Zustand

### Tại sao singleton hoạt động?

```
┌──────────────────────────────────────────────────────────┐
│                     JavaScript Heap                      │
│                                                          │
│   shared MFE expose store tại địa chỉ 0x1A2B            │
│              ┌──────────────────────┐                    │
│              │   accountStore       │ ← 1 object duy nhất│
│              │   accounts: [...]    │                    │
│              │   setAccounts()      │                    │
│              └────────┬─────────────┘                    │
│                       │                                  │
│      ┌────────────────┼─────────────────────┐            │
│      ↓                ↓                     ↓            │
│  mfe-accounts    mfe-transfer           shell/Nav         │
│  setAccounts()   read accounts[]        subscribe()       │
│  (cùng 0x1A2B)   (cùng 0x1A2B)         (cùng 0x1A2B)     │
└──────────────────────────────────────────────────────────┘
```

`zustand: { singleton: true }` đảm bảo MF chỉ load **một Zustand instance** → mọi store đều là true singleton.

---

### authStore — RBAC + subscribeWithSelector

```js
// shared/src/store/authStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getPermissionsForRole } from '../utils/permissions';

export const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    user: null,
    role: null,           // 'CUSTOMER' | 'PREMIUM' | 'BUSINESS'
    permissions: [],      // ['accounts:view', 'transfer:domestic', ...]

    login: (user) => {
      const role = (user.role || 'CUSTOMER').toUpperCase();
      set({ user, role, permissions: getPermissionsForRole(role) });
    },

    logout: () => set({ user: null, role: null, permissions: [] }),

    hasPermission: (permission) => get().permissions.includes(permission),
    hasRole: (role) => get().role === role?.toUpperCase(),
  }))
);
```

---

### accountStore — persist + subscribeWithSelector

```js
// shared/src/store/accountStore.js
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export const useAccountStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        accounts: [],
        setAccounts: (accounts) => set({ accounts }),
        getTotalBalance: () => get().accounts.reduce((s, a) => s + (a.balance || 0), 0),
        getAccount: (id) => get().accounts.find((a) => a.id === id),
      }),
      {
        name: 'vietbank-accounts',          // localStorage key
        partialize: (s) => ({ accounts: s.accounts }), // chỉ cache accounts[]
      }
    )
  )
);
```

**`persist`** — accounts[] được cache vào localStorage. Khi user vào thẳng `/transfer` mà chưa qua `/accounts`, store vẫn có dữ liệu từ session trước.

---

### Dùng store trong React component (hook)

```jsx
// Dùng trong bất kỳ MFE nào (static import)
import { useAuthStore }   from 'shared/authStore';
import { useAccountStore } from 'shared/accountStore';

const user       = useAuthStore((s) => s.user);
const accounts   = useAccountStore((s) => s.accounts);
const getAccount = useAccountStore((s) => s.getAccount);
```

---

### Dùng store trong Shell (dynamic import + subscribeWithSelector)

```js
// shell/src/components/Nav.jsx
useEffect(() => {
  let unsubAuth, unsubAccount;

  Promise.all([
    import('shared/authStore'),
    import('shared/accountStore'),
  ]).then(([{ useAuthStore }, { useAccountStore }]) => {
    setUser(useAuthStore.getState().user);
    setTotalBalance(useAccountStore.getState().getTotalBalance());

    // Selective subscription — listener chỉ fire khi selector result thay đổi
    unsubAuth = useAuthStore.subscribe(
      (s) => [s.user, s.role],
      ([user, role]) => { setUser(user); setRole(role); },
      { equalityFn: (a, b) => a[0] === b[0] && a[1] === b[1] }
    );
    unsubAccount = useAccountStore.subscribe(
      (s) => s.accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
      (total) => setTotalBalance(total)
    );
  });

  return () => { unsubAuth?.(); unsubAccount?.(); };
}, []);
```

---

## Authorization — RBAC

### Permission Matrix

| Permission | CUSTOMER | PREMIUM | BUSINESS |
|---|:---:|:---:|:---:|
| accounts:view, accounts:download | ✅ | ✅ | ✅ |
| transfer:domestic | ✅ | ✅ | ✅ |
| cards:view, cards:freeze, cards:change_pin | ✅ | ✅ | ✅ |
| loans:view | ✅ | ✅ | ✅ |
| profile:view, profile:edit, profile:security | ✅ | ✅ | ✅ |
| transfer:international | ❌ | ✅ | ✅ |
| cards:manage_limit | ❌ | ✅ | ✅ |
| loans:apply, loans:pay_early | ❌ | ✅ | ✅ |
| transfer:bulk, accounts:manage | ❌ | ❌ | ✅ |

---

### ProtectedRoute — Route-level guard (shell)

```jsx
// shell/src/components/ProtectedRoute.jsx
import { useAuthStore } from 'shared/authStore';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// shell/src/App.jsx
<Route path="/accounts/*" element={
  <ProtectedRoute>{mfe('Tài khoản', <AccountsApp />)}</ProtectedRoute>
} />
```

---

### PermissionGate — Feature-level gate (exposed từ shared)

```jsx
// Bất kỳ MFE nào
import PermissionGate from 'shared/PermissionGate';

// Ví dụ trong mfe-transfer/NewTransfer.jsx
<PermissionGate
  permission="transfer:international"
  requiredRole="PREMIUM"
  fallback={
    <button disabled>Chuyển quốc tế 🔒 PREMIUM</button>
  }
>
  <button onClick={openIntlForm}>Chuyển quốc tế</button>
</PermissionGate>

// Ví dụ trong mfe-cards/CardDetail.jsx
<PermissionGate permission="cards:manage_limit" requiredRole="PREMIUM" fallback={<LockedButton />}>
  <button onClick={() => setLimitModal(true)}>Thay đổi hạn mức</button>
</PermissionGate>

// Ví dụ trong mfe-loans/LoanList.jsx
<PermissionGate permission="loans:apply" requiredRole="PREMIUM" fallback={<LockedRow />}>
  <button>+ Đăng ký khoản vay mới</button>
</PermissionGate>
```

**Props của PermissionGate:**

| Prop | Type | Mô tả |
|---|---|---|
| `permission` | string | Permission cần có, ví dụ `"transfer:international"` |
| `fallback` | ReactNode | Hiển thị khi không đủ quyền (mặc định: null) |
| `requiredRole` | string | Label role hiển thị trong badge (mặc định: `"PREMIUM"`) |
| `showLocked` | boolean | Khi true và không có fallback, tự render nút bị khoá |

---

## Shared UI Library

```jsx
import {
  Button, Badge, StatusBadge,
  Spinner, PageSpinner,
  Card, CardHeader, Divider,
  ToastProvider, useToast,
  SkeletonCard, SkeletonRow, SkeletonList,
} from 'shared/ui';
```

| Component | Mô tả |
|---|---|
| `Button` | 5 variants (primary/secondary/danger/ghost/success), 3 sizes |
| `Badge` / `StatusBadge` | Count badge và status pill (blue/green/yellow/red/purple) |
| `Spinner` / `PageSpinner` | Loading spinner, căn giữa trang |
| `Card` / `CardHeader` / `Divider` | Layout container |
| `ToastProvider` / `useToast` | Toast notification system |
| `SkeletonCard` | Shimmer loading card — dùng trong Suspense fallback |
| `SkeletonRow` | Shimmer loading row — cho transaction list |
| `SkeletonList` | Nhiều SkeletonRow, nhận prop `rows` |

```jsx
// Dùng Skeleton thay PageSpinner trong Suspense
<Suspense fallback={<SkeletonList rows={3} />}>
  <TransactionList />
</Suspense>
```

---

## Performance Optimization

### 1. MFE Prefetch on Hover

Shell Nav prefetch remote chunk khi user hover link — click sẽ gần như instant vì file đã được tải.

```js
// shell/src/components/Nav.jsx
const PREFETCHERS = {
  'mfe-accounts': () => import('mfe_accounts/AccountsApp'),
  'mfe-transfer': () => import('mfe_transfer/TransferApp'),
  'mfe-cards':    () => import('mfe_cards/CardsApp'),
  'mfe-loans':    () => import('mfe_loans/LoansApp'),
};

<Link onMouseEnter={() => PREFETCHERS[remote]?.()} to={to}>
  {label}
</Link>
```

`lazy()` đã cache Promise — prefetch chỉ trigger download sớm hơn, không tạo instance mới.

---

### 2. subscribeWithSelector (Zustand)

```js
// Nav chỉ re-render khi user hoặc totalBalance thực sự thay đổi
// Không re-render với mọi state update của store
unsubAuth = useAuthStore.subscribe(
  (s) => [s.user, s.role],
  ([user, role]) => { setUser(user); setRole(role); },
  { equalityFn: (a, b) => a[0] === b[0] && a[1] === b[1] }
);
```

---

### 3. React.memo cho List Items

```jsx
// mfe-accounts/AccountList.jsx
const AccountItem = memo(function AccountItem({ acc }) {
  return <Link to={acc.id}><Card>...</Card></Link>;
});

// mfe-accounts/TransactionList.jsx
const TransactionRow = memo(function TransactionRow({ tx }) {
  return <Card>...</Card>;
});
```

---

### 4. useMemo cho Computed Values

```jsx
// mfe-accounts/TransactionList.jsx
const totalIn    = useMemo(() => allTxns.filter(t => t.type === 'credit').reduce(...), [allTxns]);
const totalOut   = useMemo(() => allTxns.filter(t => t.type === 'debit').reduce(...), [allTxns]);
const filtered   = useMemo(() => filter === 'all' ? allTxns : allTxns.filter(t => t.type === filter), [allTxns, filter]);
const totalPages = useMemo(() => Math.ceil(filtered.length / PAGE_SIZE), [filtered]);
const visible    = useMemo(() => filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [filtered, page]);

// mfe-loans/PaymentSchedule.jsx
const schedule = useMemo(
  () => generateSchedule(principal, rate, term, startDate, paidMonths),
  [principal, rate, term, startDate, paidMonths]
);
```

---

### 5. useCallback cho Event Handlers

```jsx
const handleFilter = useCallback((key) => { setFilter(key); setPage(1); }, []);
const handleLogout = useCallback(() => { import('shared/authStore').then(...); }, []);
```

---

### 6. useDebounce cho Filter Input

```js
// mfe-transfer/TransferHistory.jsx — định nghĩa local, không cần expose từ shared
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const debouncedDate = useDebounce(dateFilter, 300);
const filtered = useMemo(() => ALL_HISTORY.filter(h => {
  if (statusFilter !== 'all' && h.status !== statusFilter) return false;
  if (debouncedDate && !h.date.startsWith(debouncedDate)) return false;
  return true;
}), [statusFilter, debouncedDate]);
```

---

## Code Splitting & Lazy Load

### contenthash — Cache tối ưu

```js
// webpack.optimization.js — dùng chung cho tất cả 8 packages
module.exports = {
  output: {
    filename:      '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    // remoteEntry.js — KHÔNG có hash: shell cần URL cố định
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor:      { test: /node_modules/, chunks: 'initial', name: 'vendors' },
        asyncVendor: { test: /node_modules/, chunks: 'async',   name(module) { ... } },
      },
    },
  },
};
```

### Lazy Load MFE trong Shell + Intra-MFE

```jsx
// shell — load MFE lúc route match
const AccountsApp = lazy(() => import('mfe_accounts/AccountsApp'));
const TransferApp = lazy(() => import('mfe_transfer/TransferApp'));

// Trong MFE — load sub-page lúc navigate
const AccountDetail = lazy(() =>
  import(
    /* webpackChunkName: "account-detail" */
    /* webpackPrefetch: true */
    './AccountDetail'
  )
);
```

**`webpackPrefetch: true`** — browser tải chunk trong thời gian idle sau khi trang xong. Khi user click, chunk đã sẵn sàng → không chờ network.

### Kết quả dist

```
mfe-accounts/dist/
├── remoteEntry.js                          # URL cố định
├── main.abc12345.js                        # Code AccountsApp + AccountList
├── account-detail.def67890.chunk.js        # Lazy — AccountDetail
├── transaction-list.ghi11111.chunk.js      # Lazy — TransactionList
└── vendors.jkl22222.js                     # react + react-dom
```

---

## Chạy local

### Yêu cầu

- Node.js >= 18
- pnpm >= 8

### Cài đặt

```bash
git clone https://github.com/MinhChien96/micro-frontend.git
cd micro-frontend
pnpm install
```

### Chạy tất cả

```bash
pnpm start
```

8 app chạy song song:

| App | Port | Vai trò |
|---|---|---|
| shared | 3004 | Store + UI — **phải khởi động trước shell** |
| mfe-auth | 3001 | Auth team |
| mfe-accounts | 3002 | Accounts team |
| mfe-transfer | 3003 | Transfer team |
| mfe-cards | 3007 | Cards team |
| mfe-loans | 3006 | Loans team |
| mfe-profile | 3005 | Profile team |
| shell | 3000 | Host app — **mở trình duyệt vào đây** |

### Chạy độc lập từng team

```bash
pnpm --filter shared start
pnpm --filter mfe-accounts start   # http://localhost:3002
pnpm --filter mfe-transfer start   # http://localhost:3003
pnpm --filter mfe-cards start      # http://localhost:3007
```

---

## CI/CD với GitHub Actions

Deploy lên **GitHub Pages** (legacy mode — peaceiris/actions-gh-pages push thẳng lên gh-pages branch).

> **Quan trọng:** Phải giữ Pages ở `legacy` mode (không phải `workflow` mode). Nếu đổi sang workflow mode, deploy sẽ không chạy dù CI thành công.

### Workflow matrix

| Workflow | Trigger | Builds |
|---|---|---|
| `deploy-all.yml` | infra files thay đổi hoặc manual dispatch | Tất cả 8 packages, full replace |
| `deploy-mfe-accounts.yml` | `mfe-accounts/**` | shared + mfe-accounts |
| `deploy-mfe-transfer.yml` | `mfe-transfer/**` | shared + mfe-transfer |
| `deploy-mfe-cards.yml` | `mfe-cards/**` | shared + mfe-cards |
| `deploy-mfe-loans.yml` | `mfe-loans/**` | shared + mfe-loans |

Tất cả workflow dùng `concurrency.group: deploy-pages` với `cancel-in-progress: false` → xếp hàng, không cancel khi 2 team push cùng lúc.

### Per-team workflow (pattern)

```yaml
name: Deploy mfe-transfer

on:
  push:
    branches: [main]
    paths:
      - 'mfe-transfer/**'
      - 'remotes.config.js'
      - 'webpack.optimization.js'
  workflow_dispatch:

concurrency:
  group: deploy-pages
  cancel-in-progress: false

permissions:
  contents: write

env:
  BASE: https://minhchien96.github.io/micro-frontend

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile

      - name: Build shared        # shared phải build trước
        run: pnpm --filter shared build
        env:
          PUBLIC_URL: ${{ env.BASE }}/shared/

      - name: Build mfe-transfer
        run: pnpm --filter mfe-transfer build
        env:
          PUBLIC_URL: ${{ env.BASE }}/mfe-transfer/
          BASE_GH_PAGES: ${{ env.BASE }}

      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./mfe-transfer/dist
          destination_dir: mfe-transfer
          keep_files: true        # KHÔNG xóa subfolder của team khác
```

---

## Quy trình làm việc theo team

### Kịch bản: Transfer team thêm tính năng mới

```
1. Dev local độc lập:
   pnpm --filter shared start
   pnpm --filter mfe-transfer start
   → Mở http://localhost:3003

2. Code trong mfe-transfer/ — các team khác không bị ảnh hưởng

3. Push lên main
   → deploy-mfe-transfer.yml trigger
   → Chỉ mfe-transfer được build và deploy
   → Shell tự load remoteEntry.js mới lúc runtime — không cần rebuild shell

4. RBAC — nếu thêm tính năng mới cần quyền:
   → Thêm permission string vào shared/src/utils/permissions.js
   → Bọc feature bằng <PermissionGate permission="transfer:newfeature">
```

### Contract giữa các team

Mỗi team giữ nguyên **public API** (exposes):

```js
// Được — thêm expose mới
exposes: {
  './TransferApp':     './src/components/TransferApp',  // giữ nguyên
  './TransferWidget':  './src/components/TransferWidget', // thêm mới OK
}

// KHÔNG được — xóa hoặc đổi tên expose đang dùng
```

---

## Xử lý sự cố thường gặp

### MFE không load được

```
Error: Failed to load module script from mfe_accounts/remoteEntry.js
```

MFE chưa chạy hoặc sai port:

```bash
curl http://localhost:3002/remoteEntry.js
pnpm --filter mfe-accounts start
```

---

### Multiple React / multiple Router instances

```
Error: Invalid hook call.
Error: You cannot render a <Router> inside another <Router>.
```

Thiếu `singleton: true` trong webpack shared config. Kiểm tra tất cả MFE đều có:

```js
shared: {
  react:              { singleton: true },
  'react-dom':        { singleton: true },
  'react-router-dom': { singleton: true }, // bắt buộc với intra-MFE routing
  zustand:            { singleton: true },
}
```

---

### "Module './ui' does not exist in container"

Browser đang dùng bản cache cũ của `remoteEntry.js` từ trước khi deploy mới.

```
Fix: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
```

GitHub Pages CDN có `max-age=600` (10 phút) → cache tự hết hạn sau 10 phút.

---

### UI không cập nhật dù CI xanh

GitHub Pages đang ở **workflow mode** thay vì **legacy mode**. `peaceiris/actions-gh-pages` chỉ hoạt động với legacy mode.

```bash
# Kiểm tra mode hiện tại
gh api "repos/MinhChien96/micro-frontend/pages" | jq '.build_type'

# Switch về legacy
gh api --method PUT "repos/MinhChien96/micro-frontend/pages" \
  -f build_type=legacy -f source=gh-pages
```

---

### Store không sync giữa các MFE

`shared` MFE chưa chạy → mỗi MFE tạo store riêng → không share state.

```bash
# Thứ tự khi chạy riêng lẻ
pnpm --filter shared start     # 1. Bắt buộc chạy trước
pnpm --filter mfe-accounts start
pnpm --filter mfe-transfer start
pnpm --filter shell start      # Shell cuối cùng
```

---

### pnpm conflict — hai webpack instances

```
TypeError: The 'compilation' argument must be an instance of Compilation
```

Fix `.npmrc`:

```
shamefully-hoist=true
dedupe-peer-dependents=true
```

```bash
pnpm install --config.confirmModulesPurge=false
```

---

## Luồng dữ liệu tóm tắt

```
User đăng nhập với role PREMIUM (trong mfe-auth)
          ↓
authStore.login({ role: 'PREMIUM', ... })
          ↓
permissions = ['accounts:view', 'transfer:domestic', 'transfer:international', ...]
          ↓
shell/Nav hiển thị badge "Ưu tiên"   ← selective subscribe
ProtectedRoute cho phép vào /accounts
PermissionGate trong mfe-transfer hiện nút "Chuyển quốc tế"
PermissionGate trong mfe-cards hiện nút "Thay đổi hạn mức"
PermissionGate trong mfe-loans hiện nút "Đăng ký vay mới"
```

```
User vào /accounts (mfe-accounts)
          ↓
AccountList render + gọi accountStore.setAccounts([...])
          ↓
accounts[] được cache vào localStorage ('vietbank-accounts')
          ↓
User navigate sang /transfer (mfe-transfer)
          ↓
TransferDashboard đọc accounts[] từ accountStore → có dữ liệu ngay
          ↓
Nav cập nhật total balance chip     ← selective subscribe chỉ re-render khi balance thay đổi
```
