import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import RemoteErrorBoundary from '../../../components/RemoteErrorBoundary';
import { TransferApp } from '../../../components/remotePages';

// Splat route — mfe-transfer tự quản router con (dashboard, /new, /history).
export default function TransferAppPage() {
  return (
    <>
      <Helmet>
        <title>{`Chuyển tiền — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_transfer/TransferApp">
        <TransferApp />
      </RemoteErrorBoundary>
    </>
  );
}
