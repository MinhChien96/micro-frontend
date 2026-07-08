// MF runtime plugin (CHỈ gắn khi dev — xem module-federation.config.ts):
// dev không cần bật đủ remote. Manifest fetch fail → trả manifest fallback
// rỗng để MF runtime không crash; module load fail → trả undefined để
// load.tsx render <RemoteUnavailable/>. Port từ bank.
interface ErrorLoadRemoteArgs {
  id?: string;
  error?: unknown;
  lifecycle?: string;
  from?: string;
}

export default function errorHandlingPlugin() {
  return {
    name: 'offline-handling-plugin',
    errorLoadRemote(args: ErrorLoadRemoteArgs) {
      const { lifecycle, id } = args;

      switch (lifecycle) {
        case 'afterResolve':
          // Manifest load fail → manifest fallback tối thiểu
          console.warn(`[MF] Manifest không tải được cho ${id} — dùng fallback rỗng`);
          return {
            id: 'fallback',
            name: 'fallback',
            metaData: {
              name: 'fallback',
              type: 'app',
              buildInfo: { buildVersion: 'local', buildName: 'fallback' },
              remoteEntry: { name: 'fallback.js', path: '', type: 'global' },
              types: { path: '', name: '', zip: '@mf-types.zip', api: '@mf-types.d.ts' },
              globalName: 'fallback',
              pluginVersion: '1',
              prefetchInterface: false,
              publicPath: '',
            },
            shared: [],
            remotes: [],
            exposes: [],
          };

        case 'onLoad':
          // Module load fail → undefined để load.tsx render RemoteUnavailable
          return undefined;

        case 'beforeLoadShare':
          console.warn(`[MF] Shared dependency load fail cho ${id}`);
          return () => ({ __esModule: true, default: {} });

        default:
          console.warn(`[MF] errorLoadRemote lifecycle=${lifecycle} cho ${id}`);
          return undefined;
      }
    },
  };
}
