# Contributing

## Yêu cầu môi trường
- Node theo `.nvmrc` (`nvm use`), pnpm ≥ 10.
- `pnpm install` (tự cài git hooks qua lefthook).

## Lệnh thường dùng
| Lệnh | Việc |
|---|---|
| `pnpm dev` | Menu chọn remote chạy kèm shell (không cần bật đủ) |
| `pnpm start` | Chạy toàn bộ MFE + shell |
| `pnpm lint` / `pnpm lint:fix` | Biome lint+format |
| `pnpm typecheck` | `tsc --noEmit` mọi package |
| `pnpm test` / `pnpm test:watch` | Vitest (jsdom + Testing Library + MSW node) |
| `pnpm test:coverage` | Vitest + coverage v8 (gate vào `common/src`) |
| `pnpm test:e2e` | Smoke E2E Playwright (tự boot fleet qua webServer) |
| `pnpm storybook` | Storybook design system (`@app/common/ui`) tại :6006 |
| `pnpm gen:mfe` | Tạo MFE mới (xem [docs/add-new-mfe.md](docs/add-new-mfe.md)) |
| `pnpm sync-env` | Đồng bộ `.env.local` root → từng module (theo section) |
| `pnpm build` | Build mọi package |
| `pnpm changeset` | Tạo changeset cho versioning |

## Quy ước
- **Commit**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`). commitlint chặn ở `commit-msg`.
- **Code style**: Biome (single quote, trailing comma, width 100). pre-commit tự format staged files.
- **TypeScript strict** toàn bộ — không thêm `.js/.jsx` mới.
- **State/phiên**: đi qua `@app/common/stores` (zustand singleton) hoặc facade `@app/common/auth` — đừng tự đọc/ghi storage (store đã persist tách session/local).
- **API**: mọi request qua `apiGet/apiPost` của `@app/common/services` (tự lo token/refresh/APIError) — đừng gọi fetch/axios trực tiếp. Endpoint bọc `with*Service()`.
- **Phân quyền**: check bằng `canAction`/`<PermissionCheck actions={ActionEnum.x}>` — đừng suy quyền từ `user.role`.
- **Routing trong remote (Pattern A)**: component expose nhận `navigator` prop, KHÔNG import react-router runtime (chỉ type). Zone (Pattern B) lấy router từ context của zone.
- **MF singleton**: module có state module-level (store, context, eventBus) PHẢI có trong `shared` của MỌI MF config, key khớp import specifier (`@app/common/stores`...).
- **Env browser**: biến `MODERN_*` là build-time; khi var có thể KHÔNG set, đọc qua try/catch (Modern.js không inline → `process` không tồn tại ở browser → crash). Xem `shell/src/routes/layout.tsx`.
- **Styling**: Tailwind v4 (tokens `@theme` ở `common/src/styles/theme.css`, dark qua `[data-theme]`). Mỗi app có `src/tailwind.css` với `@source` quét cả `common` để class của `@app/common/ui` render cross-MFE.
- **i18n**: chuỗi hiển thị qua `useAppTranslation('<module>', resources)`, key prefix theo module.

## Gate trước khi mở PR
`pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build` — CI (`.github/workflows/ci.yml`) chạy đúng các bước này. E2E (`pnpm test:e2e`) chạy nightly + thủ công (`workflow_dispatch`), không chặn PR.
