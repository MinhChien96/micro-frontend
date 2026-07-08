import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import ProtectedRoute from '../../components/ProtectedRoute';
import RemoteErrorBoundary from '../../components/RemoteErrorBoundary';
import { CardsApp } from '../../components/remotePages';

export default function CardsPage() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>{`Thẻ — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_cards/CardsApp">
        <CardsApp />
      </RemoteErrorBoundary>
    </ProtectedRoute>
  );
}
