# ADR 0005 — Health check cho container

## Bối cảnh
ECS/k8s/Docker cần health check để biết khi nào restart container / route traffic.

## Quyết định
**Liveness qua HTTP 200 ở `/`** — `docker/Dockerfile` có `HEALTHCHECK` gọi `wget http://localhost:$PORT/`. SSR server trả 200 = process sống. `docker-compose.yml`: shell `depends_on` các remote với `condition: service_healthy` (kế thừa HEALTHCHECK từ Dockerfile, mỗi container check PORT của mình).

## Vì sao không dùng /healthz chuyên dụng
Modern.js 2.71: middleware tùy biến (legacy `hook` từ `@modern-js/runtime/server`, hoặc `unstable_middleware` qua `modern.server-runtime.config.ts` + `@modern-js/server-runtime`) không wire gọn/ổn định trong dev lẫn serve (request rơi vào React routing, không short-circuit). Endpoint `/` đã thỏa nhu cầu orchestration (200 = healthy), tên endpoint chỉ là cosmetic.

## Extension point (khi cần /healthz + /readyz thật)
1. `pnpm add -D @modern-js/server-runtime` (mỗi app cần endpoint).
2. Tạo `<app>/modern.server-runtime.config.ts`:
   ```ts
   import { defineServerConfig } from '@modern-js/server-runtime';
   export default defineServerConfig({
     unstable_middleware: [
       async (c, next) => {
         if (new URL(c.request.url).pathname === '/healthz') return c.body('ok', { status: 200 });
         await next();
       },
     ],
   });
   ```
3. shell `/readyz`: fetch `/healthz` từng remote (qua MF_INTERNAL_HOST_MAP) → 200/503.
4. Đổi Dockerfile HEALTHCHECK sang `/healthz`.
