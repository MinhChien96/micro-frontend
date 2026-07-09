// URL tuyệt đối cho static assets/chunks của remote này — thiếu nó, browser
// resolve remoteEntry.js/chunks theo origin của SHELL → 404 (bank pattern).
// Ưu tiên (biến rỗng '' coi như chưa set):
//   1. PUBLIC_URL                      — docker/CI build-arg per app
//   2. REMOTE_HOST_MFE_AUTH[+PORT][+BASE_PATH] — env per môi trường (.env.sit/.uat/...)
//   3. http://localhost:3001/        — dev local
export function resolvePublicPath(): string {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL;
  const host = process.env.REMOTE_HOST_MFE_AUTH;
  if (host) {
    const port = process.env.REMOTE_PORT_MFE_AUTH;
    const basePath = process.env.REMOTE_BASE_PATH_MFE_AUTH;
    return `${host}${port ? `:${port}` : ''}${basePath ? `/${basePath}` : ''}/`;
  }
  return 'http://localhost:3001/';
}
