import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getOrCreateSingleton } from '../utils/singleton';

// MỘT QueryClient cho toàn hệ thống (bank: common/helpers/queryProvider) —
// shell mount ở root; mọi remote dùng chung context nhờ
// '@tanstack/react-query' là MF shared singleton.
const queryClient = getOrCreateSingleton(
  '__APP_QUERY_CLIENT__',
  () =>
    new QueryClient({
      defaultOptions: { queries: { staleTime: 5 * 60_000, retry: 1 } },
    }),
);

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
