// Shared Firestore data-model types for 30Up commerce.
//
// Single source of truth for the shapes stored in Firestore. Used by the Vue
// admin/storefront now, and mirrored by the Cloud Functions later.
//
// RULES BAKED IN HERE (see the architecture rules):
//  - All money is INTEGER CENTS. Never store floats/dollars. Field names end in
//    `Cents` to make this impossible to forget.
//  - Prices are authoritative in `products` and looked up server-side at
//    checkout. The client never sends prices.
//  - Subscription fields (`subscriptionEnabled`, `stripePriceId`) exist now so
//    "subscribe & save" needs no restructuring later.

import type { Timestamp } from 'firebase/firestore'

// ---- Products -------------------------------------------------------------

export interface Product {
  name: string
  description: string
  /** Price in integer cents (e.g. 3499 = $34.99). Authoritative. */
  priceCents: number
  sku: string
  inventoryCount: number
  active: boolean
  /** Storage URLs (or paths) for product imagery. */
  images: string[]
  /** Future "subscribe & save". Defaults to false. */
  subscriptionEnabled: boolean
  /** Stripe recurring Price id for subscriptions; null until configured. */
  stripePriceId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

/** A Product read from Firestore, with its document id attached. */
export type ProductDoc = Product & { id: string }

// ---- Orders ---------------------------------------------------------------

export type OrderStatus =
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface ShippingAddress {
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

/** Immutable snapshot of a purchased line item at time of sale. */
export interface OrderItem {
  productId: string
  name: string
  qty: number
  /** Unit price in integer cents, captured at checkout. */
  unitPriceCents: number
}

/** An admin note appended to an order. The notes array is append-only. */
export interface OrderNote {
  text: string
  adminUid: string
  at: Timestamp
}

export interface Order {
  stripeSessionId: string
  stripePaymentIntentId: string | null
  customerEmail: string
  customerName: string
  shippingAddress: ShippingAddress
  /** Total charged, integer cents. */
  amountTotalCents: number
  /** ISO 4217, lowercase (Stripe convention), e.g. "usd". */
  currency: string
  status: OrderStatus
  trackingNumber: string | null
  notes: OrderNote[]
  items: OrderItem[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type OrderDoc = Order & { id: string }

// ---- Admin audit log ------------------------------------------------------

export interface AdminLog {
  adminUid: string
  /** Machine-readable action, e.g. "createProduct", "updateOrderStatus". */
  action: string
  /** Id of the affected document (productId / orderId), when applicable. */
  targetId: string | null
  /** Free-form structured context for the action. */
  detail: Record<string, unknown>
  at: Timestamp
}

export type AdminLogDoc = AdminLog & { id: string }

// ---- Cart (client-side only; never persisted with prices) -----------------

/** What the client sends to `createCheckoutSession`. Note: NO price — the
 *  server looks up the authoritative price from `products`. */
export interface CartLine {
  productId: string
  qty: number
}
