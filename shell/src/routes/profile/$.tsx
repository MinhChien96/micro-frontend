import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import ProtectedRoute from '../../components/ProtectedRoute';
import RemoteErrorBoundary from '../../components/RemoteErrorBoundary';
import { ProfileApp } from '../../components/remotePages';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>{`Hồ sơ — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_profile/ProfileApp">
        <ProfileApp />
      </RemoteErrorBoundary>
    </ProtectedRoute>
  );
}
