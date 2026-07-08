import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import RemoteErrorBoundary from '../../../components/RemoteErrorBoundary';
import { LoansApp } from '../../../components/remotePages';

// Splat route — mfe-loans tự quản router con (danh sách, chi tiết, lịch trả nợ).
export default function LoansAppPage() {
  return (
    <>
      <Helmet>
        <title>{`Vay vốn — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_loans/LoansApp">
        <LoansApp />
      </RemoteErrorBoundary>
    </>
  );
}
