// Typed wrappers around the product-management callable Cloud Functions.
// The admin UI calls these; the functions re-verify the admin claim server-side
// (see functions/src/util/admin.ts) — this layer is convenience, not security.
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

/** Editable product fields sent to create/update. Note: NO timestamps — those
 *  are server-controlled. Prices are integer cents. */
export interface ProductInput {
  name: string
  description: string
  priceCents: number
  sku: string
  inventoryCount: number
  active: boolean
  images: string[]
  subscriptionEnabled?: boolean
  stripePriceId?: string | null
}

export const createProduct = httpsCallable<ProductInput, { id: string }>(
  functions,
  'createProduct',
)

export const updateProduct = httpsCallable<
  ProductInput & { id: string },
  { ok: true }
>(functions, 'updateProduct')

export const setProductActive = httpsCallable<
  { id: string; active: boolean },
  { ok: true }
>(functions, 'setProductActive')
