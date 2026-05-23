import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { PageSpinner, ToastProvider } from 'shared/ui';
import ProfilePage from './ProfilePage';

const EditProfile = lazy(() =>
  import(
    /* webpackChunkName: "edit-profile" */
    /* webpackPrefetch: true */
    './EditProfile'
  )
);

const SecuritySettings = lazy(() =>
  import(
    /* webpackChunkName: "security-settings" */
    /* webpackPrefetch: true */
    './SecuritySettings'
  )
);

function EditProfileRoute() {
  const navigate = useNavigate();
  return <EditProfile onDone={() => navigate('/profile')} />;
}

// Không có <Router> — Router context đến từ shell (HashRouter)
export default function ProfileApp() {
  return (
    <ToastProvider>
      <Routes>
        <Route index element={<ProfilePage />} />
        <Route
          path="edit"
          element={
            <Suspense fallback={<PageSpinner label="Đang tải form chỉnh sửa..." />}>
              <EditProfileRoute />
            </Suspense>
          }
        />
        <Route
          path="security"
          element={
            <Suspense fallback={<PageSpinner label="Đang tải cài đặt bảo mật..." />}>
              <SecuritySettings />
            </Suspense>
          }
        />
      </Routes>
    </ToastProvider>
  );
}
