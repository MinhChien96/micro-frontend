# ADR 0006 — Styling (Tailwind), observability & DX (Storybook, MSW, e2e)

## Bối cảnh
Base đã vững về kiến trúc federated SSR. Để "đủ dùng cho dự án thật" cần thêm: styling
nhất quán cross-MFE, observability lỗi runtime, mock backend cho dev/test, và bộ test
đầy đủ hơn (coverage + e2e). Yêu cầu cốt lõi: KHÔNG phá SSR/federation, mỗi remote
độc lập, opt-in khi có thể.

## Quyết định

### Tailwind v4 làm styling chính
- Bật qua `@rsbuild/plugin-tailwindcss` trong `builderPlugins` của mỗi `modern.config.ts`
  (không dùng PostCSS config riêng).
- Tokens tập trung ở `shared/src/styles/theme.css` (`@theme` + `@custom-variant dark` +
  keyframes), import lại vào `src/tailwind.css` của từng app.
- **Cross-MFE CSS**: mỗi app `@source` quét cả `shared/src/**` → class của `@app/common/ui`
  (Tailwind) render đúng khi component shared chạy bên trong remote khác. Đây là ràng buộc
  bắt buộc — thiếu thì Toast/Spinner/Button vỡ style khi cross-MFE.
- **Phạm vi**: design system (`shared/ui`) + shell chrome + `mfe-auth` + generator dùng
  Tailwind. 5 MFE banking (accounts/transfer/cards/loans/profile) giữ `styles.css` + inline
  làm ví dụ domain — vẫn import `tailwind.css` để render shared/ui.

### Sentry (browser-only)
- `shared/src/observability/sentry.ts`: `initSentry()` no-op khi thiếu
  `MODERN_PUBLIC_SENTRY_DSN`; `captureException()` dùng trong `RemoteErrorBoundary`.
- KHÔNG đưa vào MF share-scope singleton (chỉ chạy browser, init 1 lần ở shell layout).
- Đọc env qua try/catch: Modern.js chỉ inline `MODERN_PUBLIC_*` khi var được set; chưa set
  thì `process` không tồn tại ở browser → ReferenceError. Try/catch giữ literal cho
  DefinePlugin + no-op an toàn.

### Storybook 10 (design system)
- Chỉ cho package `shared` (`@storybook/react-vite` + `@tailwindcss/vite` trong `viteFinal`),
  decorator dark toolbar. Là nơi review trực quan `@app/common/ui`.

### MSW 2 (mock API)
- `shared/src/mocks/`: handlers + node `server` (Vitest, qua `vitest.setup.ts`) + browser
  `worker` opt-in (`MODERN_MSW=true`, cần `pnpm dlx msw init <app>/public`).
- Mặc định TẮT → không can thiệp SSR/build. Hàm api mock hiện có giữ nguyên.

### Test: coverage + Playwright
- `test:coverage` (v8) gate vào `shared/src` (core tái dùng) với threshold floor chống
  regression — 5 MFE banking là example domain, không gate.
- `playwright.config.ts` + `e2e/smoke.spec.ts`: webServer tự boot fleet (`pnpm start`).
  CI chạy e2e nightly + `workflow_dispatch` (nặng: 8 server) — KHÔNG chặn PR.

### Renovate + typed cross-MFE contracts
- `.github/renovate.json`: gom nhóm PR theo Modern.js/MF/React/Tailwind/tooling.
- `shared/src/events.ts`: `AppEvents` map; `eventBus` generic over nó → emit/consume
  cross-MFE được typecheck (thay string literal `vb:transferPrefill` tự do trước đây).

## Hệ quả
- Mỗi remote `@import 'tailwindcss'` → preflight load nhiều lần (chấp nhận; nếu vỡ
  specificity dùng `@layer`).
- Env browser phải đọc phòng thủ (try/catch) — đã thành quy ước trong CONTRIBUTING.
- State update trong useEffect mà context gate Suspense boundary remote (noSSR) phải bọc
  `startTransition` (tránh "received an update before it finished hydrating").
