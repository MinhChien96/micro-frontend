import React, { createContext, useContext, useEffect, useState } from 'react';

const ManifestContext = createContext(null);

/**
 * Enterprise pattern: shell fetches remotes.manifest.json at runtime.
 * In polyrepo, each team deploys their MFE independently and updates
 * this central manifest. Shell can disable/enable MFEs without redeploy.
 */
export function ManifestProvider({ children }) {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/remotes.manifest.json')
      .then((r) => {
        if (!r.ok) throw new Error(`manifest fetch failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setManifest(data);
        if (import.meta.env.DEV) {
          console.groupCollapsed('[MF Registry] Manifest loaded');
          Object.entries(data.remotes).forEach(([name, meta]) => {
            const status = meta.enabled ? '✅' : '🔴';
            console.log(`${status} ${name} v${meta.version} — ${meta.team}`);
          });
          console.groupEnd();
        }
      })
      .catch((err) => {
        console.warn('[MF Registry] Could not load manifest, fail-open:', err.message);
        setManifest({ schemaVersion: '2', remotes: {} });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ManifestContext.Provider value={{ manifest, loading }}>
      {children}
    </ManifestContext.Provider>
  );
}

export function useManifest() {
  return useContext(ManifestContext);
}

/**
 * Returns true if a remote is enabled in the manifest.
 * Optimistic: returns true while manifest is loading (avoid blocking render).
 */
export function useIsEnabled(remoteName) {
  const ctx = useContext(ManifestContext);
  if (!ctx || !ctx.manifest) return true;
  return ctx.manifest.remotes[remoteName]?.enabled ?? true;
}

/**
 * Returns full metadata for a remote from the manifest.
 */
export function useRemoteMeta(remoteName) {
  const ctx = useContext(ManifestContext);
  return ctx?.manifest?.remotes?.[remoteName] ?? null;
}
