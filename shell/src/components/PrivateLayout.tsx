import { AutoSignOutProvider } from '@app/common/AutoSignOut';
import { clearAuth } from '@app/common/auth';
import { ENDPOINTS } from '@app/common/constants/endpoints';
import { Paths } from '@app/common/constants/paths';
import { apiPost } from '@app/common/services';
import { setNavigateLink, useGlobalStore } from '@app/common/stores';
import { Navigate, Outlet, useLocation, useNavigate } from '@modern-js/runtime/router';
import { useCallback, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import Nav from './Nav';

/**
 * Khung cho nhóm route PRIVATE (bank: PrivateLayoutWrap):
 * - Guard: chưa đăng nhập → về /login (nhớ from để quay lại)
 * - Consume navigateLink: remote/common không có navigator vẫn điều hướng được
 *   bằng setNavigateLink({to, data}) — shell bắt qua store rồi navigate tập trung
 * - AutoSignOut: idle 5 phút → modal đếm ngược 30s → đăng xuất
 */
export default function PrivateLayout() {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigateLink = useGlobalStore((s) => s.navigateLink);

  useEffect(() => {
    if (navigateLink?.to) {
      navigate(navigateLink.to, { state: navigateLink.data });
      setNavigateLink(null);
    }
  }, [navigateLink, navigate]);

  const handleSignOut = useCallback(() => {
    // best-effort báo server; phiên client luôn được xóa
    apiPost(ENDPOINTS.logout).catch(() => {});
    clearAuth();
    navigate(Paths.login, { replace: true });
  }, [navigate]);

  if (!user) return <Navigate to={Paths.login} state={{ from: location }} replace />;

  return (
    <AutoSignOutProvider onSignOut={handleSignOut}>
      <Nav onLogout={handleSignOut} />
      <main className="main-content">
        <Outlet />
      </main>
    </AutoSignOutProvider>
  );
}
