import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import RemoteErrorBoundary from '../../../components/RemoteErrorBoundary';
import { ProfileApp } from '../../../components/remotePages';

// Splat route — mfe-profile tự quản router con (hồ sơ, bảo mật, chỉnh sửa).
export default function ProfileAppPage() {
  return (
    <>
      <Helmet>
        <title>{`Hồ sơ — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_profile/ProfileApp">
        <ProfileApp />
      </RemoteErrorBoundary>
    </>
  );
}
