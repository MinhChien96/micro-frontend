# Micro Frontend Base Template — Modern.js Federated SSR

> **Base template chuẩn production cho micro-frontend**: shell + 6 remotes đều là **Modern.js (ByteDance/TikTok) + Rspack**, Module Federation 2.0, **federated SSR toàn tuyến** (SEO-ready), scoped namespace `@app/*`, **TypeScript strict**, tooling đầy đủ (Biome + Vitest + Lefthook + Changesets), **generator `pnpm gen:mfe`** tạo MFE mới tự đăng ký, deploy giả lập AWS (LocalStack + Docker) + reference workflow AWS thật.

> 🧩 **Đây là template** — domain banking (accounts/transfer/cards/loans/profile/auth) chỉ là **example để tham khảo**. Đổi brand ở `@app/shared/brand`, scope `@app/*` → `@<org>`, thay/ thêm MFE bằng `pnpm gen:mfe`. Xem [docs/adr/0004](docs/adr/0004-scoped-namespace-brand.md).

**Đăng nhập demo:** CIF `0021001` · Mật khẩu `123456` · Chọn role CUSTOMER / PREMIUM / BUSINESS

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Tại sao Modern.js (và khi nào dùng Next.js)](#2-tại-sao-modernjs-và-khi-nào-dùng-nextjs)
3. [Cấu trúc workspace](#3-cấu-trúc-workspace)
4. [Federated SSR hoạt động như thế nào](#4-federated-ssr-hoạt-động-như-thế-nào)
5. [Routing](#5-routing)
6. [SEO](#6-seo)
7. [Auth & Protected Routes](#7-auth--protected-routes)
8. [Shared package — hai vai trò](#8-shared-package--hai-vai-trò)
9. [Chạy local](#9-chạy-local)
10. [Deploy giả lập AWS (Docker + LocalStack)](#10-deploy-giả-lập-aws-docker--localstack)
11. [Deploy AWS thật (reference)](#11-deploy-aws-thật-reference)
12. [Troubleshooting](#12-troubleshooting)
13. [Tooling, test & mở rộng](#13-tooling-test--mở-rộng)

> Tài liệu thêm: [CONTRIBUTING.md](CONTRIBUTING.md) · [Thêm MFE mới](docs/add-new-mfe.md) · [ADR](docs/adr/)

---

## 1. Tổng quan kiến trúc

```
                        BROWSER
                           │
            ┌──────────────▼──────────────┐
            │   shell  :3000  (Modern.js) │  SSR stream + hydrate
            │   host — module federation  │
            └──┬───────┬───────┬──────────┘
               │ mf-manifest.json (HTTP)
   ┌───────────┼───────┬───────┼───────────┬───────────┐
   ▼           ▼       ▼       ▼           ▼           ▼
 mfe-auth  mfe-accounts mfe-transfer  mfe-cards   mfe-loans  mfe-profile
  :3001      :3002       :3003         :3007       :3006      :3005
 (Modern.js + Rspack remotes — mỗi app SSR-capable, deploy độc lập)

 shared :3004 — UI library + auth helpers + eventBus
 (workspace package, bundle vào từng app + share-scope singleton)
```

- **Shell (host)**: SSR stream HTML → bot/người dùng nhận nội dung ngay; routing top-level + auth + Nav + Toast.
- **Remotes**: mỗi team một repo-trong-repo, expose một `*App` component qua `mf-manifest.json` (MF 2.0), tự chạy standalone khi dev.
- **Hai đường tải remote**:
  - *Browser*: tải `static/remoteEntry.js` + chunks qua `publicPath`.
  - *Server (SSR)*: tải `bundles/remoteEntry.js` (build node riêng) qua `ssrPublicPath` — shell render markup của remote ngay trên server.

## 2. Tại sao Modern.js (và khi nào dùng Next.js)

| | Modern.js | Next.js |
|---|---|---|
| Module Federation | First-class (plugin chính chủ, SSR support) | `nextjs-mf` **đã deprecated** (EOL cuối 2026, không hỗ trợ App Router) |
| Federated SSR | ✅ stream SSR cả host lẫn remote | ❌ không có đường chính chủ |
| Khi nào dùng | App MFE, cần SEO nội dung remote | App độc lập không federate, hoặc shell CSR-only load remote bằng `@module-federation/enhanced/runtime` |

**Kết luận cho base này**: toàn bộ stack là Modern.js. Next.js *có thể* làm host CSR (load remote client-side bằng MF runtime API — đã từng implement trong git history, xem commit nhánh này), nhưng muốn SEO nội dung federated thì Modern.js là đường duy nhất được hỗ trợ chính thức.

## 3. Cấu trúc workspace

| Package | Port | Vai trò | Exposes |
|---|---|---|---|
| `shell` | 3000 | Host SSR, routing, auth, Toast | — |
| `mfe-auth` | 3001 | Đăng nhập | `./Login`, `./UserProfile` |
| `mfe-accounts` | 3002 | Tài khoản + giao dịch | `./AccountsApp` |
| `mfe-transfer` | 3003 | Chuyển tiền | `./TransferApp` |
| `shared` | 3004 | UI lib + auth + eventBus | `./ui ./auth ./PermissionGate ./ThemeContext ./eventBus` |
| `mfe-profile` | 3005 | Hồ sơ | `./ProfileApp`, `./ProfilePage` |
| `mfe-loans` | 3006 | Vay vốn | `./LoansApp` |
| `mfe-cards` | 3007 | Thẻ | `./CardsApp` |

File quan trọng mỗi app:

```
modern.config.ts             # rspack + moduleFederationPlugin + server.ssr stream + PORT
module-federation.config.ts  # name, exposes, shared singletons, (shell: remotes + runtimePlugins)
src/routes/                  # file-based routing (layout.tsx bắt buộc từ Modern.js 2.71)
src/routes/page.tsx          # trang standalone dev (mock user) cho remote
```

## 4. Federated SSR hoạt động như thế nào

Bật SSR chỉ cần **một dòng** trong `modern.config.ts` (MF plugin tự phát hiện):

```ts
server: { ssr: { mode: 'stream' }, port: Number(process.env.PORT) || 3002 },
```

Build sẽ tạo thêm bundle node và merge metadata vào manifest:

```
dist/
├── static/mf-manifest.json   # metaData.ssrRemoteEntry + ssrPublicPath (merge sẵn)
├── static/remoteEntry.js     # browser
└── bundles/remoteEntry.js    # node — host SSR require bundle này
```

Shell tiêu thụ remote qua `createLazyComponent` ([shell/src/components/remotePages.tsx](shell/src/components/remotePages.tsx)):

```tsx
// Public — SSR THẬT: markup của remote nằm trong HTML server (SEO)
export const Login = createLazyComponent({
  instance: getInstance(),
  loader: () => import('mfe_auth/Login'),
  export: 'default',
  loading: LoginFallback,
});

// Protected — noSSR: server stream shell + skeleton, content hydrate client
export const AccountsApp = createLazyComponent({ ..., noSSR: true, loading: <AccountsSkeleton /> });
```

### Bài toán dual-URL (Docker/ECS)

`ssrPublicPath` được bake từ `PUBLIC_URL` lúc build remote (URL browser-facing, vd `http://localhost:3002/`). Khi shell chạy trong container, nó **không reach được** `localhost:3002` của máy host. Giải pháp: runtime plugin [shell/src/runtime/internalHostRewrite.ts](shell/src/runtime/internalHostRewrite.ts) rewrite host **chỉ ở phía server** theo env:

```
MF_INTERNAL_HOST_MAP='{"http://localhost:3002":"http://mfe-accounts:3002", ...}'
```

Browser vẫn dùng URL public (không rewrite). Dev local không set env → plugin no-op. Deploy CDN thật (CloudFront) không cần map vì CDN reachable từ cả hai phía.

### Resilience: remote chết không kéo chết host

MF runtime 2.5.x throw lỗi manifest trong promise không ai await → unhandled rejection → Node exit. Plugin trên còn cài guard `process.on('unhandledRejection')` server-side: **nuốt riêng lỗi Federation** (UI đã có ErrorBoundary/fallback hiển thị "Không thể tải MFE"), mọi lỗi khác giữ nguyên fail-fast. Kết quả: kill một remote → route đó hiện fallback, các route khác + shell sống bình thường.

### Share scope — quy tắc sắt

Trong [shell/module-federation.config.ts](shell/module-federation.config.ts) và các remote:

| Module | Vì sao phải singleton |
|---|---|
| `react`, `react-dom` | Một React instance — không thì "invalid hook call" |
| `react-router-dom` | Remote render `<Routes>` con phải attach vào Router context của shell |
| `react/jsx-runtime` | Chống lệch element symbol nếu version React khác nhau giữa host/remote |
| `@app/shared/ui` | `ToastContext` là module-level — toast cross-MFE chỉ chạy khi 1 instance |
| `@app/shared/eventBus` | `_last` cache là module-level — `getLast()` cross-MFE cần 1 instance |

## 5. Routing

- Shell dùng **file-based routing** của Modern.js; route của MFE dùng **`$.tsx` (splat)** — match cả `/accounts` lẫn `/accounts/:id/...`:

```
shell/src/routes/
├── layout.tsx        # AuthProvider > ToastProvider > Nav > <Outlet/>
├── page.tsx          # / — landing public (SSR full nội dung)
├── login/page.tsx    # /login — form SSR từ remote mfe_auth
├── accounts/$.tsx    # /accounts/* → ProtectedRoute + AccountsApp
├── transfer/$.tsx ...
└── $.tsx             # 404
```

- Remote expose `*App` chứa `<Routes>` **con** (không tạo Router mới) — nhận Router context từ shell qua `react-router-dom` singleton.

## 6. SEO

- **SSR stream**: bot nhận HTML đầy đủ ngay từ server — kể cả form Login do remote `mfe_auth` render (`curl localhost:3000/login | grep 0021001` để kiểm chứng).
- **Per-route title/meta** bằng Helmet (SSR-safe):

```tsx
import { Helmet } from '@modern-js/runtime/head';
<Helmet><title>Tài khoản — VietBank</title><meta name="description" content="..." /></Helmet>
```

- Trang protected không cần SEO → `noSSR: true`, server chỉ stream shell + skeleton (nhanh + không lộ data).

## 7. Auth & Protected Routes

- Auth demo bằng localStorage (`vietbank_user` / `vietbank_token`) + event `auth:changed`.
- Server **không có** localStorage → [AuthContext](shell/src/AuthContext.tsx) expose `{ user, ready }`: SSR và first paint luôn `{ user: null, ready: false }` (không hydration mismatch), client đọc localStorage trong `useEffect` rồi set `ready: true`.
- [ProtectedRoute](shell/src/components/ProtectedRoute.tsx): `!ready` → render children (skeleton); `ready && !user` → `<Navigate to="/login">`.
- Mọi helper đọc localStorage trong code remote/shared đều có guard `typeof window === 'undefined'`.

## 8. Shared package — hai vai trò

1. **Workspace package** (đường chính): các app `import { Button } from 'shared/ui'` → resolve qua `exports` map trong [shared/package.json](shared/package.json), bundle vào từng app, **đồng thời** khai báo trong MF `shared:` map để runtime dedupe thành singleton.
2. **Remote parity build** (:3004): build/serve như một remote đầy đủ — giữ để demo expose từ shared và làm trang showcase standalone. Không app nào load `shared@...` qua MF lúc runtime.

## 9. Chạy local

```bash
pnpm install
pnpm start          # 8 dev servers (concurrently) — tất cả SSR mode
```

- App: http://localhost:3000 — Mỗi MFE chạy standalone: http://localhost:3002 (mock user PREMIUM)…
- Kiểm chứng SSR: `curl -s localhost:3000/login | grep 0021001` → thấy markup form từ remote.
- Smoke E2E (Playwright): `pnpm test:e2e` — webServer tự boot fleet → login → accounts → detail → 4 MFE → reload authed → logout, assert 0 console error nghiêm trọng ([e2e/smoke.spec.ts](e2e/smoke.spec.ts), [playwright.config.ts](playwright.config.ts)). CI chạy nightly + `workflow_dispatch`.

## 10. Deploy giả lập AWS (Docker + LocalStack)

Mô phỏng: **container = ECS service**, **LocalStack S3 = CDN static assets**.

```bash
pnpm docker:build    # build 8 image (docker/Dockerfile dùng chung, ARG APP)
pnpm docker:up       # 7 SSR services + LocalStack — http://localhost:3000
pnpm docker:down
```

Shell container nhận `MF_INTERNAL_HOST_MAP` để fetch manifest/bundles qua hostname nội bộ (`http://mfe-accounts:3002`), browser vẫn dùng `localhost:300x` — xem [docker/docker-compose.yml](docker/docker-compose.yml).

Đẩy static assets lên S3 LocalStack (giả lập CDN):

```bash
pnpm deploy:local    # scripts/deploy-localstack.sh
# build từng remote với PUBLIC_URL=http://localhost:4566/vietbank-static/<app>/
# rồi s3 sync dist/static + dist/bundles
```

## 11. Deploy AWS thật (reference)

[.github/workflows/deploy-aws.yml](.github/workflows/deploy-aws.yml) — 2 job:

1. **static-assets**: build các remote với `PUBLIC_URL=https://<CDN_DOMAIN>/<app>/` → `aws s3 sync` static + bundles → invalidate CloudFront.
2. **ssr-services** (matrix 7 app): build image từ `docker/Dockerfile` → push ECR → `aws ecs update-service`.

Cần chuẩn bị ngoài repo: OIDC role (`secrets.AWS_ROLE_ARN`), `vars`: `AWS_REGION`, `S3_BUCKET`, `CDN_DOMAIN`, `CF_DISTRIBUTION_ID`, `ECS_CLUSTER`, và ECS task definitions + ALB cho 7 service `app-*`. Trên CDN thật **không cần** `MF_INTERNAL_HOST_MAP` (CloudFront reachable từ cả server lẫn browser).

## 12. Troubleshooting

| Triệu chứng | Nguyên nhân / Fix |
|---|---|
| `Không thể tải MFE — remote ... có đang chạy không?` | Remote chết hoặc port bị chiếm. `curl localhost:300x/static/mf-manifest.json` rồi `pnpm --filter <mfe> start` xem log. |
| Browser fetch manifest bị CORS (prod server) | Container remote cần `MODERN_MF_AUTO_CORS=true` (đã set trong compose). |
| SSR log `ECONNREFUSED localhost:300x` trong Docker | Thiếu/sai `MF_INTERNAL_HOST_MAP` — server phải fetch qua service name. |
| `"path" is a built-in Node.js module...` khi dev | Race trong MF ssrPlugin kéo `@module-federation/node` vào web bundle — đã chặn bằng `chain.externals` trong mọi `modern.config.ts` (giữ nguyên dòng đó). |
| Dev server chết hàng loạt, log `write EPIPE` từ dts-plugin | MF DTS generation (dev-only) crash RPC child process → đã tắt `dts: false` trong mọi `module-federation.config.ts` (type khai báo tay ở `shell/mfe-declarations.d.ts`). |
| `SSR Error ... <Router> inside another <Router>` lác đác khi dev | Triệu chứng transient khi node-bundle đang rebuild / server chết giữa chừng — restart fleet sạch; không phải lỗi code (fleet khỏe không có lỗi này). |
| `The root layout component is required` | Modern.js ≥2.71 bắt buộc `src/routes/layout.tsx` (Outlet tối thiểu). |
| Hydration mismatch quanh auth | Không đọc localStorage lúc render đầu — dùng pattern `{ user, ready }` của AuthContext. |
| `localStorage.getItem is not a function` trong SSR log | Code chạy server thiếu guard `typeof window === 'undefined'`. |
| Toast / eventBus `getLast()` không cross-MFE | Thiếu `@app/shared/ui` / `@app/shared/eventBus` trong MF `shared:` map (host **và** remote). |

---

## 13. Tooling, test & mở rộng

**Chất lượng code** (chi tiết: [CONTRIBUTING.md](CONTRIBUTING.md)):

| Công cụ | Lệnh | Vai trò |
|---|---|---|
| Biome | `pnpm lint` / `pnpm lint:fix` | lint + format (1 binary) |
| tsc | `pnpm typecheck` | TypeScript strict mọi package |
| Vitest | `pnpm test` / `pnpm test:watch` | unit test (jsdom + Testing Library) |
| Lefthook | tự chạy | pre-commit (Biome) + commit-msg (commitlint) |
| Changesets | `pnpm changeset` | versioning độc lập từng package |

CI: [.github/workflows/ci.yml](.github/workflows/ci.yml) chạy lint → typecheck → test → build (matrix) trên mọi PR.

**Mở rộng — tạo MFE mới trong 1 lệnh:**

```bash
pnpm gen:mfe payments 3008 "Thanh toán"
```

Generator (Plop) sinh package đầy đủ + **tự đăng ký 10 điểm nối** (workspace, shell remotes/declarations/remotePages/Nav/route, start script, docker-compose, deploy-aws). Chi tiết + bước thủ công còn lại: [docs/add-new-mfe.md](docs/add-new-mfe.md).

**Test E2E** (smoke, cần Chrome + fleet đang chạy): `pnpm test:e2e` — login → accounts → detail → các MFE → logout, assert 0 console error.

---

**Lịch sử kiến trúc** (git history): webpack MF → Vite → Modern.js CSR (`d377b08`) → Next.js shell + MF runtime → Modern.js federated SSR → **base template (scoped `@app/*`, TS strict, tooling + generator) — hiện tại**.
