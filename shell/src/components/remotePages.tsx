import { createLazyComponent } from '@module-federation/modern-js-v3/react';
import { getInstance } from '@module-federation/modern-js-v3/runtime';
import type React from 'react';
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

const RemoteLoadError = ({ remote, error }: { remote: string; error?: Error }) => (
  <div className="error-box">
    <strong>Không thể tải MFE</strong> — remote <code>{remote}</code> có đang chạy không?
    <br />
    <small style={{ opacity: 0.7 }}>{error?.message}</small>
  </div>
);

// Public — SSR thật sự: markup form Login của remote nằm trong HTML server (SEO).
export const Login = createLazyComponent({
  instance: getInstance(),
  loader: () => import('mfe_auth/Login'),
  export: 'default',
  loading: LoginFallback,
  fallback: ({ error }: { error?: Error }) => (
    <RemoteLoadError remote="mfe_auth/Login" error={error} />
  ),
});

// Protected — noSSR: server stream shell + skeleton, nội dung hydrate client
// (auth nằm trong localStorage nên server không có user, SSR content vô nghĩa).
const protectedPage = (
  id: string,
  loader: () => Promise<{ default: React.ComponentType }>,
  skeleton: React.ReactNode,
) =>
  createLazyComponent({
    instance: getInstance(),
    loader,
    export: 'default',
    noSSR: true,
    loading: skeleton,
    fallback: ({ error }: { error?: Error }) => <RemoteLoadError remote={id} error={error} />,
  });

export const AccountsApp = protectedPage(
  'mfe_accounts/AccountsApp',
  () => import('mfe_accounts/AccountsApp'),
  <AccountsSkeleton />,
);
export const TransferApp = protectedPage(
  'mfe_transfer/TransferApp',
  () => import('mfe_transfer/TransferApp'),
  <TransferSkeleton />,
);
export const CardsApp = protectedPage(
  'mfe_cards/CardsApp',
  () => import('mfe_cards/CardsApp'),
  <CardsSkeleton />,
);
export const LoansApp = protectedPage(
  'mfe_loans/LoansApp',
  () => import('mfe_loans/LoansApp'),
  <LoansSkeleton />,
);
export const ProfileApp = protectedPage(
  'mfe_profile/ProfileApp',
  () => import('mfe_profile/ProfileApp'),
  <ProfileSkeleton />,
);
// @plop:remote-page (generator chèn export MFE mới bên trên)
