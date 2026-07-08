import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import { useNavigate } from '@modern-js/runtime/router';
import RemoteErrorBoundary from '../../../components/RemoteErrorBoundary';
import { AccountList } from '../../../components/remotePages';

// Pattern A (bank): shell sở hữu route /accounts, remote chỉ cấp component.
// navigator = useNavigate CỦA SHELL truyền xuống — remote không tự import router.
export default function AccountListPage() {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>{`Tài khoản — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_accounts/AccountList">
        <AccountList navigator={navigate} />
      </RemoteErrorBoundary>
    </>
  );
}
