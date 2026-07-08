import { MswGate } from '@app/common/mocks/MswGate';
import { setApiHost } from '@app/common/stores';
import { Outlet } from '@modern-js/runtime/router';
import { useEffect } from 'react';

// Layout này CHỈ chạy ở chế độ standalone (dev độc lập, không qua shell):
// tự bật MSW làm backend + mở khóa apiHost cho apiClient.
export default function Layout() {
  useEffect(() => {
    setApiHost('');
  }, []);
  return (
    <MswGate enabled>
      <Outlet />
    </MswGate>
  );
}
