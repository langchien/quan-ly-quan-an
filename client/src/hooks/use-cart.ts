import { create } from 'zustand'

// Types

export interface CartItem {
  dishId: number
  dishName: string
  dishImage: string
  price: number
  quantity: number
  note?: string
}

interface CartState {
  items: CartItem[]
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity' | 'note'>) => void
  removeItem: (dishId: number) => void
  updateQuantity: (dishId: number, quantity: number) => void
  updateNote: (dishId: number, note: string) => void
  clearCart: () => void
}

type CartStore = CartState & CartActions

// Store

/**
 * Giỏ hàng khách hàng — KHÔNG persist (xóa khi reload hoặc đặt món xong)
 */
export const useCartStore = create<CartStore>()(set => ({
  items: [],

  addItem: newItem =>
    set(state => {
      const existing = state.items.find(i => i.dishId === newItem.dishId)
      if (existing) {
        // Đã có thì tăng số lượng
        return {
          items: state.items.map(i =>
            i.dishId === newItem.dishId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { items: [...state.items, { ...newItem, quantity: 1 }] }
    }),

  removeItem: dishId =>
    set(state => ({
      items: state.items.filter(i => i.dishId !== dishId),
    })),

  updateQuantity: (dishId, quantity) =>
    set(state => {
      if (quantity <= 0) {
        return { items: state.items.filter(i => i.dishId !== dishId) }
      }
      return {
        items: state.items.map(i => (i.dishId === dishId ? { ...i, quantity } : i)),
      }
    }),

  updateNote: (dishId, note) =>
    set(state => ({
      items: state.items.map(i => (i.dishId === dishId ? { ...i, note } : i)),
    })),

  clearCart: () => set({ items: [] }),
}))

// Selectors

/** Tổng số lượng món trong giỏ */
export const selectCartTotalItems = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

/** Tổng tiền giỏ hàng */
export const selectCartTotal = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
