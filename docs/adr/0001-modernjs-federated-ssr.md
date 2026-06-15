# ADR 0001 — Modern.js + Federated SSR

## Bối cảnh
Cần base micro-frontend hỗ trợ SEO (SSR nội dung cả host lẫn remote).

## Quyết định
Dùng **Modern.js + Rspack + Module Federation 2.0** với SSR stream cho cả shell và remotes. Không dùng Next.js + `@module-federation/nextjs-mf` (đã deprecated, không hỗ trợ App Router, không federated SSR chính chủ).

## Hệ quả
- Shell là "thin host" SSR; remote public (Login) SSR thật (form trong HTML), remote protected dùng `noSSR` (stream skeleton, hydrate client) vì auth nằm ở localStorage.
- Bật SSR = thêm `server.ssr: { mode: 'stream' }` trong `modern.config.ts`; build sinh node bundle (`dist/bundles/`) + manifest merge `ssrRemoteEntry`/`ssrPublicPath`.
- Deploy cần Node server cho mỗi app (không phải static hosting thuần) — xem hướng AWS ECS.
