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
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm test:e2e` | Smoke E2E (cần Chrome + fleet đang chạy) |
| `pnpm gen:mfe` | Tạo MFE mới (xem [docs/add-new-mfe.md](docs/add-new-mfe.md)) |
| `pnpm build` | Build mọi package |
| `pnpm changeset` | Tạo changeset cho versioning |

## Quy ước
- **Commit**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`). commitlint chặn ở `commit-msg`.
- **Code style**: Biome (single quote, trailing comma, width 100). pre-commit tự format staged files.
- **TypeScript strict** toàn bộ — không thêm `.js/.jsx` mới.
- **SSR-safe**: mọi truy cập `window`/`localStorage` phải guard `typeof window === 'undefined'`. Auth/storage đi qua `@app/shared/auth` (đừng hardcode key).
- **MF singleton**: khi expose/consume module shared, key trong `module-federation.config.ts` PHẢI khớp import specifier (`@app/shared/ui`...).

## Gate trước khi mở PR
`pnpm lint && pnpm typecheck && pnpm test && pnpm build` — CI (`.github/workflows/ci.yml`) chạy đúng các bước này.
