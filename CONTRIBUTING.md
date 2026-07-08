# Contributing

## Yêu cầu môi trường
- Node theo `.nvmrc` (`nvm use`), pnpm ≥ 10.
- `pnpm install` (tự cài git hooks qua lefthook).

## Lệnh thường dùng
| Lệnh | Việc |
|---|---|
| `pnpm start` | Chạy toàn bộ MFE + shell (dev SSR) |
| `pnpm lint` / `pnpm lint:fix` | Biome lint+format |
| `pnpm typecheck` | `tsc --noEmit` mọi package |
| `pnpm test` / `pnpm test:watch` | Vitest (jsdom + Testing Library) |
| `pnpm test:coverage` | Vitest + coverage v8 (gate vào `shared/src`) |
| `pnpm test:e2e` | Smoke E2E Playwright (tự boot fleet qua webServer) |
| `pnpm storybook` | Storybook design system (`@app/common/ui`) tại :6006 |
| `pnpm gen:mfe` | Tạo MFE mới (xem [docs/add-new-mfe.md](docs/add-new-mfe.md)) |
| `pnpm build` | Build mọi package |
| `pnpm changeset` | Tạo changeset cho versioning |

## Quy ước
- **Commit**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`). commitlint chặn ở `commit-msg`.
- **Code style**: Biome (single quote, trailing comma, width 100). pre-commit tự format staged files.
- **TypeScript strict** toàn bộ — không thêm `.js/.jsx` mới.
- **SSR-safe**: mọi truy cập `window`/`localStorage` phải guard `typeof window === 'undefined'`. Auth/storage đi qua `@app/common/auth` (đừng hardcode key).
- **MF singleton**: khi expose/consume module shared, key trong `module-federation.config.ts` PHẢI khớp import specifier (`@app/common/ui`...).
- **Env browser**: chỉ var prefix `MODERN_PUBLIC_*` mới được inline vào bundle. Khi var có thể KHÔNG set, đọc qua try/catch (Modern.js không inline → `process` không tồn tại ở browser → crash). Xem `shared/src/observability/sentry.ts`.
- **Styling**: dùng Tailwind v4 (tokens `@theme` ở `shared/src/styles/theme.css`, dark qua `[data-theme]`). Mỗi app có `src/tailwind.css` với `@source` quét cả `shared` để class của `@app/common/ui` render cross-MFE.

## Gate trước khi mở PR
`pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build` — CI (`.github/workflows/ci.yml`) chạy đúng các bước này. E2E (`pnpm test:e2e`) chạy nightly + thủ công (`workflow_dispatch`), không chặn PR.
