// Cross-MFE Event Bus — pub/sub via window.CustomEvent with last-value cache.
// Because MFEs navigate away before the subscriber mounts, getLast() lets the
// receiver read the most recently emitted payload without needing both MFEs
// to be mounted at the same time.
const _last = {};

const eventBus = {
  // Publish an event with an optional payload.
  emit(event, detail) {
    _last[event] = detail;
    window.dispatchEvent(new CustomEvent(event, { detail, bubbles: true }));
  },

  // Subscribe to future events. Returns an unsubscribe function.
  on(event, handler) {
    const wrapped = (e) => handler(e.detail);
    window.addEventListener(event, wrapped);
    return () => window.removeEventListener(event, wrapped);
  },

  // Read the last payload emitted for this event (null if never emitted / cleared).
  getLast(event) {
    return _last[event] ?? null;
  },

  // Clear cached payload — call after consuming to avoid stale data on next mount.
  clear(event) {
    delete _last[event];
  },
};

export default eventBus;
