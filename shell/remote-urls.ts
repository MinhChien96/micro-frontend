// Nguồn sự thật duy nhất về danh sách remote + URL manifest của chúng.
// Dùng bởi cả module-federation.config.ts (remotes tĩnh khi dev) lẫn
// modern.config.ts (inline vào browser qua source.define cho runtime registration).
//
// Ưu tiên URL (giống bank: REMOTE_HOST/PORT/BASE_PATH per remote):
//   1. REMOTE_HOST_<NAME> [+ REMOTE_PORT_<NAME>] [+ REMOTE_BASE_PATH_<NAME>]
//   2. REMOTE_BASE (CDN/S3 chung, path = tên thư mục remote)
//   3. http://localhost:<port dev mặc định>

export const REMOTES: Record<string, number> = {
  mfe_auth: 3001,
  mfe_accounts: 3002,
  mfe_transfer: 3003,
  mfe_profile: 3005,
  mfe_loans: 3006,
  mfe_cards: 3007,
  // @plop:remote-port (generator chèn remote mới bên trên)
};

const dirOf = (name: string) => name.replace(/_/g, '-'); // mfe_auth → mfe-auth

export function manifestUrlOf(name: string): string {
  const envKey = name.toUpperCase(); // MFE_AUTH
  const host = process.env[`REMOTE_HOST_${envKey}`];
  const port = process.env[`REMOTE_PORT_${envKey}`];
  const basePath = process.env[`REMOTE_BASE_PATH_${envKey}`];
  if (host) {
    const portPart = port ? `:${port}` : '';
    const basePart = basePath ? `/${basePath}` : '';
    return `${host}${portPart}${basePart}/static/mf-manifest.json`;
  }
  const base = process.env.REMOTE_BASE;
  if (base) return `${base}/${dirOf(name)}/static/mf-manifest.json`;
  return `http://localhost:${REMOTES[name]}/static/mf-manifest.json`;
}

export function buildManifestUrls(): Record<string, string> {
  return Object.fromEntries(Object.keys(REMOTES).map((name) => [name, manifestUrlOf(name)]));
}
