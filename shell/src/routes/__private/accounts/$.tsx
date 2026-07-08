import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import RemoteErrorBoundary from '../../../components/RemoteErrorBoundary';
import { AccountsApp } from '../../../components/remotePages';

// $.tsx = splat: match cả /accounts lẫn /accounts/:id/... — remote tự render
// <Routes> con bên trong (AccountList, AccountDetail, TransactionList).
export default function AccountsAppPage() {
  return (
    <>
      <Helmet>
        <title>{`Tài khoản — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_accounts/AccountsApp">
        <AccountsApp />
      </RemoteErrorBoundary>
    </>
  );
}
