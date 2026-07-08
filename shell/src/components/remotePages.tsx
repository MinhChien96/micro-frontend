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
export const AccountsApp = remotePage('mfe_accounts', 'AccountsApp', <AccountsSkeleton />);
export const TransferApp = remotePage('mfe_transfer', 'TransferApp', <TransferSkeleton />);
export const CardsApp = remotePage('mfe_cards', 'CardsApp', <CardsSkeleton />);
export const LoansApp = remotePage('mfe_loans', 'LoansApp', <LoansSkeleton />);
export const ProfileApp = remotePage('mfe_profile', 'ProfileApp', <ProfileSkeleton />);
// @plop:remote-page (generator chèn export MFE mới bên trên)
