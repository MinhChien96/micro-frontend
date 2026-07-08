import { globalStore } from '../stores/global.store';
import { PSFMapping } from './actionMapToPSF';
import type { ActionEnum, EntitledAction, ProductType } from './entitledAction';

interface EntitledUser {
  entitledActions?: EntitledAction[];
}

// Build ngược PSFMapping → ENTITLED_ACTIONS[ActionEnum] = {p, s, f}.
// Throw ngay lúc import nếu 1 ActionEnum xuất hiện ở 2 nơi (bank rule).
function buildEntitledActions(): Record<ActionEnum, EntitledAction> {
  const result = {} as Record<ActionEnum, EntitledAction>;
  for (const [p, subProducts] of Object.entries(PSFMapping)) {
    for (const [s, actions] of Object.entries(subProducts)) {
      for (const [key, f] of Object.entries(actions)) {
        const actionKey = key as ActionEnum;
        if (result[actionKey]) {
          throw new Error(`[permissions] ActionEnum trùng key: ${actionKey}`);
        }
        result[actionKey] = { p: p as ProductType, s, f: f as string };
      }
    }
  }
  return result;
}

export const ENTITLED_ACTIONS: Record<ActionEnum, EntitledAction> = buildEntitledActions();

const keyOf = (a: EntitledAction): string => `${a.p}:${a.s}:${a.f}`;

const entitledSetOf = (user: EntitledUser): Set<string> =>
  new Set((user.entitledActions ?? []).map(keyOf));

const currentUser = (): EntitledUser => (globalStore.getState().user ?? {}) as EntitledUser;

/** user có đúng bộ {p,s,f} của action không (mặc định: user đang đăng nhập) */
export function canAction(action: ActionEnum, user: EntitledUser = currentUser()): boolean {
  const target = ENTITLED_ACTIONS[action];
  if (!target) return false;
  return entitledSetOf(user).has(keyOf(target));
}

export function canAnyAction(actions: ActionEnum[], user: EntitledUser = currentUser()): boolean {
  const set = entitledSetOf(user);
  return actions.some((a) => set.has(keyOf(ENTITLED_ACTIONS[a])));
}

export function canAllActions(actions: ActionEnum[], user: EntitledUser = currentUser()): boolean {
  const set = entitledSetOf(user);
  return actions.every((a) => set.has(keyOf(ENTITLED_ACTIONS[a])));
}
