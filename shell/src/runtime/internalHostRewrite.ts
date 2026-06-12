// MF runtime plugin giải bài toán dual-URL khi SSR trong Docker/ECS:
//   - Browser tải manifest/chunks qua URL public (localhost:300x hoặc CDN) — giữ nguyên.
//   - Server (container shell) không reach được "localhost:3002" của host máy —
//     phải rewrite sang hostname nội bộ (http://mfe-accounts:3002).
// Map cấu hình qua env MF_INTERNAL_HOST_MAP (JSON), ví dụ:
//   {"http://localhost:3002":"http://mfe-accounts:3002", ...}
// Không set env (dev local) hoặc chạy trong browser → plugin no-op.

const isServer = typeof window === 'undefined';

// Resilience: remote down không được giết host. MF runtime 2.5.x throw
// RUNTIME-003 trong async không ai await (asyncLoadProcess) → unhandled
// rejection → Node exit. Nuốt RIÊNG lỗi Federation (đã có ErrorBoundary/
// fallback render phía UI); mọi lỗi khác giữ nguyên fail-fast.
if (isServer && !(globalThis as any).__vbMfRejectionGuard) {
  (globalThis as any).__vbMfRejectionGuard = true;
  process.on('unhandledRejection', (reason: any) => {
    const msg = String((reason && reason.message) ?? reason ?? '');
    if (msg.includes('Federation Runtime') || msg.includes('RUNTIME-')) {
      console.error('[mf-resilience] Remote không phản hồi (host vẫn sống):', msg.slice(0, 200));
      return;
    }
    throw reason;
  });
}

const map: Record<string, string> =
  isServer && process.env.MF_INTERNAL_HOST_MAP
    ? JSON.parse(process.env.MF_INTERNAL_HOST_MAP)
    : {};

const rewrite = (url?: string): string | undefined => {
  if (!url) return url;
  for (const [pub, internal] of Object.entries(map)) {
    if (url.startsWith(pub)) return internal + url.slice(pub.length);
  }
  return url;
};

export default function internalHostRewrite() {
  return {
    name: 'internal-host-rewrite',

    // Server fetch mf-manifest.json: rewrite URL entry của remote
    async beforeLoadRemoteSnapshot(args: any) {
      if (isServer && args?.moduleInfo?.entry) {
        args.moduleInfo.entry = rewrite(args.moduleInfo.entry);
      }
      return args;
    },

    // Sau khi có snapshot: rewrite ssrPublicPath/remoteEntry để node bundle
    // (bundles/remoteEntry.js) được tải qua hostname nội bộ
    async afterLoadSnapshot(args: any) {
      const s = args?.remoteSnapshot;
      if (isServer && s) {
        if (s.ssrPublicPath) s.ssrPublicPath = rewrite(s.ssrPublicPath);
        else if (s.publicPath) s.ssrPublicPath = rewrite(s.publicPath);
      }
      return args;
    },
  };
}
