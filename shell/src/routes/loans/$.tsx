import { BRAND } from '@app/shared/brand';
import { Helmet } from '@modern-js/runtime/head';
import ProtectedRoute from '../../components/ProtectedRoute';
import RemoteErrorBoundary from '../../components/RemoteErrorBoundary';
import { LoansApp } from '../../components/remotePages';

export default function LoansPage() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>{`Vay vốn — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_loans/LoansApp">
        <LoansApp />
      </RemoteErrorBoundary>
    </ProtectedRoute>
  );
}
