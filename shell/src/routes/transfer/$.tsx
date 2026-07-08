import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import ProtectedRoute from '../../components/ProtectedRoute';
import RemoteErrorBoundary from '../../components/RemoteErrorBoundary';
import { TransferApp } from '../../components/remotePages';

export default function TransferPage() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>{`Chuyển tiền — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_transfer/TransferApp">
        <TransferApp />
      </RemoteErrorBoundary>
    </ProtectedRoute>
  );
}
