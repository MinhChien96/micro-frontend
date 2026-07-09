# Getting Started — cho người mới (từng bước)

> Mục tiêu: sau 15 phút bạn chạy được toàn bộ hệ thống, hiểu chỗ nào làm gì,
> và thêm được màn hình đầu tiên. Chi tiết cơ chế bên trong đọc
> [architecture.md](./architecture.md).

## 0. Chuẩn bị

- Node.js ≥ 22 (khuyến nghị 24 — xem `.nvmrc`)
- pnpm ≥ 10: `corepack enable` hoặc `npm i -g pnpm`

## 1. Cài & chạy

```bash
pnpm install

# Cách 1 (khuyến nghị): menu chọn remote muốn chạy kèm shell
pnpm dev
#   Chọn remote chạy kèm shell (Enter = tất cả):
#     1. mfe-accounts   2. mfe-auth   3. mfe-cards ...
#   → gõ "1 2" nếu chỉ làm việc với accounts + auth
#   Màn thuộc remote KHÔNG bật sẽ hiện "Tính năng tạm thời không khả dụng" —
#   app không crash (không cần bật đủ 6 remote).

# Cách 2: chạy tất cả
pnpm start
```

Mở **http://localhost:3000**:

- Đăng nhập demo: mã KH `0021001` / mật khẩu `123456` / OTP `123456`
- Chọn "Loại tài khoản" để thử 3 hồ sơ quyền: CUSTOMER / PREMIUM / BUSINESS
  (vd CUSTOMER thấy nút "Quốc tế 🔒" bị khóa ở màn Chuyển tiền)
- **Backend là MSW** (mock ngay trong browser) — không cần server nào khác.

Port map: shell `3000` · auth `3001` · accounts `3002` · transfer `3003` ·
common `3004` (demo UI kit) · profile `3005` · loans `3006` · cards `3007`.

### Chạy một remote độc lập (không cần shell)

```bash
pnpm --filter ./remotes/mfe-accounts start
# → http://localhost:3002 — trang standalone với phiên mock sẵn
```

## 2. Cây thư mục — nhìn 30 giây

```
common/     thư viện dùng chung (store, apiClient, UI kit, permissions, i18n, mocks)
shell/      app host :3000 — sở hữu URL/route/auth/nav
remotes/    6 MFE — mỗi cái mô phỏng một repo của một team
scripts/    sync-env (đồng bộ env theo section), dev-select (menu pnpm dev)
docker/     Dockerfile + nginx.conf + compose (mỗi app 1 container static)
docs/       tài liệu (file này, architecture.md, add-new-mfe.md, adr/)
e2e/        Playwright smoke test
```

## 3. Luồng làm việc thường gặp

### 3.1. Thêm màn hình vào remote CÓ SẴN (Pattern A — như mfe-accounts)

1. Viết component trong `remotes/<m>/src/components/MyScreen.tsx`
   (nhận `navigator: NavigateFunction` qua props nếu cần điều hướng).
2. Mở `remotes/<m>/src/components/export.remote.ts` — thêm:
   ```ts
   import MyScreen from './MyScreen';
   export default { ...đã có, MyScreen };
   ```
   → tự động được expose (nhờ `generateExposes()`).
3. Trong shell: thêm export vào `shell/src/components/remotePages.tsx`
   (`remotePage('mfe_<m>', 'MyScreen', <skeleton/>)`) + tạo
   `shell/src/routes/__private/<path>/page.tsx` render nó.
4. Cần lên menu? Thêm `NavItem` vào `shell/src/constants/menu.ts`.
5. Cần chặn quyền? Bọc `<PermissionCheck actions={ActionEnum.fX}>`.

### 3.2. Thêm màn hình vào ZONE (Pattern B — mfe-cards)

Chỉ sửa remote: thêm `<Route path="..." element={...}/>` trong
`remotes/mfe-cards/src/components/CardsRoutes.tsx`. **Không đụng shell.**

### 3.3. Tạo MFE hoàn toàn mới

```bash
pnpm gen:mfe        # hỏi tên / port / nhãn Nav — wire tự động 8 điểm
pnpm install && pnpm dev
```

Chi tiết + checklist sau khi gen: [add-new-mfe.md](./add-new-mfe.md).

### 3.4. Gọi API mới

1. Thêm handler mock vào `common/src/mocks/handlers.ts` (envelope `{ data }`).
2. Trong remote: `remotes/<m>/src/api/x.ts`:
   ```ts
   import { apiGet } from '@app/common/services';
   export const fetchX = (): Promise<X[]> => apiGet(withMyService('/x'));
   ```
3. Dùng với react-query như bình thường. apiClient tự lo token/refresh/lỗi.

### 3.5. Nối backend THẬT (bỏ mock)

```bash
cp .env.example .env.local
# sửa section # global: MODERN_API_BASE_URL=https://gateway.cong-ty.com
pnpm sync-env && pnpm dev   # restart là bắt buộc (env inline lúc build)
```

Backend cần trả envelope `{ data, message?, code? }` + hỗ trợ các endpoint
auth (`/auth/login` nextStep, `/auth/refresh-token`) — hoặc sửa
`common/src/services/api.ts` + `Login.tsx` theo contract thật của bạn.

## 4. Lệnh hay dùng

| Lệnh | Làm gì |
|---|---|
| `pnpm dev` | Menu chọn remote + chạy dev |
| `pnpm lint` / `pnpm lint:fix` | Biome check / tự sửa |
| `pnpm typecheck` | tsc toàn workspace |
| `pnpm test` / `pnpm test:coverage` | Vitest (+ coverage gate cho common) |
| `pnpm test:e2e` | Playwright smoke (tự boot cả fleet) |
| `pnpm storybook` | Storybook UI kit của common (:6006) |
| `pnpm gen:mfe` | Sinh MFE mới |
| `pnpm sync-env` | Đồng bộ `.env.local` root → từng module |
| `pnpm docker:build && pnpm docker:up` | Giả lập production (nginx per app) |

## 5. Khắc phục sự cố

| Triệu chứng | Nguyên nhân / cách xử lý |
|---|---|
| Màn hình hiện "Tính năng tạm thời không khả dụng" | Remote tương ứng chưa chạy → `pnpm dev` chọn thêm nó; hoặc check mở được `http://localhost:<port>/static/mf-manifest.json` |
| `ReferenceError: process is not defined` (browser) | Đọc `process.env.MODERN_*` khi biến chưa set — bọc try/catch (xem §5.2 architecture.md) |
| Đổi env không ăn | Env là build-time → restart dev/rebuild; `<module>/.env.local` có key cũ (sync không ghi đè) → `pnpm sync-env --force` |
| Trang tự reload 1 lần rồi vẫn lỗi | Cơ chế chống stale-chunk (tối đa 1 lần/30s). Vẫn lỗi = remote thực sự chết |
| Console "Unsatisfied version ... shared" | Lệch version thư viện shared giữa shell và remote — đồng bộ package.json |
| Đăng nhập xong F5 bị văng | sessionStorage bị xóa (trình duyệt chặn?) — phiên nằm ở `sessionStorage.app_global` |
| 401 liên tục / văng về login | refreshToken hết hạn (mock: token `access-<expiry>` sống 1h) — đăng nhập lại |
| Port bị chiếm | App tự nhảy port kế tiếp → remote lệch port so với manifest URL. Giải phóng port hoặc set `REMOTE_PORT_MFE_X` |
| Test treo khi gọi api | Test cần phiên: `beforeAll(() => setupStandaloneSession())` (MSW node server đã bật sẵn trong vitest.setup.ts) |

## 6. Đọc tiếp

- [architecture.md](./architecture.md) — cơ chế bên trong + cheatsheet "muốn sửa X vào đâu"
- [add-new-mfe.md](./add-new-mfe.md) — generator + 8 điểm nối
- [adr/](./adr/) — các quyết định kiến trúc (vì sao CSR, vì sao zustand...)
- Bản SSR (cho dự án cần SEO): branch `feat/modernjs-ssg-mfe`
