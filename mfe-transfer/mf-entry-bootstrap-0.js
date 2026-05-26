
const __mfCacheGlobalKey = "__mf_module_cache__";
globalThis[__mfCacheGlobalKey] ||= { share: {}, remote: {} };
globalThis[__mfCacheGlobalKey].share ||= {};
globalThis[__mfCacheGlobalKey].remote ||= {};
const __mfModuleCache = globalThis[__mfCacheGlobalKey];

const __mfImport = (src) =>
  globalThis.System && typeof globalThis.System.import === 'function'
    ? globalThis.System.import(src)
    : import(src);
(async () => {
  const { initHost } = await __mfImport("https://minhchien96.github.io/micro-frontend/mfe-transfer/assets/hostInit-BR5WoOjN.js");
  const runtime = await initHost();
  const __mfRemotePreloads = [runtime.loadRemote("shared/PermissionGate"),runtime.loadRemote("shared/ui")];
  await Promise.all(__mfRemotePreloads);
})().then(() => __mfImport("https://minhchien96.github.io/micro-frontend/mfe-transfer/assets/index-iiH5BHhE.js"));
