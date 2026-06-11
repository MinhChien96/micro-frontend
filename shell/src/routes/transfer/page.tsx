import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { TransferSkeleton } from '../../skeletons';

const TransferApp = lazy(() => import('mfe_transfer/TransferApp'));

export default function TransferPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<TransferSkeleton />}>
        <TransferApp />
      </Suspense>
    </ProtectedRoute>
  );
}
