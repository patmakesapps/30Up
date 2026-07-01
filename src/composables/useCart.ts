// Shared cart state — a module-singleton (same pattern as useAuth), persisted to
// localStorage so it survives refreshes and the round-trip through checkout.
//
// The cart stores ONLY { productId, qty }. It never stores prices — prices are
// authoritative server-side (createCheckoutSession reads them from Firestore).
import { computed, ref, watch } from 'vue'
import type { CartLine } from '../types/models'

const STORAGE_KEY = '30up.cart.v1'

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Keep only well-formed lines.
    return parsed
      .filter(
        (l: any) =>
          typeof l?.productId === 'string' && Number.isInteger(l?.qty) && l.qty > 0,
      )
      .map((l: any) => ({ productId: l.productId, qty: l.qty }))
  } catch {
    return []
  }
}

const items = ref<CartLine[]>(load())

// Persist on every change.
watch(
  items,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch {
      /* storage unavailable — ignore */
    }
  },
  { deep: true },
)

const count = computed(() => items.value.reduce((n, l) => n + l.qty, 0))

function add(productId: string, qty = 1) {
  const existing = items.value.find((l) => l.productId === productId)
  if (existing) {
    existing.qty += qty
  } else {
    items.value.push({ productId, qty })
  }
}

function setQty(productId: string, qty: number) {
  const line = items.value.find((l) => l.productId === productId)
  if (!line) return
  if (qty <= 0) {
    remove(productId)
  } else {
    line.qty = qty
  }
}

function remove(productId: string) {
  items.value = items.value.filter((l) => l.productId !== productId)
}

function clear() {
  items.value = []
}

export function useCart() {
  return { items, count, add, setQty, remove, clear }
}
