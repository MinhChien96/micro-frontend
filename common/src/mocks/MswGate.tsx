import { type ReactNode, useEffect, useState } from 'react';

/**
 * Chặn render app cho tới khi MSW worker sẵn sàng — tránh race:
 * request đầu tiên bắn ra TRƯỚC khi worker intercept được (mất mock).
 * enabled=false → render thẳng (dùng API thật).
 */
export function MswGate({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [ready, setReady] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    import('./browser').then(async (m) => {
      await m.startMockWorker();
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!ready) return null;
  return <>{children}</>;
}
