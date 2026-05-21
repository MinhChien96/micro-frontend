# Micro Frontend — Webpack 5 Module Federation

> Mô hình micro frontend phổ biến nhất hiện nay, áp dụng tại Zalando, IKEA, Shopify và nhiều công ty lớn.

**Live demo:** https://minhchien96.github.io/micro-frontend/

---

## Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Shared UI Library](#shared-ui-library)
4. [Các khái niệm cốt lõi](#các-khái-niệm-cốt-lõi)
5. [Shared State với Zustand](#shared-state-với-zustand)
6. [Code Splitting & Lazy Load](#code-splitting--lazy-load)
7. [Giao tiếp giữa các MFE](#giao-tiếp-giữa-các-mfe)
8. [Chạy local](#chạy-local)
9. [Build và Deploy độc lập theo team](#build-và-deploy-độc-lập-theo-team)
10. [CI/CD với GitHub Actions](#cicd-với-github-actions)
11. [Quy trình làm việc theo team](#quy-trình-làm-việc-theo-team)
12. [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)

---

## Tổng quan kiến trúc

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Runtime)                               │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                      shell (port 3000)                            │   │
│  │                 Host App — Orchestrator & Router                  │   │
│  │                                                                   │   │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │   │
│  │  │ mfe-auth │  │mfe-products│  │ mfe-cart │  │  mfe-profile   │  │   │
│  │  │ :3001    │  │   :3002    │  │  :3003   │  │    :3005       │  │   │
│  │  │          │  │            │  │          │  │                │  │   │
│  │  │ Login    │  │ProductList │  │  Cart    │  │  ProfilePage   │  │   │
│  │  └────┬─────┘  └─────┬──────┘  └────┬─────┘  └──────┬─────────┘  │   │
│  │       │              │               │               │            │   │
│  │  ┌────────────────────────────────────────────────────────────┐   │   │
│  │  │                  mfe-orders (:3006)                        │   │   │
│  │  │                     OrderList                              │   │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  │       └──────────────────────┬────────────────────────┘           │   │
│  │                              │                                    │   │
│  │                    shared (:3004)                                 │   │
│  │          Store: authStore | cartStore                             │   │
│  │          UI: Button | Card | Badge | Spinner | Toast              │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Nguyên lý hoạt động

| Khái niệm | Giải thích |
|-----------|------------|
| **Host (Shell)** | App chính, load và compose các MFE. Quản lý routing, layout global |
| **Remote (MFE)** | App con tự chạy được, expose component ra ngoài qua `remoteEntry.js` |
| **remoteEntry.js** | File manifest do webpack tạo — shell fetch lúc runtime để biết MFE expose gì |
| **Shared modules** | React, Zustand được share singleton — load 1 lần duy nhất cho toàn hệ thống |
| **`shared` MFE** | Package đặc biệt: vừa là state layer (Zustand stores) vừa là UI library |

---

## Cấu trúc thư mục

```
micro-frontend/
│
├── remotes.config.js          # Trung tâm quản lý URL của tất cả MFE
├── webpack.optimization.js    # Shared: contenthash, splitChunks config
├── pnpm-workspace.yaml        # Khai báo 7 workspace packages
├── .npmrc                     # shamefully-hoist + dedupe-peer-dependents
├── .env.example               # Template env vars cho từng team
├── package.json               # Root scripts: start all, build all
│
├── shared/                    # Store + UI layer (port 3004)
│   └── src/
│       ├── store/
│       │   ├── authStore.js   # user, login(), logout(), updateProfile()
│       │   └── cartStore.js   # items, addItem(), updateQty(), getCount(), getTotal()
│       └── ui/                # Shared UI Library
│           ├── Button.jsx     # 5 variants, 3 sizes
│           ├── Badge.jsx      # count badge + StatusBadge
│           ├── Card.jsx       # Card, CardHeader, Divider
│           ├── Spinner.jsx    # Spinner, PageSpinner
│           ├── Toast.jsx      # ToastProvider + useToast hook
│           └── index.js       # re-export tất cả
│
├── shell/                     # Host app (port 3000)
│   └── src/
│       ├── App.jsx            # Routes: /, /login, /products, /cart, /profile, /orders
│       └── components/
│           └── Nav.jsx        # Subscribe shared store (non-hook pattern)
│
├── mfe-auth/                  # Auth team (port 3001)
│   └── src/components/
│       ├── Login.jsx          # Expose: gọi authStore.login()
│       └── UserProfile.jsx    # Expose: đọc authStore.user
│
├── mfe-products/              # Products team (port 3002)
│   └── src/
│       ├── components/
│       │   ├── ProductList.jsx# Expose: lazy load ProductDetail
│       │   ├── ProductCard.jsx
│       │   └── ProductDetail.jsx  # Lazy chunk (webpackChunkName: product-detail)
│       └── data/products.js
│
├── mfe-cart/                  # Cart team (port 3003)
│   └── src/components/
│       └── Cart.jsx           # Expose: subscribe cartStore.items
│
├── mfe-profile/               # Profile team (port 3005)
│   └── src/components/
│       ├── ProfilePage.jsx    # Expose: dùng authStore + shared/ui
│       └── EditProfile.jsx    # Lazy chunk (webpackChunkName: edit-profile)
│
└── mfe-orders/                # Orders team (port 3006)
    └── src/components/
        ├── OrderList.jsx      # Expose: dùng shared/ui Card, Badge
        └── OrderDetail.jsx    # Lazy chunk (webpackChunkName: order-detail)
```

---

## Shared UI Library

Các component UI dùng chung được expose từ `shared` MFE qua Module Federation. Mọi MFE đều import trực tiếp như local module:

```jsx
import { Button, Card, CardHeader, Divider, Badge, StatusBadge,
         Spinner, PageSpinner, ToastProvider, useToast } from 'shared/ui';
```

### Components

| Component | Props | Mô tả |
|-----------|-------|-------|
| `Button` | `variant` (primary/secondary/danger/ghost/success), `size` (sm/md/lg), `disabled`, `fullWidth`, `icon` | Button đa năng |
| `Badge` | `count`, `max` (default 99), `color`, `size` | Count badge với overflow (99+) |
| `StatusBadge` | `label`, `color` (blue/green/yellow/red/gray/purple) | Status tag dạng pill |
| `Spinner` | `size` (sm/md/lg), `color` | Loading spinner |
| `PageSpinner` | `label` | Spinner căn giữa trang |
| `Card` | `hoverable`, `padding` (sm/md/lg), `onClick` | Card container |
| `CardHeader` | `title`, `subtitle`, `action` | Header của Card |
| `Divider` | `margin` | Đường kẻ ngang |
| `ToastProvider` | wrap component tree | Provider cho toast system |
| `useToast` | — | Hook: `const { show } = useToast()` |

### Ví dụ sử dụng

```jsx
// mfe-profile/src/components/EditProfile.jsx
import { Card, CardHeader, Button, useToast } from 'shared/ui';

export default function EditProfile({ onDone }) {
  const { show } = useToast();

  const handleSave = async () => {
    await saveChanges();
    show('Profile updated!', 'success');   // toast xuất hiện
    onDone();
  };

  return (
    <Card>
      <CardHeader title="Edit Profile" subtitle="Lazy loaded chunk" />
      <Button onClick={handleSave}>Save Changes</Button>
      <Button variant="secondary" onClick={onDone}>Cancel</Button>
    </Card>
  );
}
```

### Tại sao đặt UI trong `shared` thay vì package riêng?

| Tiêu chí | Đặt trong `shared` | Tạo `shared-ui` riêng |
|----------|-------------------|----------------------|
| Số `remoteEntry.js` | 1 (shared) | 2 |
| Complexity | Thấp | Cao hơn |
| Phù hợp | Học tập, team nhỏ | Team lớn, lifecycle khác nhau |

Trong production với nhiều team, nên tách `shared-ui` riêng để state team và UI team có thể release độc lập.

---

## Các khái niệm cốt lõi

### 1. Pattern `index.js → bootstrap.jsx` (bắt buộc với MF)

```js
// src/index.js — entry point
import('./bootstrap');   // async import — KHÔNG dùng import thường

// src/bootstrap.jsx — app thực sự bắt đầu từ đây
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

**Tại sao cần async?** Module Federation cần negotiate shared modules (React, Zustand) *trước khi* app khởi tạo. Import thẳng sẽ load React trước khi MF kịp xử lý → conflict version.

---

### 2. Cấu hình webpack — Remote (MFE)

```js
// mfe-profile/webpack.config.js
new ModuleFederationPlugin({
  name: 'mfe_profile',         // tên định danh — shell dùng tên này
  filename: 'remoteEntry.js',  // file manifest, KHÔNG có contenthash

  exposes: {
    './ProfilePage': './src/components/ProfilePage',
  },

  remotes: {
    shared: remotes.shared,    // cần access store + UI từ shared
  },

  shared: {
    react:       { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
    zustand:     { singleton: true, requiredVersion: '^4.5.0' },
    // singleton: true — chỉ 1 instance trong toàn bộ hệ thống
  },
})
```

---

### 3. Cấu hình webpack — Host (Shell)

```js
// shell/webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  // Shell KHÔNG expose gì — chỉ consume từ remotes

  remotes: {
    shared:       remotes.shared,        // "shared@http://localhost:3004/remoteEntry.js"
    mfe_auth:     remotes.mfe_auth,      // "mfe_auth@http://localhost:3001/remoteEntry.js"
    mfe_products: remotes.mfe_products,
    mfe_cart:     remotes.mfe_cart,
    mfe_profile:  remotes.mfe_profile,   // "mfe_profile@http://localhost:3005/remoteEntry.js"
    mfe_orders:   remotes.mfe_orders,    // "mfe_orders@http://localhost:3006/remoteEntry.js"
  },
  shared: { /* react, zustand singleton */ },
})
```

---

### 4. remotes.config.js — Quản lý URL tập trung

```js
// remotes.config.js
const base = process.env.BASE_GH_PAGES;  // set khi build cho GitHub Pages

const URLS = {
  shared:      process.env.SHARED_URL        || (base ? `${base}/shared/remoteEntry.js`      : 'http://localhost:3004/remoteEntry.js'),
  mfe_auth:    process.env.MFE_AUTH_URL      || (base ? `${base}/mfe-auth/remoteEntry.js`    : 'http://localhost:3001/remoteEntry.js'),
  mfe_products:process.env.MFE_PRODUCTS_URL  || (base ? `${base}/mfe-products/remoteEntry.js`: 'http://localhost:3002/remoteEntry.js'),
  mfe_cart:    process.env.MFE_CART_URL      || (base ? `${base}/mfe-cart/remoteEntry.js`    : 'http://localhost:3003/remoteEntry.js'),
  mfe_profile: process.env.MFE_PROFILE_URL   || (base ? `${base}/mfe-profile/remoteEntry.js` : 'http://localhost:3005/remoteEntry.js'),
  mfe_orders:  process.env.MFE_ORDERS_URL    || (base ? `${base}/mfe-orders/remoteEntry.js`  : 'http://localhost:3006/remoteEntry.js'),
}

module.exports = {
  shared:       `shared@${URLS.shared}`,
  mfe_auth:     `mfe_auth@${URLS.mfe_auth}`,
  // ...
}
```

Tất cả webpack config import file này → đổi URL 1 chỗ, áp dụng toàn bộ.

---

### 5. Lazy load MFE trong Shell

```jsx
// shell/src/App.jsx
import React, { Suspense, lazy } from 'react';

// Webpack fetch từ remoteEntry lúc runtime, không phải lúc build
const Login       = lazy(() => import('mfe_auth/Login'));
const ProductList = lazy(() => import('mfe_products/ProductList'));
const Cart        = lazy(() => import('mfe_cart/Cart'));
const ProfilePage = lazy(() => import('mfe_profile/ProfilePage'));
const OrderList   = lazy(() => import('mfe_orders/OrderList'));

function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Suspense fallback={<Loading />}><Login /></Suspense>} />
      <Route path="/products" element={<Suspense fallback={<Loading />}><ProductList /></Suspense>} />
      <Route path="/profile"  element={<Suspense fallback={<Loading />}><ProfilePage /></Suspense>} />
      <Route path="/orders"   element={<Suspense fallback={<Loading />}><OrderList /></Suspense>} />
    </Routes>
  );
}
```

---

## Shared State với Zustand

### Tại sao singleton hoạt động?

```
┌──────────────────────────────────────────────────────────┐
│                     JavaScript Heap                      │
│                                                          │
│   shared MFE expose store tại địa chỉ 0x1A2B            │
│              ┌──────────────────┐                        │
│              │   cartStore      │  ← 1 object duy nhất  │
│              │   items: [...]   │                        │
│              │   addItem()      │                        │
│              └────────┬─────────┘                        │
│                       │                                  │
│      ┌────────────────┼───────────────────┐              │
│      ↓                ↓                   ↓              │
│  mfe-products     mfe-cart           shell/Nav            │
│  useCartStore     useCartStore       subscribe()          │
│  (cùng 0x1A2B)   (cùng 0x1A2B)     (cùng 0x1A2B)        │
│                                                          │
│  mfe-products.addItem() → items thay đổi                 │
│  → mfe-cart re-render NGAY LẬP TỨC                       │
│  → shell/Nav cập nhật badge NGAY LẬP TỨC                 │
└──────────────────────────────────────────────────────────┘
```

`zustand: { singleton: true }` đảm bảo MF chỉ load **một Zustand instance** duy nhất → mọi store đều là true singleton.

---

### Store API

```js
// shared/src/store/authStore.js
export const useAuthStore = create((set) => ({
  user: null,
  login:         (user) => set({ user }),
  logout:        () => set({ user: null }),
  updateProfile: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
}));

// shared/src/store/cartStore.js
export const useCartStore = create((set, get) => ({
  items: [],
  addItem:   (product) => set(...),
  updateQty: (id, delta) => set(...),
  getCount:  () => get().items.reduce((s, i) => s + i.qty, 0),
  getTotal:  () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
}));
```

---

### Dùng store trong React component (hook)

```jsx
// mfe-products — chỉ lấy action, tránh re-render thừa
import { useCartStore } from 'shared/cartStore';
const addItem = useCartStore((s) => s.addItem);

// mfe-cart — lấy cả items để render
const items     = useCartStore((s) => s.items);
const updateQty = useCartStore((s) => s.updateQty);

// mfe-profile — dùng authStore
import { useAuthStore } from 'shared/authStore';
const user          = useAuthStore((s) => s.user);
const updateProfile = useAuthStore((s) => s.updateProfile);
```

---

### Dùng store trong Shell (non-hook — dynamic import)

Shell không thể dùng hook trực tiếp với remote dynamic import. Dùng Zustand subscribe API:

```js
// shell/src/components/Nav.jsx
useEffect(() => {
  let unsubAuth, unsubCart;

  Promise.all([
    import('shared/authStore'),
    import('shared/cartStore'),
  ]).then(([{ useAuthStore }, { useCartStore }]) => {
    // Sync giá trị ban đầu
    setUser(useAuthStore.getState().user);
    setCartCount(useCartStore.getState().getCount());

    // Subscribe — callback chạy mỗi khi bất kỳ MFE nào thay đổi store
    unsubAuth = useAuthStore.subscribe((s) => setUser(s.user));
    unsubCart = useCartStore.subscribe((s) => setCartCount(s.getCount()));
  });

  return () => { unsubAuth?.(); unsubCart?.(); };
}, []);
```

---

## Code Splitting & Lazy Load

### contenthash — Cache tối ưu

```js
// webpack.optimization.js — dùng chung cho tất cả 7 packages
module.exports = {
  output: {
    filename:      '[name].[contenthash:8].js',       // main bundle
    chunkFilename: '[name].[contenthash:8].chunk.js', // async chunks
    // remoteEntry.js KHÔNG có hash — shell cần URL cố định để fetch
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          // Vendor sync: react, react-dom gom vào 1 chunk riêng
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendors',
        },
        asyncVendor: {
          // Vendor async: mỗi package 1 chunk riêng tên theo package
          test: /[\\/]node_modules[\\/]/,
          chunks: 'async',
          name(module) { /* "async-vendor.react-dom.abc123.chunk.js" */ },
        },
      },
    },
  },
};
```

**Lợi ích:** Browser cache vendor chunk riêng. Khi mfe-products release mới, chỉ `main.js` thay đổi hash. `vendors.js` và `async-vendor.react-dom.js` giữ nguyên → browser dùng cache.

---

### Intra-MFE lazy load (code splitting nội bộ)

Mỗi MFE có thể lazy load component con của mình:

```jsx
// mfe-products/src/components/ProductList.jsx
const ProductDetail = lazy(() =>
  import(
    /* webpackChunkName: "product-detail" */  // tên chunk trong dist/
    /* webpackPrefetch: true */               // browser prefetch khi idle
    './ProductDetail'
  )
);

// mfe-profile/src/components/ProfilePage.jsx
const EditProfile = lazy(() =>
  import(
    /* webpackChunkName: "edit-profile" */
    /* webpackPrefetch: true */
    './EditProfile'
  )
);

// mfe-orders/src/components/OrderList.jsx
const OrderDetail = lazy(() =>
  import(
    /* webpackChunkName: "order-detail" */
    /* webpackPrefetch: true */
    './OrderDetail'
  )
);
```

**`webpackPrefetch: true`** — browser tự động tải chunk trong thời gian idle (sau khi trang xong). Khi user click, chunk đã sẵn sàng → không phải đợi network.

---

### Kết quả dist sau khi build

```
mfe-products/dist/
├── remoteEntry.js                          # URL cố định, shell fetch file này
├── main.abc12345.js                        # Code của mfe-products
├── vendors.def67890.js                     # react + react-dom (sync)
├── product-detail.ghi11111.chunk.js        # Lazy chunk — load khi cần
└── async-vendor.react-dom.jkl22222.chunk.js# react-dom async chunk
```

---

## Giao tiếp giữa các MFE

Repo này dùng **Shared Store (Zustand singleton)** — pattern được ưu tiên nhất.

### So sánh các pattern

| Pattern | Ưu điểm | Nhược điểm | Dùng khi |
|---------|---------|-----------|---------|
| **Shared Store** (Zustand singleton) | Type-safe, reactive, dễ debug | Cần shared MFE chạy | State phức tạp, nhiều MFE cùng dùng |
| **Custom Events** (window.dispatchEvent) | Đơn giản, không cần setup | String-based, khó trace | Thông báo đơn giản 1 chiều |
| **URL / Query Params** | Bookmarkable, shareable | Giới hạn data phức tạp | Navigation state |
| **Props qua Shell** | Rõ ràng, explicit | Shell phải biết quá nhiều | Shell-owned state nhỏ |

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

### Chạy tất cả (khuyến nghị)

```bash
pnpm start
```

7 app chạy song song:

| App | Port | Vai trò |
|-----|------|---------|
| shared | 3004 | Store + UI layer — **phải khởi động trước shell** |
| mfe-auth | 3001 | Auth team |
| mfe-products | 3002 | Products team |
| mfe-cart | 3003 | Cart team |
| mfe-profile | 3005 | Profile team |
| mfe-orders | 3006 | Orders team |
| shell | 3000 | Host app — **mở trình duyệt vào đây** |

> Shell cần tất cả MFE chạy mới đầy đủ chức năng. Nếu 1 MFE down, phần đó hiện lỗi qua `ErrorBoundary` — các phần khác vẫn hoạt động.

### Chạy độc lập từng team

```bash
# Auth team — dev Login riêng lẻ
pnpm --filter shared start       # cần shared để dùng store
pnpm --filter mfe-auth start     # http://localhost:3001

# Profile team
pnpm --filter shared start
pnpm --filter mfe-profile start  # http://localhost:3005

# Orders team
pnpm --filter shared start
pnpm --filter mfe-orders start   # http://localhost:3006
```

---

## Build và Deploy độc lập theo team

### Build tất cả

```bash
pnpm run build
```

### Build riêng từng team

```bash
pnpm --filter mfe-auth build       # Chỉ build auth
pnpm --filter mfe-products build   # Chỉ build products
pnpm --filter mfe-profile build    # Chỉ build profile
pnpm --filter mfe-orders build     # Chỉ build orders
```

Các team khác **không cần rebuild** — shell load `remoteEntry.js` mới nhất lúc runtime.

### Override URL khi dev/staging

```bash
# Profile team test với Auth staging
MFE_AUTH_URL=https://auth.staging.company.com/remoteEntry.js \
pnpm --filter mfe-profile start

# Shell test tích hợp với toàn bộ staging
BASE_GH_PAGES=https://staging.company.com \
pnpm --filter shell build
```

### Versioning và Rollback

```
CDN:
├── auth.company.com/v1.2.3/remoteEntry.js   ← version cũ
├── auth.company.com/v1.2.4/remoteEntry.js   ← version mới
└── auth.company.com/latest/remoteEntry.js   ← alias trỏ vào latest

# Rollback Auth — không cần rebuild shell
aws s3 cp s3://auth/v1.2.3/ s3://auth/latest/ --recursive
```

---

## CI/CD với GitHub Actions

Deploy lên **GitHub Pages** với mỗi team có workflow riêng. Tất cả dùng `peaceiris/actions-gh-pages` với `keep_files: true` để không ghi đè subfolder của team khác.

### Cấu trúc GitHub Pages

```
gh-pages branch:
├── index.html          ← shell
├── main.xxx.js         ← shell chunks
├── shared/
│   └── remoteEntry.js
├── mfe-auth/
│   └── remoteEntry.js
├── mfe-products/
│   └── remoteEntry.js
├── mfe-cart/
│   └── remoteEntry.js
├── mfe-profile/
│   └── remoteEntry.js
└── mfe-orders/
    └── remoteEntry.js
```

### Workflow matrix

| Workflow | Trigger | Deploy |
|----------|---------|--------|
| `deploy-all.yml` | `pnpm-lock.yaml`, `webpack.optimization.js`, `remotes.config.js`, `.github/workflows/**` thay đổi | Toàn bộ 7 packages |
| `deploy-shared.yml` | `shared/**` | `pages/shared/` |
| `deploy-mfe-auth.yml` | `mfe-auth/**` | `pages/mfe-auth/` |
| `deploy-mfe-products.yml` | `mfe-products/**` | `pages/mfe-products/` |
| `deploy-mfe-cart.yml` | `mfe-cart/**` | `pages/mfe-cart/` |
| `deploy-mfe-profile.yml` | `mfe-profile/**` | `pages/mfe-profile/` |
| `deploy-mfe-orders.yml` | `mfe-orders/**` | `pages/mfe-orders/` |
| `deploy-shell.yml` | `shell/**` | `pages/` (root) |

Tất cả workflow dùng cùng `concurrency.group: deploy-pages` với `cancel-in-progress: false` → xếp hàng thay vì cancel khi 2 team push cùng lúc.

### Per-team workflow (pattern)

```yaml
name: Deploy mfe-profile

on:
  push:
    branches: [main]
    paths:
      - 'mfe-profile/**'
      - 'remotes.config.js'        # thay đổi URL → cần rebuild
      - 'webpack.optimization.js'  # thay đổi output config → cần rebuild
  workflow_dispatch:               # manual trigger

concurrency:
  group: deploy-pages
  cancel-in-progress: false        # queue, không cancel

permissions:
  contents: write                  # cần để push lên gh-pages branch

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

      - name: Build shared      # shared phải build trước vì mfe-profile import từ nó
        run: pnpm --filter shared build
        env:
          PUBLIC_URL: ${{ env.BASE }}/shared/

      - name: Build mfe-profile
        run: pnpm --filter mfe-profile build
        env:
          PUBLIC_URL: ${{ env.BASE }}/mfe-profile/
          BASE_GH_PAGES: ${{ env.BASE }}

      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./mfe-profile/dist
          destination_dir: mfe-profile   # chỉ update subfolder này
          keep_files: true               # KHÔNG xóa subfolder của team khác
```

---

## Quy trình làm việc theo team

### Kịch bản: Profile team thêm tính năng mới

```
1. Dev local độc lập:
   pnpm --filter shared start
   pnpm --filter mfe-profile start
   → Mở http://localhost:3005

2. Tạo branch và code trong mfe-profile/

3. Tạo PR vào main
   → deploy-mfe-profile.yml trigger tự động
   → Chỉ mfe-profile được build và deploy lên pages/mfe-profile/
   → Các team khác KHÔNG bị ảnh hưởng

4. Shell tự dùng version mới ngay lập tức
   → Shell KHÔNG cần rebuild
   → Shell fetch remoteEntry.js mới của mfe-profile lúc runtime
```

### Ownership

| Team | Owns | Port | Deploy độc lập |
|------|------|------|---------------|
| Store Team | `shared/` | 3004 | Có (cần backward-compat) |
| Auth Team | `mfe-auth/` | 3001 | Có |
| Products Team | `mfe-products/` | 3002 | Có |
| Cart Team | `mfe-cart/` | 3003 | Có |
| Profile Team | `mfe-profile/` | 3005 | Có |
| Orders Team | `mfe-orders/` | 3006 | Có |
| Shell Team | `shell/` + `remotes.config.js` | 3000 | Có |

### Contract giữa các team

Mỗi team phải giữ nguyên **public API** (những gì đang expose):

```js
// mfe-auth expose — đây là CONTRACT với shell
exposes: {
  './Login':       './src/components/Login',       // KHÔNG được xóa hoặc đổi tên
  './UserProfile': './src/components/UserProfile', // KHÔNG được xóa hoặc đổi tên
}

// Muốn thêm → thêm key mới, KHÔNG xóa key cũ
exposes: {
  './Login':          './src/components/Login',
  './UserProfile':    './src/components/UserProfile',
  './ForgotPassword': './src/components/ForgotPassword', // OK — thêm mới
}
```

---

## Xử lý sự cố thường gặp

### MFE không load được

```
Error: Failed to load module from mfe_auth@http://localhost:3001/remoteEntry.js
```

MFE chưa chạy hoặc sai port:

```bash
curl http://localhost:3001/remoteEntry.js  # kiểm tra MFE có sống không
pnpm --filter mfe-auth start               # chạy MFE còn thiếu
```

---

### Multiple React instances

```
Error: Invalid hook call. Hooks can only be called inside of a function component.
```

Nhiều React instance đang chạy — thiếu `singleton: true`:

```js
shared: {
  react:       { singleton: true, requiredVersion: '^18.2.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
  zustand:     { singleton: true, requiredVersion: '^4.5.0' },
}
```

---

### Hai webpack instances với pnpm

```
TypeError: The 'compilation' argument must be an instance of Compilation
```

pnpm tạo 2 virtual webpack (1 với postcss, 1 không). Fix `.npmrc`:

```
shamefully-hoist=true
dedupe-peer-dependents=true
```

Rồi:
```bash
pnpm install --config.confirmModulesPurge=false
```

---

### Store không sync giữa các MFE

`shared` MFE chưa chạy → mỗi MFE tạo store riêng → không share.

```bash
# Thứ tự khi chạy riêng lẻ
pnpm --filter shared start       # 1. Bắt buộc chạy trước
pnpm --filter mfe-auth start
pnpm --filter mfe-profile start
pnpm --filter shell start        # Shell cuối cùng
```

---

### GitHub Actions lỗi 403 khi push gh-pages

```
remote: Permission to denied to github-actions[bot].
```

Thêm vào workflow:

```yaml
permissions:
  contents: write
```

---

## Tóm tắt luồng dữ liệu

```
User click "Add to Cart" (trong mfe-products)
          ↓
cartStore.addItem(product)      ← action trong shared/src/store/cartStore.js
          ↓
Zustand cập nhật items[]        ← 1 object duy nhất trong memory
          ↓
mfe-cart/Cart.jsx re-render     ← Zustand notify subscribers
shell/Nav.jsx cập nhật badge    ← subscribe() callback

Không có HTTP request.
Không có event bus.
Không có prop drilling qua shell.
```

```
User click "Save Profile" (trong mfe-profile/EditProfile — lazy chunk)
          ↓
authStore.updateProfile({ name: 'New Name' })
          ↓
useToast().show('Profile updated!', 'success')   ← shared/ui/Toast
          ↓
shell/Nav.jsx cập nhật tên user ngay lập tức    ← subscribe authStore
```
