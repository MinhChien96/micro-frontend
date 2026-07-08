import type { Role } from '../auth';
import { batchUpdate } from '../stores/global.store';

/**
 * Setup phiên giả cho chế độ STANDALONE của remote (dev độc lập không cần shell):
 * - apiHost '' → same-origin, MSW intercept
 * - access token đúng format của mock backend ('access-<expiry>') để qua guard
 */
export function setupStandaloneSession(role: Role = 'PREMIUM'): void {
  batchUpdate({
    apiHost: '',
    authToken: `access-${Date.now() + 60 * 60 * 1000}`,
    refreshToken: `refresh-${Date.now()}`,
    user: {
      id: 'dev-001',
      name: 'Dev User',
      role,
      email: 'dev@example.com',
      branch: 'HN',
    },
  });
}
