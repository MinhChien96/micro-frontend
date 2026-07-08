import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import RemoteErrorBoundary from '../../../components/RemoteErrorBoundary';
import { CardsApp } from '../../../components/remotePages';

// Splat route — mfe-cards tự quản router con (danh sách, chi tiết thẻ).
export default function CardsAppPage() {
  return (
    <>
      <Helmet>
        <title>{`Thẻ — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_cards/CardsApp">
        <CardsApp />
      </RemoteErrorBoundary>
    </>
  );
}
