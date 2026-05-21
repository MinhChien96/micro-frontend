# Micro Frontend — Webpack 5 Module Federation

> Mô hình micro frontend phổ biến nhất hiện nay, áp dụng tại Zalando, IKEA, Shopify, và nhiều công ty lớn.

---

## Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Các khái niệm cốt lõi](#các-khái-niệm-cốt-lõi)
4. [Shared State với Zustand](#shared-state-với-zustand)
5. [Giao tiếp giữa các MFE](#giao-tiếp-giữa-các-mfe)
6. [Chạy local](#chạy-local)
7. [Build độc lập từng team](#build-độc-lập-từng-team)
8. [Deploy lên production](#deploy-lên-production)
9. [Quy trình làm việc theo team](#quy-trình-làm-việc-theo-team)
10. [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (Runtime)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  shell (port 3000)                       │   │
│  │            Host App — Orchestrator                       │   │
│  │                                                          │   │
│  │   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │   │  mfe-auth   │  │ mfe-products │  │   mfe-cart   │   │   │
│  │   │  port 3001  │  │  port 3002   │  │  port 3003   │   │   │
│  │   │             │  │              │  │              │   │   │
│  │   │ Login       │  │ ProductList  │  │ Cart         │   │   │
│  │   │ UserProfile │  │ ProductCard  │  │              │   │   │
│  │   └──────┬──────┘  └──────┬───────┘  └──────┬───────┘   │   │
│  │          │                │                  │           │   │
│  │          └────────────────┴──────────────────┘           │   │
│  │                           │                              │   │
│  │                    shared (port 3004)                    │   │
│  │                  Store Layer — Zustand                   │   │
│  │                  authStore | cartStore                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Nguyên lý hoạt động

| Khái niệm | Giải thích |
|-----------|-----------|
| **Host (Shell)** | App chính, load và compose các MFE. Quản lý routing, layout |
| **Remote (MFE)** | App con, chạy độc lập, expose component ra ngoài qua `remoteEntry.js` |
| **remoteEntry.js** | File manifest do webpack tạo — shell fetch file này lúc runtime để biết MFE expose gì |
| **Shared modules** | React, Zustand được share singleton — load 1 lần duy nhất cho toàn hệ thống |

---

## Cấu trúc thư mục

```
micro-frontend/
│
├── remotes.config.js          # ← Trung tâm quản lý URL của các MFE
├── .env.example               # Template env vars cho từng team
├── pnpm-workspace.yaml        # Khai báo pnpm workspaces
├── .npmrc                     # pnpm config (shamefully-hoist)
├── package.json               # Root scripts: start all, build all
│
├── shared/                    # ← Store layer (port 3004)
│   ├── src/
│   │   ├── store/
│   │   │   ├── authStore.js   # Zustand store: user, login(), logout()
│   │   │   └── cartStore.js   # Zustand store: items, addItem(), updateQty()
│   │   ├── App.jsx            # Debug view — xem state realtime
│   │   ├── bootstrap.jsx
│   │   └── index.js
│   ├── webpack.config.js      # Expose: authStore, cartStore
│   └── package.json
│
├── shell/                     # ← Host app (port 3000)
│   ├── src/
│   │   ├── App.jsx            # Routing + lazy load MFE components
│   │   ├── bootstrap.jsx
│   │   ├── index.js           # Async import → bootstrap (bắt buộc với MF)
│   │   ├── styles.css
│   │   └── components/
│   │       └── Nav.jsx        # Subscribe vào shared store (non-hook pattern)
│   ├── webpack.config.js      # Consumer: khai báo tất cả remotes
│   └── package.json
│
├── mfe-auth/                  # ← Auth team (port 3001)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx      # Expose: gọi authStore.login()
│   │   │   └── UserProfile.jsx# Expose: đọc authStore.user
│   │   ├── App.jsx            # Standalone app để dev độc lập
│   │   ├── bootstrap.jsx
│   │   └── index.js
│   ├── webpack.config.js      # Expose: Login, UserProfile | Remote: shared
│   └── package.json
│
├── mfe-products/              # ← Products team (port 3002)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductList.jsx# Expose: gọi cartStore.addItem()
│   │   │   └── ProductCard.jsx
│   │   ├── data/
│   │   │   └── products.js    # Mock data
│   │   ├── App.jsx
│   │   ├── bootstrap.jsx
│   │   └── index.js
│   ├── webpack.config.js      # Expose: ProductList | Remote: shared
│   └── package.json
│
└── mfe-cart/                  # ← Cart team (port 3003)
    ├── src/
    │   ├── components/
    │   │   └── Cart.jsx       # Expose: subscribe cartStore.items
    │   ├── App.jsx
    │   ├── bootstrap.jsx
    │   └── index.js
    ├── webpack.config.js      # Expose: Cart | Remote: shared
    └── package.json
```

---

## Các khái niệm cốt lõi

### 1. Pattern `index.js → bootstrap.jsx` (bắt buộc)

```js
// src/index.js — entry point
import('./bootstrap');   // ← async import, KHÔNG phải import thường

// src/bootstrap.jsx — app thực sự
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

**Tại sao cần async import?**
Module Federation cần khởi tạo shared modules (React, Zustand) **trước khi** app chạy. Nếu import thẳng, React sẽ được load trước khi MF kịp negotiate version, dẫn đến conflict.

---

### 2. Cấu hình webpack — Remote (MFE)

```js
// mfe-auth/webpack.config.js
new ModuleFederationPlugin({
  name: 'mfe_auth',              // tên định danh (dùng trong shell's remotes)
  filename: 'remoteEntry.js',    // file manifest được generate ra

  exposes: {
    './Login':       './src/components/Login',       // shell import('mfe_auth/Login')
    './UserProfile': './src/components/UserProfile', // shell import('mfe_auth/UserProfile')
  },

  remotes: {
    shared: remotes.shared,      // mfe-auth cần đọc/ghi authStore
  },

  shared: {
    react:       { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
    zustand:     { singleton: true, requiredVersion: '^4.5.0' },
    //            ↑ singleton: true — chỉ 1 instance trong toàn bộ hệ thống
  },
})
```

---

### 3. Cấu hình webpack — Host (Shell)

```js
// shell/webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  // Shell không expose gì — nó chỉ consume từ các remote

  remotes: {
    shared:       remotes.shared,       // "shared@http://localhost:3004/remoteEntry.js"
    mfe_auth:     remotes.mfe_auth,     // "mfe_auth@http://localhost:3001/remoteEntry.js"
    mfe_products: remotes.mfe_products,
    mfe_cart:     remotes.mfe_cart,
  },

  shared: { /* react, zustand singleton */ },
})
```

---

### 4. Lazy load MFE component trong Shell

```jsx
// shell/src/App.jsx
import React, { Suspense, lazy } from 'react';

// Khai báo giống import() thường, nhưng webpack sẽ fetch từ remoteEntry
const Login = lazy(() => import('mfe_auth/Login'));
const Cart  = lazy(() => import('mfe_cart/Cart'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />   {/* Load từ mfe-auth:3001 lúc runtime */}
    </Suspense>
  );
}
```

---

### 5. remotes.config.js — Quản lý URL tập trung

```js
// remotes.config.js
const URLS = {
  shared:       process.env.SHARED_URL        || 'http://localhost:3004/remoteEntry.js',
  mfe_auth:     process.env.MFE_AUTH_URL      || 'http://localhost:3001/remoteEntry.js',
  mfe_products: process.env.MFE_PRODUCTS_URL  || 'http://localhost:3002/remoteEntry.js',
  mfe_cart:     process.env.MFE_CART_URL      || 'http://localhost:3003/remoteEntry.js',
}

module.exports = {
  shared:       `shared@${URLS.shared}`,
  mfe_auth:     `mfe_auth@${URLS.mfe_auth}`,
  // ...
}
```

Tất cả webpack config đều dùng chung file này → đổi URL ở 1 chỗ, áp dụng toàn bộ.

---

## Shared State với Zustand

### Tại sao Zustand + singleton hoạt động?

```
┌─────────────────────────────────────────────────────────┐
│                    JavaScript Heap                      │
│                                                         │
│   shared MFE expose store object tại địa chỉ 0x1A2B    │
│              ┌─────────────────┐                        │
│              │   cartStore     │  ← 1 object duy nhất  │
│              │   items: [...]  │                        │
│              │   addItem()     │                        │
│              └────────┬────────┘                        │
│                       │                                 │
│      ┌────────────────┼──────────────────┐             │
│      ↓                ↓                  ↓             │
│  mfe-products     mfe-cart           shell/Nav          │
│  useCartStore     useCartStore       subscribe()        │
│  (cùng 0x1A2B)   (cùng 0x1A2B)     (cùng 0x1A2B)      │
│                                                         │
│  mfe-products.addItem() → items thay đổi               │
│  → mfe-cart re-render NGAY LẬP TỨC (cùng reference)   │
└─────────────────────────────────────────────────────────┘
```

**Key:** `zustand: { singleton: true }` đảm bảo Module Federation chỉ load **một Zustand instance** duy nhất. Do đó mọi store được tạo bằng Zustand đều là singleton thực sự.

---

### Store API

```js
// shared/src/store/cartStore.js
export const useCartStore = create((set, get) => ({
  items: [],

  addItem:   (product) => set(...),  // mfe-products gọi
  updateQty: (id, delta) => set(...), // mfe-cart gọi
  getCount:  () => get().items.reduce((s, i) => s + i.qty, 0),
  getTotal:  () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
}));
```

---

### Cách MFE dùng store (hook — bên trong React component)

```jsx
// mfe-products/src/components/ProductList.jsx
import { useCartStore } from 'shared/cartStore';

export default function ProductList() {
  // Chỉ lấy action, tránh re-render khi items thay đổi
  const addItem = useCartStore((s) => s.addItem);
  return <button onClick={() => addItem(product)}>Add</button>;
}
```

```jsx
// mfe-cart/src/components/Cart.jsx
import { useCartStore } from 'shared/cartStore';

export default function Cart() {
  // Lấy items để render — re-render khi items thay đổi
  const items    = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  // ...
}
```

---

### Cách Shell dùng store (non-hook — ngoài React component)

Shell không thể dùng hook trực tiếp với dynamic import. Dùng Zustand's subscribe API:

```js
// shell/src/components/Nav.jsx
useEffect(() => {
  let unsub;

  import('shared/cartStore').then(({ useCartStore }) => {
    // Lấy giá trị hiện tại
    setCartCount(useCartStore.getState().getCount());

    // Subscribe — callback chạy mỗi khi store thay đổi
    unsub = useCartStore.subscribe((state) => {
      setCartCount(state.getCount());
    });
  });

  return () => unsub?.(); // cleanup khi unmount
}, []);
```

---

## Giao tiếp giữa các MFE

Trong repo này dùng **Shared Store** (Zustand singleton) — đây là pattern được ưu tiên nhất vì type-safe và predictable.

### So sánh các pattern giao tiếp

| Pattern | Ưu điểm | Nhược điểm | Dùng khi |
|---------|---------|-----------|---------|
| **Shared Store** (Zustand singleton) | Type-safe, reactive, dễ debug | Cần shared MFE chạy | State phức tạp, nhiều MFE cùng dùng |
| **Custom Events** (window) | Đơn giản, không cần setup | String-based, khó trace | Thông báo đơn giản 1 chiều |
| **URL / Query Params** | Bookmarkable, shareable | Hạn chế data phức tạp | Navigation state |
| **Props qua Shell** | Rõ ràng, explicit | Shell phải biết quá nhiều | Shell-owned state nhỏ |

---

## Chạy local

### Yêu cầu

- Node.js >= 18
- pnpm >= 8

### Cài đặt

```bash
git clone <repo>
cd micro-frontend
pnpm install
```

### Chạy tất cả (khuyến nghị)

```bash
pnpm start
```

5 app chạy song song:

| App | Port | Vai trò |
|-----|------|--------|
| shared | 3004 | Store layer — **phải chạy trước shell** |
| mfe-auth | 3001 | Auth MFE |
| mfe-products | 3002 | Products MFE |
| mfe-cart | 3003 | Cart MFE |
| shell | 3000 | Host app — mở trình duyệt vào đây |

> **Lưu ý:** shell cần tất cả các MFE chạy mới hoạt động đầy đủ. Nếu 1 MFE down, phần tương ứng sẽ hiện lỗi (được bọc bởi ErrorBoundary).

### Chạy từng MFE độc lập

Mỗi MFE có thể chạy standalone — hữu ích khi dev một team riêng lẻ:

```bash
# Auth team làm việc độc lập
pnpm --filter mfe-auth start
# Mở http://localhost:3001 — chỉ xem Login form

# Products team
pnpm --filter mfe-products start
# Mở http://localhost:3002

# Cart team
pnpm --filter mfe-cart start
# Mở http://localhost:3003

# Shared store (cần khi các MFE cần import store)
pnpm --filter shared start
```

---

## Build độc lập từng team

### Build tất cả

```bash
pnpm run build
```

Mỗi team build song song, output vào thư mục `dist/` của từng app.

### Build riêng từng team

```bash
# Auth team release version mới
pnpm --filter mfe-auth build

# Products team fix bug
pnpm --filter mfe-products build
```

Các team khác **không cần rebuild** — shell tự động load `remoteEntry.js` mới nhất lúc runtime.

### Override URL khi build (trỏ đến MFE staging của team khác)

```bash
# Products team muốn test với Auth staging
MFE_AUTH_URL=https://auth.staging.company.com/remoteEntry.js \
pnpm --filter mfe-products start
```

---

## Deploy lên production

### Nguyên lý

Mỗi MFE là một **tập hợp static files** được deploy độc lập lên CDN hoặc static hosting. Shell và các MFE chỉ cần biết URL của nhau qua `remoteEntry.js`.

```
CDN / Static hosting:
├── shared.company.com/          ← Team Shared deploy lên đây
│   └── remoteEntry.js
├── auth.company.com/            ← Team Auth deploy lên đây
│   └── remoteEntry.js
├── products.company.com/        ← Team Products deploy lên đây
│   └── remoteEntry.js
├── cart.company.com/            ← Team Cart deploy lên đây
│   └── remoteEntry.js
└── app.company.com/             ← Shell deploy lên đây
    └── (main.js, index.html...)
```

---

### Bước 1: Mỗi team cấu hình `publicPath` đúng

Trong `webpack.config.js` của mỗi MFE, thay `localhost` bằng URL production:

```js
// mfe-auth/webpack.config.js
output: {
  publicPath: process.env.PUBLIC_URL || 'http://localhost:3001/',
  //          ↑ Set khi build: PUBLIC_URL=https://auth.company.com/
}
```

Hoặc dùng `'auto'` để webpack tự detect (khuyến nghị cho CDN với path động):

```js
output: {
  publicPath: 'auto',
}
```

---

### Bước 2: Set env vars khi build

```bash
# auth team CI/CD pipeline
PUBLIC_URL=https://auth.company.com/ \
pnpm --filter mfe-auth build

# Deploy dist/ lên https://auth.company.com/
aws s3 sync mfe-auth/dist/ s3://auth-bucket/ --delete
```

---

### Bước 3: Build shell với URL production

```bash
# Shell CI/CD pipeline — sau khi tất cả MFE đã deploy
SHARED_URL=https://shared.company.com/remoteEntry.js \
MFE_AUTH_URL=https://auth.company.com/remoteEntry.js \
MFE_PRODUCTS_URL=https://products.company.com/remoteEntry.js \
MFE_CART_URL=https://cart.company.com/remoteEntry.js \
pnpm --filter shell build

# Deploy shell
aws s3 sync shell/dist/ s3://app-bucket/ --delete
```

---

### Ví dụ CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/mfe-auth.yml — CI/CD của Team Auth
name: Deploy mfe-auth

on:
  push:
    paths:
      - 'mfe-auth/**'   # Chỉ trigger khi auth code thay đổi

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --filter mfe-auth

      - name: Build
        run: |
          PUBLIC_URL=https://auth.company.com/ \
          SHARED_URL=https://shared.company.com/remoteEntry.js \
          pnpm --filter mfe-auth build

      - name: Deploy to CDN
        run: aws s3 sync mfe-auth/dist/ s3://auth-mfe-bucket/ --delete
        # Team Auth tự deploy, không cần đợi team khác
```

---

### Versioning và Rollback

Mỗi MFE nên deploy với versioned path để hỗ trợ rollback:

```
https://auth.company.com/v1.2.3/remoteEntry.js   ← version cũ
https://auth.company.com/v1.2.4/remoteEntry.js   ← version mới
https://auth.company.com/latest/remoteEntry.js   ← alias trỏ vào latest
```

Shell dùng `/latest/` trong production. Khi cần rollback, chỉ cần đổi alias:

```bash
# Rollback auth về v1.2.3 (không cần rebuild shell)
aws s3 cp s3://auth-bucket/v1.2.3/ s3://auth-bucket/latest/ --recursive
```

---

## Quy trình làm việc theo team

### Kịch bản thực tế

```
Team Auth muốn thêm OAuth login mà KHÔNG ảnh hưởng Teams khác:

1. Auth team tạo branch, dev trên mfe-auth/ riêng
2. Auth team chạy: pnpm --filter shared start
                   pnpm --filter mfe-auth start
   → Dev trên http://localhost:3001 độc lập

3. Auth team build và deploy lên staging:
   PUBLIC_URL=https://auth.staging.company.com/ \
   pnpm --filter mfe-auth build

4. Shell team (hoặc QA) test tích hợp:
   MFE_AUTH_URL=https://auth.staging.company.com/remoteEntry.js \
   pnpm --filter shell start

5. Auth team merge và deploy production
   → Shell tự dùng version mới ngay lập tức, KHÔNG cần rebuild
```

---

### Ownership rõ ràng

```
Team         Owns                          Port    Có thể deploy riêng?
──────────   ──────────────────────────    ──────  ────────────────────
Store Team   shared/                       3004    ✅ Có (nhưng phải backward-compat)
Auth Team    mfe-auth/                     3001    ✅ Có
Products     mfe-products/                 3002    ✅ Có
Cart Team    mfe-cart/                     3003    ✅ Có
Shell Team   shell/ + remotes.config.js   3000    ✅ Có
```

---

### Contract giữa các team

Mỗi team phải giữ nguyên **public API** (những gì đang expose):

```js
// mfe-auth expose — đây là CONTRACT với shell
exposes: {
  './Login':       './src/components/Login',       // ← KHÔNG được xóa hoặc đổi tên
  './UserProfile': './src/components/UserProfile', // ← KHÔNG được xóa hoặc đổi tên
}

// Muốn thêm component mới → thêm key mới, không xóa key cũ
exposes: {
  './Login':         './src/components/Login',
  './UserProfile':   './src/components/UserProfile',
  './ForgotPassword': './src/components/ForgotPassword', // ← thêm mới, OK
}
```

---

## Xử lý sự cố thường gặp

### MFE không load được

```
Error: Failed to load module from mfe_auth@http://localhost:3001/remoteEntry.js
```

**Nguyên nhân:** MFE chưa chạy hoặc sai port.

**Fix:**
```bash
# Kiểm tra MFE có đang chạy không
curl http://localhost:3001/remoteEntry.js

# Chạy MFE còn thiếu
pnpm --filter mfe-auth start
```

---

### Multiple instances của React / Zustand

```
Error: Invalid hook call. Hooks can only be called inside of a function component.
```

**Nguyên nhân:** Nhiều instance React/Zustand đang chạy — `singleton: true` bị miss ở một nơi nào đó.

**Fix:** Đảm bảo tất cả webpack configs đều có:
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

**Nguyên nhân:** pnpm tạo 2 virtual webpack (1 với postcss, 1 không).

**Fix:** Thêm vào `.npmrc`:
```
shamefully-hoist=true
dedupe-peer-dependents=true
```

Rồi chạy lại:
```bash
pnpm install --lockfile-only
pnpm install --config.confirmModulesPurge=false
```

---

### Store không sync giữa các MFE

**Nguyên nhân:** `shared` MFE chưa chạy → mỗi MFE tạo store riêng → không share.

**Fix:** Đảm bảo `shared` (port 3004) phải chạy trước khi dùng store.

```bash
# Thứ tự khuyến nghị khi chạy riêng lẻ
pnpm --filter shared start          # 1. Store trước
pnpm --filter mfe-auth start        # 2. Sau đó các MFE
pnpm --filter mfe-products start    # 3.
pnpm --filter mfe-cart start        # 4.
pnpm --filter shell start           # 5. Shell cuối cùng
```

Hoặc dùng `pnpm start` để chạy tất cả song song (shared sẽ sẵn sàng trước khi shell cần).

---

## Tóm tắt luồng dữ liệu

```
User click "Add to Cart" (trong mfe-products)
          ↓
cartStore.addItem(product)      ← gọi action trong shared/cartStore
          ↓
Zustand cập nhật items[]        ← store thay đổi (singleton trong memory)
          ↓
mfe-cart/Cart.jsx re-render     ← Zustand notify subscriber (cùng store object)
shell/Nav.jsx cập nhật badge    ← subscribe() callback chạy

Không có HTTP request, không có event bus, không có prop drilling qua shell.
```
