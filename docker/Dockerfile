# Dockerfile dùng chung cho mọi app (shell + remotes) — CSR static + nginx
# (mô hình bank: build → copy dist vào image nginx hardened).
#
# Build:  docker build -f docker/Dockerfile \
#           --build-arg APP=remotes/mfe-accounts \
#           --build-arg PUBLIC_URL=http://localhost:3002/ .
#
# APP         = đường dẫn app trong workspace (shell | remotes/mfe-*)
# PUBLIC_URL  = URL browser-facing cho static assets (bake vào publicPath)
# REMOTE_BASE = (chỉ shell) base URL manifest các remote khi deploy CDN
# MODERN_MSW  = true → bundle bật MSW làm mock backend (demo/e2e)
FROM node:24-alpine AS builder
ARG APP
ARG PUBLIC_URL=/
ARG REMOTE_BASE=
ARG MODERN_MSW=
ENV CI=true
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN PUBLIC_URL=${PUBLIC_URL} REMOTE_BASE=${REMOTE_BASE} MODERN_MSW=${MODERN_MSW} \
    pnpm --filter ./${APP} build

FROM nginx:1.27-alpine
ARG APP
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/${APP}/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://localhost:8080/health" >/dev/null 2>&1 || exit 1
