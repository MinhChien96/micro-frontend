// Nguồn sự thật cho mọi đường dẫn route (bank: common/constants/paths.ts).
// Shell khai báo route theo Paths; remote điều hướng qua navigator/navigateLink
// cũng dùng Paths — không hardcode chuỗi ở nơi khác.
export const Paths = {
  home: '/',
  login: '/login',
  accounts: '/accounts',
  transfer: '/transfer',
  cards: '/cards',
  loans: '/loans',
  profile: '/profile',
} as const;

/** Route không cần đăng nhập — apiClient không xử lý 401-refresh khi đang ở đây */
export const PUBLIC_PATHS: string[] = [Paths.login];

export const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
