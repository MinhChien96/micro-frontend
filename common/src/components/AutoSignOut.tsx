import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;

interface AutoSignOutProviderProps {
  children: ReactNode;
  /** thời gian không hoạt động trước khi cảnh báo (mặc định 5 phút) */
  timeoutMs?: number;
  /** đếm ngược trong modal cảnh báo trước khi signOut (mặc định 30s) */
  countdownSec?: number;
  onSignOut: () => void;
}

/**
 * Tự đăng xuất khi user không hoạt động (bank: 5 phút idle → modal cảnh báo
 * đếm ngược 30s → signOut). Mọi tương tác (chuột/phím/cuộn/chạm) reset timer;
 * khi modal đang mở thì KHÔNG reset — user phải bấm "Tiếp tục" chủ động.
 */
export function AutoSignOutProvider({
  children,
  timeoutMs = 5 * 60 * 1000,
  countdownSec = 30,
  onSignOut,
}: AutoSignOutProviderProps) {
  const [warning, setWarning] = useState(false);
  const [remaining, setRemaining] = useState(countdownSec);
  const warningRef = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resetIdleTimer = useCallback(() => {
    if (warningRef.current) return; // đang cảnh báo — không reset ngầm
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      warningRef.current = true;
      setRemaining(countdownSec);
      setWarning(true);
    }, timeoutMs);
  }, [timeoutMs, countdownSec]);

  useEffect(() => {
    resetIdleTimer();
    for (const evt of ACTIVITY_EVENTS) window.addEventListener(evt, resetIdleTimer);
    return () => {
      clearTimeout(idleTimer.current);
      for (const evt of ACTIVITY_EVENTS) window.removeEventListener(evt, resetIdleTimer);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    if (!warning) return;
    const interval = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onSignOut();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [warning, onSignOut]);

  const stayLoggedIn = () => {
    warningRef.current = false;
    setWarning(false);
    resetIdleTimer();
  };

  return (
    <>
      {children}
      {warning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[360px] rounded-xl border border-border bg-bg-card p-6 text-center shadow-xl">
            <p className="m-0 text-3xl">⏰</p>
            <h3 className="mt-3 mb-1 text-lg font-bold text-text-main">Phiên sắp hết hạn</h3>
            <p className="m-0 text-[13px] text-text-muted">
              Bạn không hoạt động một thời gian. Tự động đăng xuất sau{' '}
              <strong className="text-text-main">{remaining}s</strong>.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="secondary" onClick={() => onSignOut()}>
                Đăng xuất
              </Button>
              <Button onClick={stayLoggedIn}>Tiếp tục phiên</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
