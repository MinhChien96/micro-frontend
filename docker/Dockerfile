# Dockerfile dùng chung cho mọi app trong workspace (shell + remotes).
# Build:  docker build -f docker/Dockerfile --build-arg APP=mfe-accounts \
#           --build-arg PUBLIC_URL=http://localhost:3002/ .
# PUBLIC_URL  = URL browser-facing cho static assets (bake vào publicPath + ssrPublicPath)
# REMOTE_BASE = (chỉ shell) base URL manifest các remote khi deploy CDN/S3
FROM node:24-alpine AS builder
ARG APP
ARG PUBLIC_URL=/
ARG REMOTE_BASE=
ENV CI=true
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN PUBLIC_URL=${PUBLIC_URL} REMOTE_BASE=${REMOTE_BASE} pnpm --filter ${APP} build

FROM node:24-alpine
ARG APP
ENV NODE_ENV=production
RUN corepack enable
# Image fat (mang cả workspace node_modules vì `modern serve` cần app-tools).
# Chấp nhận cho template; tối ưu sau bằng `modern deploy` (standalone output).
COPY --from=builder /repo /repo
WORKDIR /repo/${APP}
CMD ["pnpm", "serve"]
