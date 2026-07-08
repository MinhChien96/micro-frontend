import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { lazyRemoteWithFallback } from '../remote/load';
import {
  AccountsSkeleton,
  CardsSkeleton,
  LoansSkeleton,
  ProfileSkeleton,
  TransferSkeleton,
} from '../skeletons';

const LoginFallback = (
  <div className="loading-box">
    <div className="spinner" />
    <p>Đang tải đăng nhập...</p>
  </div>
);

/**
 * Mỗi màn remote = lazyRemoteWithFallback (đăng ký runtime + chống stale)
 * bọc Suspense với skeleton riêng. Props được truyền xuyên qua cho remote.
 */
const remotePage = (remoteName: string, exposeKey: string, skeleton: ReactNode) => {
  const Lazy = lazyRemoteWithFallback(remoteName, exposeKey);
  return function RemotePage(props: Record<string, unknown>) {
    return (
      <Suspense fallback={skeleton}>
        <Lazy {...props} />
      </Suspense>
    );
  };
};

export const Login = remotePage('mfe_auth', 'Login', LoginFallback);

// Pattern A — mfe-accounts expose từng màn, shell truyền navigator/accountId
export const AccountList = remotePage('mfe_accounts', 'AccountList', <AccountsSkeleton />);
export const AccountDetail = remotePage('mfe_accounts', 'AccountDetail', <AccountsSkeleton />);
export const TransactionList = remotePage('mfe_accounts', 'TransactionList', <AccountsSkeleton />);

// Pattern B — mfe-cards expose cửa vào zone, tự quản router con
export const CardsRoutes = remotePage('mfe_cards', 'CardsRoutes', <CardsSkeleton />);

// Splat đơn giản — remote tự render <Routes> (dựa react-router singleton)
export const TransferApp = remotePage('mfe_transfer', 'TransferApp', <TransferSkeleton />);
export const LoansApp = remotePage('mfe_loans', 'LoansApp', <LoansSkeleton />);
export const ProfileApp = remotePage('mfe_profile', 'ProfileApp', <ProfileSkeleton />);
// @plop:remote-page (generator chèn export MFE mới bên trên)
