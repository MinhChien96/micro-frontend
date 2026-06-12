import React from 'react';
import { Helmet } from '@modern-js/runtime/head';
import ProtectedRoute from '../../components/ProtectedRoute';
import RemoteErrorBoundary from '../../components/RemoteErrorBoundary';
import { AccountsApp } from '../../components/remotePages';

// $.tsx = splat: match cả /accounts lẫn /accounts/:id/... — remote tự render
// <Routes> con bên trong (AccountList, AccountDetail, TransactionList).
export default function AccountsPage() {
  return (
    <ProtectedRoute>
      <Helmet><title>Tài khoản — VietBank</title></Helmet>
      <RemoteErrorBoundary remote="mfe_accounts/AccountsApp">
        <AccountsApp />
      </RemoteErrorBoundary>
    </ProtectedRoute>
  );
}
