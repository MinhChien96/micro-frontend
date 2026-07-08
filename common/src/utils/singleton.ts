/**
 * Cache instance trên globalThis — tầng bảo hiểm cuối cùng của mô hình
 * singleton cross-MFE (bank pattern): kể cả khi một remote lỡ bundle bản
 * copy riêng của module store (vd import relative thay vì qua MF share),
 * mọi bản copy vẫn tái dùng đúng MỘT instance đã tạo trước đó.
 */
export function getOrCreateSingleton<T>(key: string, factory: () => T): T {
  const g = globalThis as unknown as Record<string, T>;
  if (!g[key]) {
    g[key] = factory();
  }
  return g[key];
}
