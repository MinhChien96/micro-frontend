import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import { useNavigate, useParams } from '@modern-js/runtime/router';
import RemoteErrorBoundary from '../../../../components/RemoteErrorBoundary';
import { AccountDetail } from '../../../../components/remotePages';

// Pattern A: route động /accounts/:id — shell đọc params rồi truyền xuống remote.
export default function AccountDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  return (
    <>
      <Helmet>
        <title>{`Tài khoản ${id} — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_accounts/AccountDetail">
        <AccountDetail accountId={id} navigator={navigate} />
      </RemoteErrorBoundary>
    </>
  );
}
