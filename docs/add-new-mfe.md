# Thêm một MFE mới

## Cách nhanh — generator

```bash
pnpm gen:mfe          # hỏi tương tác
# hoặc bypass prompt:
pnpm gen:mfe payments 3008 "Thanh toán"
```

Tham số: **name** (kebab-case), **port** (4 số, chưa dùng), **label** (nhãn hiển thị trên Nav).

MFE sinh ra đã có sẵn **Tailwind v4**: `src/tailwind.css` (`@import 'tailwindcss'` + tokens `@theme` của `shared` + `@source` quét cả shared), `builderPlugins: [pluginTailwindcss()]` trong `modern.config.ts`, và App component dùng className Tailwind + import `tailwind.css`.

Generator sinh `mfe-<name>/` đầy đủ (Modern.js SSR, đúng convention + gotchas) và **tự đăng ký 10 điểm nối** qua anchor comment `// @plop:*`:

1. `pnpm-workspace.yaml` — thêm package
2. `shell/module-federation.config.ts` — thêm remote
3. `shell/mfe-declarations.d.ts` — khai báo module TS
4. `shell/src/components/remotePages.tsx` — export lazy component
5. `shell/src/components/Nav.tsx` — link điều hướng
6. `shell/src/routes/<name>/$.tsx` — route (splat, ProtectedRoute + ErrorBoundary)
7. `package.json` — thêm vào `pnpm start` (concurrently)
8. `docker/docker-compose.yml` — service container
9–10. `.github/workflows/deploy-aws.yml` — app list (static + ssr matrix)

## Sau khi generate

```bash
pnpm install
pnpm biome check --write .
pnpm --filter ./mfe-<name> start    # chạy thử standalone
pnpm start                           # hoặc chạy cả fleet, vào /<name>
```

**Làm thủ công** (generator in checklist, JSON block scalar khó tự sửa an toàn) — trong `docker/docker-compose.yml` service `shell`:
- Thêm vào `MF_INTERNAL_HOST_MAP`: `"http://localhost:<port>":"http://mfe-<name>:<port>"`
- Thêm vào `depends_on`: `- mfe-<name>`

## Xóa một MFE

Xóa thư mục `mfe-<name>/` + `shell/src/routes/<name>/` và gỡ các dòng tương ứng tại 10 điểm nối trên (tìm theo tên). Các anchor `@plop:*` giữ nguyên.
