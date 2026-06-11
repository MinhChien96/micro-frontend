import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ProfileSkeleton } from '../../skeletons';

const ProfileApp = lazy(() => import('mfe_profile/ProfileApp'));

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileApp />
      </Suspense>
    </ProtectedRoute>
  );
}
