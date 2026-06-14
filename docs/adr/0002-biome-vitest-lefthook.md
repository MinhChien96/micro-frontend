# ADR 0002 — Tooling: Biome + Vitest + Lefthook

## Quyết định
- **Biome** cho lint + format (1 binary, nhanh, không đụng Rspack). Không type-aware lint → bù bằng `tsc --noEmit` strict làm gate riêng.
- **Vitest** + Testing Library + jsdom cho unit test. MF remote (`mfe_*/App`) không resolve trong test → alias về stub; `@app/shared/*` resolve thật qua workspace exports.
- **Lefthook** (thay husky + lint-staged): 1 file YAML, pre-commit chạy `biome --write` staged files, commit-msg chạy commitlint.
- **Changesets** cho versioning độc lập từng package.

## Lý do
Ưu tiên ít công cụ / ít config (dễ bảo trì) hơn là ESLint stack nhiều plugin dễ vỡ khi bump Modern.js.

## Hệ quả
- a11y/array-index rules để mức `warn` cho code example-domain (siết `error` cho dự án thật).
- `tsconfig.base.json` `types: [vitest/globals, @testing-library/jest-dom]` để test typecheck được.
