# ADR 0003 — `@app/common` dual-nature + gotchas MF

## `@app/common` có hai vai trò
1. **Workspace package** (đường sống): các app `import '@app/common/ui'` resolve qua `exports` map → bundle vào từng app, đồng thời khai báo trong MF `shared:` để runtime dedupe thành **singleton**.
2. **Remote parity** (:3004): build/serve như remote đầy đủ (showcase standalone). Không app nào load `@app/common@...` qua MF lúc runtime.

→ Khi đổi đuôi file / thêm expose: phải đồng bộ `package.json` exports **và** `module-federation.config.ts` exposes.

## Quy tắc singleton (rủi ro #1)
Key trong MF `shared:` (`@app/common/ui`, `@app/common/eventBus`) **phải khớp 100%** import specifier. Lệch → 2 bản ToastContext / eventBus cache → toast & cross-MFE event chết. Bằng chứng còn sống: e2e bước transfer (eventBus prefill + toast).

## Gotchas KHÔNG được phá
- `dts: false` trong mọi `module-federation.config.ts` — dts-plugin 2.5.1 crash `write EPIPE` kéo chết dev fleet. Types khai tay ở `shell/mfe-declarations.d.ts`.
- `tools.bundlerChain` externalize `@module-federation/node/utils` khỏi web bundle (race trong MF ssrPlugin → "path is a built-in module").
- Dual-URL trong Docker/ECS: `shell/src/runtime/internalHostRewrite.ts` rewrite host server-side theo `MF_INTERNAL_HOST_MAP` + nuốt riêng lỗi Federation (remote chết không kéo chết host).
- Modern.js ≥2.71 bắt buộc `src/routes/layout.tsx` mỗi app.
- Mọi `window`/`localStorage` phải guard SSR.
