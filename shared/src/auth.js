import { getPermissionsForRole } from './utils/permissions';

const KEY_USER = 'vietbank_user';
const KEY_TOKEN = 'vietbank_token';

// SSR guard: server không có localStorage (Node 22+ có global localStorage
// nhưng không hoạt động nếu thiếu --localstorage-file) → luôn coi là chưa đăng nhập
const hasStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getUser = () => {
  if (!hasStorage()) return null;
  try {
    return JSON.parse(localStorage.getItem(KEY_USER) || 'null');
  } catch {
    return null;
  }
};

export const setUser = (user) => localStorage.setItem(KEY_USER, JSON.stringify(user));

export const getToken = () => (hasStorage() ? localStorage.getItem(KEY_TOKEN) : null);

export const setToken = (token) => localStorage.setItem(KEY_TOKEN, token);

export const clearAuth = () => {
  localStorage.removeItem(KEY_USER);
  localStorage.removeItem(KEY_TOKEN);
};

export const isAuthenticated = () => !!getToken();

export const getPermissions = () => {
  const user = getUser();
  if (!user) return [];
  return getPermissionsForRole((user.role || 'CUSTOMER').toUpperCase());
};

export const hasPermission = (permission) => getPermissions().includes(permission);
