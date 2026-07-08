// Cross-MFE Event Bus — pub/sub qua window.CustomEvent + cache last-value.
// MFE rời đi trước khi subscriber mount → getLast() cho receiver đọc payload
// mới nhất mà không cần cả hai MFE mount cùng lúc.
// PHẢI là MF singleton (key '@app/common/eventBus') để _last cache dùng chung.
// Type-safe theo AppEvents (xem ./events) — emit/on/getLast khớp key↔payload.
import type { AppEvents } from './events';

const _last: { [K in keyof AppEvents]?: AppEvents[K] } = {};

const eventBus = {
  // Publish event kèm payload (type khớp key).
  emit<K extends keyof AppEvents>(event: K, detail: AppEvents[K]): void {
    _last[event] = detail;
    if (typeof window === 'undefined') return; // SSR: chỉ cache, không dispatch
    window.dispatchEvent(new CustomEvent(event, { detail, bubbles: true }));
  },

  // Subscribe event tương lai. Trả về hàm unsubscribe.
  on<K extends keyof AppEvents>(event: K, handler: (detail: AppEvents[K]) => void): () => void {
    if (typeof window === 'undefined') return () => {}; // SSR: no-op unsubscribe
    const wrapped = (e: Event) => handler((e as CustomEvent<AppEvents[K]>).detail);
    window.addEventListener(event, wrapped);
    return () => window.removeEventListener(event, wrapped);
  },

  // Đọc payload cuối cùng (null nếu chưa từng emit / đã clear).
  getLast<K extends keyof AppEvents>(event: K): AppEvents[K] | null {
    return _last[event] ?? null;
  },

  // Xóa cache — gọi sau khi tiêu thụ để tránh dữ liệu cũ ở lần mount sau.
  clear<K extends keyof AppEvents>(event: K): void {
    delete _last[event];
  },
};

export default eventBus;
