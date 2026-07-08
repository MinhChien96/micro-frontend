import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
import { buildManifestUrls, REMOTES } from './remote-urls';

// Dev: khai báo remotes TĨNH để MF plugin init đủ share scope, type + HMR.
// Prod: remotes rỗng — mọi remote được đăng ký ĐỘNG lúc runtime qua
// registerRemotes trong src/remote/load.tsx → deploy remote mới KHÔNG cần
// rebuild shell (pattern bank).
const isDev = process.env.NODE_ENV === 'development';
const urls = buildManifestUrls();

export default createModuleFederationConfig({
  name: 'shell',
  dts: false,
  remotes: isDev
    ? Object.fromEntries(Object.keys(REMOTES).map((name) => [name, `${name}@${urls[name]}`]))
    : {},
  // Dev không cần bật đủ remote: plugin bắt errorLoadRemote → trả manifest
  // fallback rỗng thay vì crash app; màn thiếu remote hiện RemoteUnavailable.
  runtimePlugins: isDev ? ['./src/remote/error-handling-plugin.ts'] : [],
  shared: {
    // @app/common/ui + @app/common/eventBus PHẢI singleton: ToastContext và _last cache
    // của eventBus là module-level state — mỗi bundle một bản là vỡ cross-MFE.
    'react/jsx-runtime': { singleton: true, requiredVersion: false },
    'react/jsx-dev-runtime': { singleton: true, requiredVersion: false },
    '@app/common/ui': { singleton: true, requiredVersion: false },
    '@app/common/stores': { singleton: true, requiredVersion: false },
    '@app/common/eventBus': { singleton: true, requiredVersion: false },
    react: { singleton: true, requiredVersion: '>=18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
  },
});
