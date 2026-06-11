import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { LoansSkeleton } from '../../skeletons';

const LoansApp = lazy(() => import('mfe_loans/LoansApp'));

export default function LoansPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoansSkeleton />}>
        <LoansApp />
      </Suspense>
    </ProtectedRoute>
  );
}
