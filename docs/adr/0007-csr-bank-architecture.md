# ADR-0007: Re-base theo kiến trúc bank production — CSR + runtime Module Federation

- **Trạng thái:** Accepted (2026-07-09)
- **Bối cảnh trước đó:** ADR-0001 (Modern.js federated SSR) → template SSR
  hoàn chỉnh trên branch `feat/modernjs-ssg-mfe`.

## Bối cảnh

Team có quyền tiếp cận source một hệ thống Internet Banking doanh nghiệp đang
chạy production, xây trên đúng stack template này hướng tới (Modern.js + MF).
Mục tiêu template là **khuôn cho dự án thật** — người làm template xong chuyển
sang dự án bank phải không bỡ ngỡ. Quyết định port các pattern production về,
và chọn giữa hai mô hình render: giữ federated SSR (đã làm) hay theo CSR như
bank.

## Quyết định

1. **CSR toàn tuyến (`ssr: false`) + remote đăng ký ĐỘNG lúc runtime** — theo
   đúng bank. Bản SSR giữ nguyên trên branch `feat/modernjs-ssg-mfe` làm lựa
   chọn cho dự án cần SEO; các pattern mới sẽ được port ngược sau (task riêng).
2. **Layout bank-style**: `common/` + `shell/` + `remotes/*` (workspace glob),
   mô phỏng polyrepo (`remotes.json` là registry).
3. **Global store dùng zustand** (bank dùng effector) — giữ nguyên semantics:
   singleton 3 lớp (MF share + globalThis), persist tách session/local,
   clearAuth giữ preferences. Chọn zustand vì phổ biến, dễ học hơn effector
   cho người mới; xác nhận bởi user.
4. **MSW làm mock backend** (bank dùng mock-server node rời) — tận dụng MSW đã
   có, chạy được cả browser (dev) lẫn node (test), không cần process riêng.
5. Port nguyên các pattern: `lazyRemoteWithFallback` + error plugin +
   generateExposes; axios refresh-token queue; login nextStep state machine +
   AutoSignOut; P/S/F entitled-actions; i18n đa instance; env section sync +
   dev-select; nginx no-cache manifest.

## Lý do CSR + runtime MF thắng SSR + static MF (cho template này)

| | CSR + runtime remotes (bank) | Federated SSR + static remotes |
|---|---|---|
| Deploy remote | **Không rebuild shell, user không cần F5** | Rebuild shell nếu đổi danh sách remote; cần dual-URL (browser/node) |
| Độ phức tạp | Thấp — không server runtime, serve static nginx | Cao — stream SSR, internalHostRewrite, externals gotchas |
| SEO | Không (chấp nhận — app sau đăng nhập không cần SEO) | Có |
| Đúng thực tế bank | ✅ 100% | ❌ |
| Hạ tầng | S3/CDN/nginx tĩnh | Node server per app (ECS/k8s) |

App ngân hàng/doanh nghiệp: 95% màn nằm sau đăng nhập → SEO vô nghĩa, trong
khi "deploy độc lập không đụng shell" là giá trị vận hành lớn nhất của MFE.

## Hệ quả

- **(+)** Người mới học template = học đúng kiến trúc dự án thật; cheatsheet
  của bank áp dụng gần như 1:1.
- **(+)** Hạ tầng rẻ và đơn giản (static + nginx), chuỗi chống-stale 3 lớp
  (no-cache manifest → ?t= force register → reload-once).
- **(−)** Mất SSR/SEO ở nhánh này — dự án cần SEO dùng branch SSR (chưa có
  các pattern mới; cần port ngược).
- **(−)** Hai flavor Pattern B tồn tại song song (cards = chuẩn router-via-props;
  transfer/loans/profile = splat dựa shared singleton) — chủ đích để dạy cả
  hai, docs phải nói rõ (architecture.md §4.2).
- Gotchas mới phải nhớ: assetPrefix/getPublicPath **tuyệt đối** cho remote
  (chunks resolve theo origin shell nếu thiếu); env inline build-time
  (try/catch khi đọc `MODERN_*`); MF shared key = import specifier.
