# Thêm một MFE mới

## Cách nhanh — generator

```bash
pnpm gen:mfe          # hỏi tương tác
# hoặc bypass prompt:
pnpm exec plop mfe payments 3008 "Thanh toán"
```

Tham số: **name** (kebab-case), **port** (4 số, chưa dùng), **label** (nhãn Nav).

Generator sinh `remotes/mfe-<name>/` đầy đủ (Modern.js CSR, Tailwind v4,
`export.remote.ts` + `generateExposes()`, standalone page, test mẫu) và
**tự đăng ký 8 điểm nối** qua anchor comment `// @plop:*`:

1. `remotes/mfe-<name>/` — package (pnpm-workspace glob `remotes/*` tự nhận)
2. `shell/src/routes/__private/<name>/$.tsx` — route splat (guard từ PrivateLayout)
3. `shell/remote-urls.ts` — port dev + nguồn manifest URL (`@plop:remote-port`)
4. `shell/src/components/remotePages.tsx` — export `remotePage(...)` (`@plop:remote-page`)
5. `shell/src/constants/menu.ts` — NavItem + prefetch (`@plop:nav-link`)
6. `package.json` — thêm vào `pnpm start` (concurrently, 3 chỗ)
7. `docker/docker-compose.yml` — service nginx static (`@plop:service`)
8. `.github/workflows/deploy-aws.yml` — DEFAULT app list

## Sau khi generate

```bash
pnpm install
pnpm lint:fix
pnpm dev            # chọn MFE mới trong menu, vào /<name>
```

Checklist tùy chọn (generator cũng in ra):

- [ ] Thêm section env vào `.env.example` (`# mfe-<name> ... # end mfe-<name>`)
- [ ] Thêm entry vào `remotes.json` (registry — team/exposes/repo)
- [ ] docker-compose: thêm `mfe-<name>` vào `depends_on` của service shell
- [ ] i18n: đổi NavItem `label` → `labelKey` + thêm key vào
      `shell/src/i18n/resources.ts` (vi + en)
- [ ] Nếu MFE gọi API: copy `config/public/mockServiceWorker.js` từ shell
      (standalone dùng MSW) + thêm handlers vào `common/src/mocks/handlers.ts`

## MFE sinh ra theo pattern nào?

Mặc định là **splat đơn giản** (như transfer/loans/profile): shell có 1 route
`$.tsx`, remote expose `<Name>App` tự render `<Routes>` con. Khi cần:

- **Pattern A** (shell giữ từng route, remote nhận `navigator`): xem
  `remotes/mfe-accounts` + `shell/src/routes/__private/accounts/` làm mẫu.
- **Pattern B** (zone — remote sở hữu nhánh router qua props): xem
  `remotes/mfe-cards` (`CardsRoutes` + `CardsRouteContext`).

So sánh: [architecture.md §4.2](./architecture.md#42-hai-pattern-nhúng-remote-học-từ-bank).

## Copy tay từ module mẫu (không dùng generator)

`remotes/mfe-accounts` là module mẫu đầy đủ nhất (Pattern A + api + i18n +
test). Copy → đổi tên trong `package.json` (`@app/mfe-<name>`),
`module-federation.config.ts` (`name: 'mfe_<name>'` + port trong `publicPath`),
`modern.config.ts` (port) → tự wire 8 điểm nối trên theo anchor `@plop:*`.

## Xóa một MFE

Gỡ ngược 8 điểm nối (grep tên MFE để tìm hết chỗ):

```bash
grep -rn "mfe-<name>\|mfe_<name>" --include="*.ts*" --include="*.json" --include="*.yml" . | grep -v node_modules
rm -rf remotes/mfe-<name> shell/src/routes/__private/<name>
pnpm install
```

Các anchor `@plop:*` giữ nguyên.
