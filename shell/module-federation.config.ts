import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

// URL manifest browser-facing. REMOTE_BASE dùng khi deploy (CDN/S3);
// không set → fallback localhost theo port từng MFE (dev).
// Server-side trong Docker/ECS dùng MF_INTERNAL_HOST_MAP để rewrite host
// (xem src/runtime/internalHostRewrite.ts) — KHÔNG đổi URL ở đây.
const base = process.env.REMOTE_BASE;
const m = (dir: string, port: number) =>
  base
    ? `${base}/${dir}/static/mf-manifest.json`
    : `http://localhost:${port}/static/mf-manifest.json`;

export default createModuleFederationConfig({
  name: 'shell',
  dts: false,
  remotes: {
    mfe_auth: `mfe_auth@${m('mfe-auth', 3001)}`,
    mfe_accounts: `mfe_accounts@${m('mfe-accounts', 3002)}`,
    mfe_transfer: `mfe_transfer@${m('mfe-transfer', 3003)}`,
    mfe_profile: `mfe_profile@${m('mfe-profile', 3005)}`,
    mfe_loans: `mfe_loans@${m('mfe-loans', 3006)}`,
    mfe_cards: `mfe_cards@${m('mfe-cards', 3007)}`,
  },
  runtimePlugins: ['./src/runtime/internalHostRewrite.ts'],
  shared: {
    // shared/ui + shared/eventBus PHẢI singleton: ToastContext và _last cache
    // của eventBus là module-level state — mỗi bundle một bản là vỡ cross-MFE.
    'react/jsx-runtime': { singleton: true, requiredVersion: false },
    'react/jsx-dev-runtime': { singleton: true, requiredVersion: false },
    'shared/ui': { singleton: true, requiredVersion: false },
    'shared/eventBus': { singleton: true, requiredVersion: false },
    react: { singleton: true, requiredVersion: '>=18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
  },
});
