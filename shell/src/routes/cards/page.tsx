import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { CardsSkeleton } from '../../skeletons';

const CardsApp = lazy(() => import('mfe_cards/CardsApp'));

export default function CardsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<CardsSkeleton />}>
        <CardsApp />
      </Suspense>
    </ProtectedRoute>
  );
}
