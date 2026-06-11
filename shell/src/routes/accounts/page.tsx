import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { AccountsSkeleton } from '../../skeletons';

const AccountsApp = lazy(() => import('mfe_accounts/AccountsApp'));

export default function AccountsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<AccountsSkeleton />}>
        <AccountsApp />
      </Suspense>
    </ProtectedRoute>
  );
}
