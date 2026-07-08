import { nanoid } from 'nanoid';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { User } from '../auth';
import { getOrCreateSingleton } from '../utils/singleton';

// ============================================================================
// $GlobalStore của template (port từ bank, effector → zustand):
// - Singleton 3 lớp: MF share '@app/common/stores' + getOrCreateSingleton(globalThis)
// - Persist TÁCH 2 nơi (debounce 150ms):
//     sessionStorage → user/authToken/refreshToken (đóng tab là hết phiên, F5 giữ)
//     localStorage   → preferences (lang/theme/deviceId/pinnedNav — giữ vĩnh viễn)
// - clearAuth: xóa phiên nhưng GIỮ preferences
// ============================================================================

export type Lang = 'vi' | 'en';
export type Theme = 'light' | 'dark';

export interface NavigateLink {
  to: string;
  data?: unknown;
}

export interface GlobalState {
  authToken: string | null;
  refreshToken: string | null;
  user: User | null;
  deviceId: string;
  lang: Lang;
  theme: Theme;
  /**
   * Base URL API gateway — shell set lúc boot ('' = same-origin/MSW).
   * null = CHƯA cấu hình → apiClient chờ (waitForApiHost) rồi mới gọi,
   * giải quyết race "remote gọi API trước khi shell kịp set env".
   */
  apiHost: string | null;
  /** "Event bus" điều hướng: remote/common set, PrivateLayout của shell consume */
  navigateLink: NavigateLink | null;
  pinnedNav: string[];
}

const STORAGE_KEY = 'app_global';
const PERSIST_DEBOUNCE_MS = 150;

// Dùng window.localStorage tường minh (Node 25 có global localStorage giả
// không đầy đủ method) + try/catch cho môi trường storage bị khóa.
const hasStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage?.setItem === 'function';

function loadPersisted(): Partial<GlobalState> {
  if (!hasStorage()) return {};
  try {
    const prefs = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    const session = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '{}');
    // session ghi đè prefs → F5 giữ phiên đăng nhập, đóng tab thì mất
    return { ...prefs, ...session };
  } catch {
    return {};
  }
}

function persist(state: GlobalState): void {
  try {
    const { user, authToken, refreshToken, navigateLink: _link, apiHost: _host, ...prefs } = state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user, authToken, refreshToken }));
  } catch {
    /* storage không khả dụng — bỏ qua, state vẫn sống trong memory */
  }
}

function createGlobalStore() {
  const store = createStore<GlobalState>(() => ({
    authToken: null,
    refreshToken: null,
    user: null,
    deviceId: nanoid(),
    lang: 'vi' as Lang,
    theme: 'light' as Theme,
    apiHost: null,
    navigateLink: null,
    pinnedNav: [],
    ...loadPersisted(),
  }));

  if (hasStorage()) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    store.subscribe((state) => {
      clearTimeout(timer);
      timer = setTimeout(() => persist(state), PERSIST_DEBOUNCE_MS);
    });
    // Redirect/đóng tab trong khoảng debounce vẫn không mất state
    window.addEventListener('beforeunload', () => persist(store.getState()));
  }

  return store;
}

/** Store instance duy nhất toàn hệ thống (shell + mọi remote) */
export const globalStore = getOrCreateSingleton('__APP_GLOBAL_STORE__', createGlobalStore);

// ---- Actions (tương đương events của bank) --------------------------------

export const setAuthToken = (authToken: string | null): void => globalStore.setState({ authToken });

export const setRefreshToken = (refreshToken: string | null): void =>
  globalStore.setState({ refreshToken });

export const setGlobalUser = (user: User | null): void => globalStore.setState({ user });

export const setLang = (lang: Lang): void => globalStore.setState({ lang });

export const setTheme = (theme: Theme): void => globalStore.setState({ theme });

export const setApiHost = (apiHost: string): void => globalStore.setState({ apiHost });

export const setNavigateLink = (navigateLink: NavigateLink | null): void =>
  globalStore.setState({ navigateLink });

export const setPinnedNav = (pinnedNav: string[]): void => globalStore.setState({ pinnedNav });

export const batchUpdate = (patch: Partial<GlobalState>): void => globalStore.setState(patch);

/** Logout/401: xóa phiên nhưng GIỮ preferences (lang/theme/deviceId/pinnedNav) */
export const clearAuthState = (): void =>
  globalStore.setState({ authToken: null, refreshToken: null, user: null, navigateLink: null });

// ---- React hook ------------------------------------------------------------

/** Đọc store trong React: useGlobalStore(s => s.user) — re-render theo selector */
export function useGlobalStore<T>(selector: (state: GlobalState) => T): T {
  return useStore(globalStore, selector);
}
