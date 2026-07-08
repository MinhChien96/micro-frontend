import { RemoteUnavailable } from '@app/common/ui';
import { loadRemote, registerRemotes } from '@module-federation/modern-js-v3/runtime';
import * as React from 'react';
import { REMOTE_MANIFEST_URLS } from './config';

const MF_CHUNK_ERROR_RELOAD_KEY = 'mf_chunk_error_reload';
const RELOAD_COOLDOWN_MS = 30_000;

function isDev(): boolean {
  try {
    return process.env.NODE_ENV === 'development';
  } catch {
    return false;
  }
}

/**
 * Đăng ký remote với force: true để LUÔN cập nhật entry mới nhất.
 * Thêm ?t=timestamp vào manifest URL để bypass browser/CDN cache →
 * remote vừa deploy xong, user chỉ cần điều hướng là dùng bản mới,
 * KHÔNG cần rebuild shell (pattern bank).
 */
function registerRemoteWithLatestManifest(remoteName: string): void {
  const baseEntry = REMOTE_MANIFEST_URLS[remoteName];
  if (!baseEntry) return;

  const separator = baseEntry.includes('?') ? '&' : '?';
  const entry = `${baseEntry}${separator}t=${Date.now()}`;

  registerRemotes([{ name: remoteName, entry }], { force: true });
}

/**
 * Chunk 404 (remote vừa deploy đổi hash) → reload trang đúng 1 lần để nhận
 * manifest/chunk mới. Chống loop: không reload lại trong 30s (sessionStorage).
 * Dev mode không bao giờ reload.
 */
function tryForceReload(): boolean {
  if (isDev()) return false;

  const lastReload = sessionStorage.getItem(MF_CHUNK_ERROR_RELOAD_KEY);
  const now = Date.now();
  if (lastReload && now - Number(lastReload) < RELOAD_COOLDOWN_MS) return false;

  sessionStorage.setItem(MF_CHUNK_ERROR_RELOAD_KEY, String(now));
  const url = new URL(window.location.href);
  url.searchParams.set('_reload', String(now));
  window.location.replace(url.toString());
  return true;
}

/**
 * Prefetch remote (vd khi hover nav link): đăng ký + tải trước module,
 * lỗi nuốt im lặng — prefetch chỉ là tối ưu, không được phép gây crash.
 */
export function prefetchRemote(remoteName: string, exposeKey: string): void {
  try {
    registerRemoteWithLatestManifest(remoteName);
    loadRemote(`${remoteName}/${exposeKey}`).catch(() => {});
  } catch {
    // ignore — prefetch best-effort
  }
}

interface LazyRemoteOptions {
  fallback?: React.ReactNode;
}

// biome-ignore lint/suspicious/noExplicitAny: component props của remote không biết trước
type AnyComponent = React.ComponentType<any>;

/**
 * Trái tim của cơ chế MFE runtime (port từ bank):
 * 1. registerRemotes(force) + ?t= → luôn lấy manifest mới nhất
 * 2. loadRemote("remote/Expose") → unwrap default export
 * 3. Lỗi (manifest chết, chunk 404...) → tryForceReload() 1 lần;
 *    vẫn lỗi → render fallback <RemoteUnavailable/>
 */
export function lazyRemoteWithFallback(
  remoteName: string,
  exposeKey: string,
  options?: LazyRemoteOptions,
): React.LazyExoticComponent<AnyComponent> {
  const id = `${remoteName}/${exposeKey}`;

  return React.lazy(async (): Promise<{ default: AnyComponent }> => {
    const fallbackNode = options?.fallback ?? <RemoteUnavailable remote={id} />;
    try {
      registerRemoteWithLatestManifest(remoteName);
      const mod = await loadRemote(id);

      const Component: AnyComponent =
        typeof mod === 'object' && mod !== null && 'default' in mod
          ? (mod as { default: AnyComponent }).default
          : (mod as AnyComponent);

      if (Component) return { default: Component };

      console.warn(`[MF] Component not found for "${id}", attempting reload...`);
    } catch (error) {
      console.error(`[MF] Load failed for "${id}":`, error);
    }

    if (!tryForceReload()) {
      return { default: () => <>{fallbackNode}</> };
    }
    return { default: () => null };
  });
}
