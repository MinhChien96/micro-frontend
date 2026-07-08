// URL manifest từng remote — inline lúc BUILD qua source.define trong
// modern.config.ts (đổi env REMOTE_* phải restart dev/rebuild).
// try/catch bắt buộc: nếu define thiếu, biểu thức process.env.* giữ nguyên
// literal → `process` không tồn tại ở browser → ReferenceError.
export const REMOTE_MANIFEST_URLS: Record<string, string> = (() => {
  try {
    return JSON.parse(process.env.REMOTE_MANIFEST_URLS ?? '{}');
  } catch {
    return {};
  }
})();
