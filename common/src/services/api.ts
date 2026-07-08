import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ENDPOINTS } from '../constants/endpoints';
import { isPublicPath, Paths } from '../constants/paths';
import { clearAuthState, globalStore, setAuthToken, setRefreshToken } from '../stores/global.store';

// ============================================================================
// Tầng API dùng chung (port từ bank) — MỘT axios instance cho shell + mọi remote:
// - URL prefix "[public]" → không chờ/gắn token (login, refresh-token)
// - waitForApiHost: chờ shell set apiHost (race: remote gọi API trước khi boot xong)
// - waitForAuthToken: API private chờ token xuất hiện, quá 30s → logout
// - Unwrap envelope {data} + chuẩn hóa APIError
// - 401 → máy trạng thái refresh-token với 2 hàng đợi (retry + pending)
// ============================================================================

const PUBLIC_PREFIX = '[public]';
const AUTH_TOKEN_TIMEOUT_MS = 30_000;
const MAX_REFRESH_RETRY = 3;
const PERSIST_FLUSH_MS = 250; // > debounce persist của store (150ms)

export class APIError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  traceId?: string;

  constructor(
    message: string,
    opts: { status?: number; code?: string; details?: unknown; traceId?: string } = {},
  ) {
    super(message);
    this.name = 'APIError';
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.traceId = opts.traceId;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  retryNumber?: number;
}

// ---- Chờ điều kiện từ store -------------------------------------------------

function waitForApiHost(): Promise<string> {
  const { apiHost } = globalStore.getState();
  if (apiHost !== null) return Promise.resolve(apiHost);
  return new Promise((resolve) => {
    const unsub = globalStore.subscribe((state) => {
      if (state.apiHost !== null) {
        unsub();
        resolve(state.apiHost);
      }
    });
  });
}

function waitForAuthToken(timeoutMs = AUTH_TOKEN_TIMEOUT_MS): Promise<string> {
  const { authToken } = globalStore.getState();
  if (authToken) return Promise.resolve(authToken);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsub();
      handleLogout();
      reject(new APIError('Hết thời gian chờ đăng nhập', { code: 'AUTH_TIMEOUT' }));
    }, timeoutMs);
    const unsub = globalStore.subscribe((state) => {
      if (state.authToken) {
        clearTimeout(timer);
        unsub();
        resolve(state.authToken);
      }
    });
  });
}

// ---- Logout tập trung --------------------------------------------------------

let isLoggingOut = false;

export function handleLogout(): void {
  if (isLoggingOut) return;
  isLoggingOut = true;
  rejectQueues(new APIError('Phiên đăng nhập kết thúc', { code: 'SESSION_ENDED' }));
  clearAuthState();
  if (typeof window !== 'undefined' && !isPublicPath(window.location.pathname)) {
    // chờ store persist xong rồi mới rời trang
    setTimeout(() => window.location.replace(Paths.login), PERSIST_FLUSH_MS);
  } else {
    isLoggingOut = false;
  }
}

// ---- Máy trạng thái refresh token -------------------------------------------

let isRefreshingToken = false;

type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
/** request đã dính 401, chờ token mới để retry */
let failedRequestQueue: QueueEntry[] = [];
/** request mới tới TRONG LÚC đang refresh — xếp hàng chờ */
let pendingRequestsQueue: QueueEntry[] = [];

function rejectQueues(err: unknown): void {
  for (const q of [...failedRequestQueue, ...pendingRequestsQueue]) q.reject(err);
  failedRequestQueue = [];
  pendingRequestsQueue = [];
}

function resolveQueues(token: string): void {
  for (const q of [...failedRequestQueue, ...pendingRequestsQueue]) q.resolve(token);
  failedRequestQueue = [];
  pendingRequestsQueue = [];
}

async function refreshAuthToken(): Promise<string> {
  const { refreshToken, deviceId } = globalStore.getState();
  if (!refreshToken) throw new APIError('Không có refresh token', { code: 'NO_REFRESH_TOKEN' });
  const res = await instance.post(ENDPOINTS.refreshToken, { refreshToken, deviceId }, {
    skipRefresh: true,
    timeout: 10_000,
  } as AxiosRequestConfig);
  const data = res as unknown as { accessToken: string; refreshToken?: string };
  setAuthToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  return data.accessToken;
}

// ---- Axios instance ----------------------------------------------------------

const instance: AxiosInstance = axios.create({ timeout: 30_000 });

instance.interceptors.request.use(async (config) => {
  const cfg = config as RetriableConfig;

  // "[public]" → bỏ prefix, không chờ/gắn token
  if (cfg.url?.startsWith(PUBLIC_PREFIX)) {
    cfg.url = cfg.url.slice(PUBLIC_PREFIX.length);
    cfg.skipAuth = true;
  }

  cfg.baseURL = await waitForApiHost();

  const { lang, deviceId } = globalStore.getState();
  cfg.headers['Accept-Language'] = lang;
  cfg.headers['X-Device-Id'] = deviceId;

  if (!cfg.skipAuth) {
    // Đang refresh → xếp hàng chờ token mới rồi mới chạy
    if (isRefreshingToken && !cfg.skipRefresh) {
      const token = await new Promise<string>((resolve, reject) => {
        pendingRequestsQueue.push({ resolve, reject });
      });
      cfg.headers.Authorization = `Bearer ${token}`;
    } else if (!cfg.headers.Authorization) {
      const token = await waitForAuthToken();
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  }

  return cfg;
});

instance.interceptors.response.use(
  // Unwrap envelope {data, message, status} → caller nhận thẳng data
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) return body.data;
    return body;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // --- 401: refresh-token state machine ---
    const isRefreshCall = originalRequest?.url?.includes('/refresh-token');
    const inPrivatePath = typeof window === 'undefined' || !isPublicPath(window.location.pathname);

    if (status === 401 && originalRequest && !originalRequest.skipAuth && inPrivatePath) {
      if (isRefreshCall || originalRequest.skipRefresh) {
        handleLogout();
        throw normalizeError(error);
      }

      originalRequest.retryNumber = (originalRequest.retryNumber ?? 0) + 1;
      if (originalRequest.retryNumber > MAX_REFRESH_RETRY) {
        handleLogout();
        throw normalizeError(error);
      }

      if (isRefreshingToken) {
        // Đã có người refresh — vào hàng đợi, có token mới thì tự retry
        const token = await new Promise<string>((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject });
        });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      }

      isRefreshingToken = true;
      try {
        const token = await refreshAuthToken();
        resolveQueues(token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        rejectQueues(refreshError);
        handleLogout();
        throw normalizeError(error);
      } finally {
        isRefreshingToken = false;
      }
    }

    throw normalizeError(error);
  },
);

function normalizeError(error: AxiosError): APIError {
  if (error.response) {
    const body = error.response.data as
      | { message?: string; error?: string; code?: string; details?: unknown; traceId?: string }
      | undefined;
    return new APIError(body?.message || body?.error || error.message, {
      status: error.response.status,
      code: body?.code,
      details: body?.details,
      traceId: body?.traceId,
    });
  }
  if (error.request) {
    return new APIError('Lỗi kết nối mạng', { code: 'NETWORK_ERROR' });
  }
  return new APIError(error.message || 'Lỗi không xác định', { code: 'UNKNOWN' });
}

// ---- Public helpers ----------------------------------------------------------
// Lưu ý type: interceptor đã unwrap envelope nên cast qua unknown.

export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  (await instance.get(url, config)) as unknown as T;

export const apiPost = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => (await instance.post(url, body, config)) as unknown as T;

export const apiPut = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => (await instance.put(url, body, config)) as unknown as T;

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  (await instance.delete(url, config)) as unknown as T;

/** instance thô cho case đặc biệt (upload/download...) */
export const apiClient = instance;
