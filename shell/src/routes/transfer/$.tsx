import React from 'react';
import { Helmet } from '@modern-js/runtime/head';
import ProtectedRoute from '../../components/ProtectedRoute';
import RemoteErrorBoundary from '../../components/RemoteErrorBoundary';
import { TransferApp } from '../../components/remotePages';

export default function TransferPage() {
  return (
    <ProtectedRoute>
      <Helmet><title>Chuyển tiền — VietBank</title></Helmet>
      <RemoteErrorBoundary remote="mfe_transfer/TransferApp">
        <TransferApp />
      </RemoteErrorBoundary>
    </ProtectedRoute>
  );
}
