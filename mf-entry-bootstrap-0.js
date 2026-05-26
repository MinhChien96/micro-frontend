
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
  const { initHost } = await __mfImport("https://minhchien96.github.io/micro-frontend/assets/hostInit-sNK22N0s.js");
  const runtime = await initHost();
  const __mfRemotePreloads = [runtime.loadRemote("mfe_accounts/AccountsApp"),runtime.loadRemote("mfe_auth/Login"),runtime.loadRemote("mfe_cards/CardsApp"),runtime.loadRemote("mfe_loans/LoansApp"),runtime.loadRemote("mfe_profile/ProfileApp"),runtime.loadRemote("mfe_transfer/TransferApp"),runtime.loadRemote("shared/ThemeContext"),runtime.loadRemote("shared/ui")];
  await Promise.all(__mfRemotePreloads);
})().then(() => __mfImport("https://minhchien96.github.io/micro-frontend/assets/index-CPkiBMO_.js"));
