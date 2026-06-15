# ADR 0004 — Scoped namespace `@app/*` + brand tập trung

## Quyết định
- Package names scoped `@app/*` (`@app/shell`, `@app/shared`, `@app/mfe-*`) — tránh va chạm, dễ rename cho dự án thật (đổi scope `@app` → `@<org>`).
- **MF remote names** (`shell`, `mfe_accounts`…) là JS identifier RIÊNG, độc lập package name → giữ nguyên.
- Brand tập trung ở `@app/shared/brand` (`BRAND` const, SSR-safe) — shell/Nav/Helmet/`modern.config` đọc từ đây; đổi 1 chỗ để rebrand.
- Storage keys tập trung ở `@app/shared/auth` (`STORAGE_KEYS`, giá trị `app_*`); mọi truy cập qua `getUser/setUser/clearAuth`.

## Rename cho dự án thật
1. Đổi `@app` → `@<org>` trong mọi `package.json` + import specifier + MF `shared:` keys.
2. Sửa `@app/shared/brand` (tên/icon/tagline) và `STORAGE_KEYS` nếu muốn.
3. Thay 6 MFE banking (example domain) bằng domain thật — hoặc `pnpm gen:mfe` tạo mới.

## Lưu ý
Domain banking (accounts/transfer/cards/loans/profile/auth) là **example** — giữ làm reference, comment `// Example domain` ở đầu component.
