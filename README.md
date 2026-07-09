# Micro-Frontend Base Template — Modern.js + Runtime Module Federation

> **Template chuẩn production cho micro-frontend**, port kiến trúc từ một hệ
> thống Internet Banking đang chạy thật: shell + 6 remotes trên **Modern.js
> (ByteDance) + Rspack**, Module Federation 2.0 **đăng ký động lúc runtime**
> (deploy remote KHÔNG rebuild shell), global store singleton (zustand), tầng
> axios + refresh-token queue, phân quyền **P/S/F entitled-actions**, i18n đa
> instance, MSW làm mock backend, TypeScript strict, generator `pnpm gen:mfe`,
> deploy static nginx/S3.

> 🧩 **Đây là template** — domain banking (accounts/transfer/cards/loans/
> profile/auth) chỉ là **example**. Đổi brand ở `@app/common/brand`, scope
> `@app/*` → `@<org>/*`, thay/thêm MFE bằng `pnpm gen:mfe`.
>
> 🔎 Cần **SSR/SEO**? Bản federated-SSR của template nằm ở branch
> [`feat/modernjs-ssg-mfe`](../../tree/feat/modernjs-ssg-mfe).

**Chạy thử trong 2 phút:**

```bash
pnpm install && pnpm dev     # menu chọn remote (Enter = tất cả) → http://localhost:3000
# Đăng nhập: CIF 0021001 · Mật khẩu 123456 · OTP 123456
# Chọn role CUSTOMER / PREMIUM / BUSINESS để thấy phân quyền P/S/F hoạt động
```

---

## Tài liệu

| Tài liệu | Dành cho |
|---|---|
| **[docs/getting-started.md](docs/getting-started.md)** | Người mới — cài, chạy, thêm màn hình đầu tiên, troubleshooting |
| **[docs/architecture.md](docs/architecture.md)** | Deep-dive cơ chế: boot, MF runtime, routing 2 pattern, store, api, auth, i18n, deploy + **cheatsheet "muốn sửa X vào đâu"** |
| [docs/add-new-mfe.md](docs/add-new-mfe.md) | Generator `pnpm gen:mfe` + 8 điểm nối |
| [docs/adr/](docs/adr/) | Các quyết định kiến trúc (vì sao chọn gì) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Quy ước code, lệnh, PR gate |

---

## Bức tranh tổng thể

```
                        BROWSER
                           │
            ┌──────────────▼──────────────┐
            │   shell :3000 (Modern.js)   │  CSR host — sở hữu URL/auth/nav
            │   registerRemotes RUNTIME   │  qua mf-manifest.json (?t= no-cache)
            └──┬───────┬───────┬──────────┘
               │  deploy remote mới → shell KHÔNG rebuild
   ┌───────────┼───────┬───────┼───────────┬───────────┐
   ▼           ▼       ▼       ▼           ▼           ▼
 mfe-auth  mfe-accounts mfe-transfer  mfe-cards   mfe-loans  mfe-profile
  :3001      :3002       :3003         :3007       :3006      :3005
 (mỗi remote = 1 "repo" của 1 team, chạy standalone được, deploy độc lập)

 @app/common — chất keo singleton: globalStore (zustand) · apiClient (axios
 + refresh queue) · UI kit Tailwind · permissions P/S/F · i18nService · eventBus
```

## Những gì có trong hộp

| Nhóm | Năng lực |
|---|---|
| **MF runtime** | `lazyRemoteWithFallback` (register force + `?t=`, auto-reload chống stale, fallback RemoteUnavailable) · error-handling plugin (dev không cần bật đủ remote) · prefetch khi hover |
| **Routing** | 2 pattern của bank: **A** — shell giữ từng route, remote nhận `navigator` (mfe-accounts) · **B** — remote sở hữu cả nhánh, shell truyền module router (mfe-cards zone) · pathless groups `__public/__private` |
| **State** | globalStore zustand singleton 3 lớp · persist tách sessionStorage (phiên) / localStorage (prefs) · navigateLink điều hướng ngược |
| **API** | 1 axios instance toàn hệ thống · `[public]` prefix · wait apiHost/token · unwrap envelope `{data}` · APIError chuẩn hóa · **401 → refresh-token queue state machine** |
| **Auth** | Login state machine theo `nextStep` (OTP demo) · AutoSignOut idle 5' + countdown · guard tập trung ở PrivateLayout |
| **Phân quyền** | P/S/F entitled-actions (ActionEnum + PSFMapping + canAction) · `<PermissionCheck>` reactive |
| **i18n** | Mỗi module 1 instance i18next, đổi lang đồng loạt không reload (vi/en) |
| **Mock backend** | MSW (worker dev + node test) — auth/accounts/transfers đầy đủ; tắt bằng cách trỏ `MODERN_API_BASE_URL` |
| **DX** | `pnpm dev` menu chọn remote · env chia section + `sync-env` · `pnpm gen:mfe` (8 điểm nối tự wire) · Storybook UI kit · Tailwind v4 tokens |
| **Chất lượng** | Biome · Vitest + coverage gate (common) · Playwright e2e · Lefthook + commitlint · Renovate · Sentry hook sẵn |
| **Deploy** | Static nginx per app (Docker compose) · S3/CloudFront reference workflow · chuỗi chống-stale 3 lớp |

## Cấu trúc workspace

```
common/     @app/common — thư viện dùng chung (singleton qua MF share)
shell/      host :3000 — routes (__public/__private), remote/ (load runtime), menu
remotes/    mfe-auth · mfe-accounts · mfe-transfer · mfe-cards · mfe-loans · mfe-profile
scripts/    sync-env.mjs · dev-select.mjs · deploy-localstack.sh
docker/     Dockerfile (static+nginx) · nginx.conf · docker-compose.yml
plop-templates/  template generator MFE
docs/ e2e/  tài liệu · Playwright smoke
```

## Lệnh chính

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Menu chọn remote chạy kèm shell |
| `pnpm start` | Chạy tất cả (Playwright webServer dùng lệnh này) |
| `pnpm gen:mfe` | Sinh MFE mới + tự đăng ký |
| `pnpm lint` · `pnpm typecheck` · `pnpm test:coverage` | Gate PR |
| `pnpm test:e2e` | Smoke e2e (tự boot fleet) |
| `pnpm storybook` | UI kit :6006 |
| `pnpm docker:build && pnpm docker:up` | Giả lập production (nginx per app) |

## Nguồn gốc kiến trúc

Template này port các pattern đang chạy production tại một hệ thống Internet
Banking doanh nghiệp (Modern.js + MF runtime động + store singleton + axios
refresh queue + P/S/F permissions + i18n đa instance). Khác biệt chính: store
dùng **zustand** thay effector, mock backend dùng **MSW** thay mock-server
rời, demo domain + UI kit Tailwind riêng.
Xem [docs/adr/0007](docs/adr/0007-csr-bank-architecture.md).

**Lịch sử kiến trúc** (git branches): webpack MF → Vite
(`feat/enterprise-architecture`) → Modern.js federated SSR
(`feat/modernjs-ssg-mfe`) → **CSR + runtime MF theo bank — hiện tại**.
