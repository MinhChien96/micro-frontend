import { afterEach, describe, expect, it, vi } from 'vitest';
import eventBus from './eventBus';

describe('eventBus', () => {
  afterEach(() => {
    eventBus.clear('test:evt');
  });

  it('emit + on nhận đúng payload', () => {
    const handler = vi.fn();
    const off = eventBus.on<{ x: number }>('test:evt', handler);
    eventBus.emit('test:evt', { x: 42 });
    expect(handler).toHaveBeenCalledWith({ x: 42 });
    off();
  });

  it('getLast trả payload mới nhất (last-value cache)', () => {
    eventBus.emit('test:evt', { x: 1 });
    eventBus.emit('test:evt', { x: 2 });
    expect(eventBus.getLast<{ x: number }>('test:evt')).toEqual({ x: 2 });
  });

  it('clear xóa cache → getLast trả null', () => {
    eventBus.emit('test:evt', { x: 1 });
    eventBus.clear('test:evt');
    expect(eventBus.getLast('test:evt')).toBeNull();
  });

  it('unsubscribe ngừng nhận event', () => {
    const handler = vi.fn();
    const off = eventBus.on('test:evt', handler);
    off();
    eventBus.emit('test:evt', { x: 1 });
    expect(handler).not.toHaveBeenCalled();
  });
});
