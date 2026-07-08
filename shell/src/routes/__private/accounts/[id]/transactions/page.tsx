import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import { useNavigate, useParams } from '@modern-js/runtime/router';
import RemoteErrorBoundary from '../../../../../components/RemoteErrorBoundary';
import { TransactionList } from '../../../../../components/remotePages';

export default function TransactionListPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  return (
    <>
      <Helmet>
        <title>{`Lịch sử giao dịch ${id} — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_accounts/TransactionList">
        <TransactionList accountId={id} navigator={navigate} />
      </RemoteErrorBoundary>
    </>
  );
}
