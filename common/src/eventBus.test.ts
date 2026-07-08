import { afterEach, describe, expect, it, vi } from 'vitest';
import eventBus from './eventBus';
import type { TransferPrefill } from './events';

const EVT = 'app:transferPrefill';
const payload = (n: number): TransferPrefill => ({
  accountId: `TK00${n}`,
  accountName: 'Test',
  accountNumber: '0000',
  balance: n,
});

describe('eventBus', () => {
  afterEach(() => {
    eventBus.clear(EVT);
  });

  it('emit + on nhận đúng payload', () => {
    const handler = vi.fn();
    const off = eventBus.on(EVT, handler);
    eventBus.emit(EVT, payload(42));
    expect(handler).toHaveBeenCalledWith(payload(42));
    off();
  });

  it('getLast trả payload mới nhất (last-value cache)', () => {
    eventBus.emit(EVT, payload(1));
    eventBus.emit(EVT, payload(2));
    expect(eventBus.getLast(EVT)?.balance).toBe(2);
  });

  it('clear xóa cache → getLast trả null', () => {
    eventBus.emit(EVT, payload(1));
    eventBus.clear(EVT);
    expect(eventBus.getLast(EVT)).toBeNull();
  });

  it('unsubscribe ngừng nhận event', () => {
    const handler = vi.fn();
    const off = eventBus.on(EVT, handler);
    off();
    eventBus.emit(EVT, payload(1));
    expect(handler).not.toHaveBeenCalled();
  });
});
