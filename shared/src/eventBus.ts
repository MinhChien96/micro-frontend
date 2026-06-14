// Cross-MFE Event Bus — pub/sub qua window.CustomEvent + cache last-value.
// MFE rời đi trước khi subscriber mount → getLast() cho receiver đọc payload
// mới nhất mà không cần cả hai MFE mount cùng lúc.
// PHẢI là MF singleton (key '@app/shared/eventBus') để _last cache dùng chung.
type EventHandler<T> = (detail: T) => void;

const _last: Record<string, unknown> = {};

const eventBus = {
  // Publish event kèm payload (tùy chọn).
  emit<T = unknown>(event: string, detail?: T): void {
    _last[event] = detail;
    if (typeof window === 'undefined') return; // SSR: chỉ cache, không dispatch
    window.dispatchEvent(new CustomEvent(event, { detail, bubbles: true }));
  },

  // Subscribe event tương lai. Trả về hàm unsubscribe.
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (typeof window === 'undefined') return () => {}; // SSR: no-op unsubscribe
    const wrapped = (e: Event) => handler((e as CustomEvent<T>).detail);
    window.addEventListener(event, wrapped);
    return () => window.removeEventListener(event, wrapped);
  },

  // Đọc payload cuối cùng (null nếu chưa từng emit / đã clear).
  getLast<T = unknown>(event: string): T | null {
    return (_last[event] as T | undefined) ?? null;
  },

  // Xóa cache — gọi sau khi tiêu thụ để tránh dữ liệu cũ ở lần mount sau.
  clear(event: string): void {
    delete _last[event];
  },
};

export default eventBus;
