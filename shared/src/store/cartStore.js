import { create } from 'zustand';

/**
 * Cart store — source of truth cho shopping cart.
 *
 * mfe-products gọi addItem() → mfe-cart re-render ngay lập tức
 * vì cả hai cùng trỏ vào 1 store instance (singleton zustand).
 */
export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, qty: 1 }] };
    }),

  updateQty: (id, delta) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    })),

  // Selector helpers — dùng bên ngoài React (shell subscribe, etc.)
  getCount: () => get().items.reduce((s, i) => s + i.qty, 0),
  getTotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
}));
