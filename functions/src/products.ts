// Product management callables. Each one:
//   1. re-verifies the caller is an admin (assertAdmin) — server-side, claim-based
//   2. validates + normalizes input (never trusts client money/shape)
//   3. writes to Firestore via the Admin SDK
//   4. appends an adminLogs audit entry
//
// Prices are integer cents. `subscriptionEnabled` / `stripePriceId` exist now
// (default false / null) so "subscribe & save" needs no later restructuring.
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from './firebaseAdmin'
import { assertAdmin, writeAdminLog } from './util/admin'
import { reqString, reqInt, reqBool, stringArray } from './util/validate'

const REGION = 'us-central1'

// Fields a client is allowed to set on a product. `createdAt`/`updatedAt` are
// server-controlled and never accepted from the client.
interface ProductWrite {
  name: string
  description: string
  priceCents: number
  sku: string
  inventoryCount: number
  active: boolean
  images: string[]
  subscriptionEnabled: boolean
  stripePriceId: string | null
}

function validateFullProduct(data: any): ProductWrite {
  return {
    name: reqString(data?.name, 'name', { max: 200 }),
    description: reqString(data?.description, 'description', { min: 0, max: 5000 }),
    priceCents: reqInt(data?.priceCents, 'priceCents', { min: 0, max: 100_000_000 }),
    sku: reqString(data?.sku, 'sku', { max: 100 }),
    inventoryCount: reqInt(data?.inventoryCount, 'inventoryCount', { min: 0 }),
    active: reqBool(data?.active, 'active'),
    images: stringArray(data?.images, 'images'),
    subscriptionEnabled:
      data?.subscriptionEnabled === undefined
        ? false
        : reqBool(data.subscriptionEnabled, 'subscriptionEnabled'),
    stripePriceId:
      data?.stripePriceId === undefined || data?.stripePriceId === null
        ? null
        : reqString(data.stripePriceId, 'stripePriceId', { max: 200 }),
  }
}

// ---- createProduct --------------------------------------------------------
export const createProduct = onCall({ region: REGION }, async (request) => {
  const adminUid = assertAdmin(request)
  const product = validateFullProduct(request.data)

  const ref = await db.collection('products').add({
    ...product,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  await writeAdminLog({
    adminUid,
    action: 'createProduct',
    targetId: ref.id,
    detail: { name: product.name, sku: product.sku, priceCents: product.priceCents },
  })

  return { id: ref.id }
})

// ---- updateProduct --------------------------------------------------------
// Full-document update of the editable fields (client always sends the whole
// form). `id` identifies the target; the doc must already exist.
export const updateProduct = onCall({ region: REGION }, async (request) => {
  const adminUid = assertAdmin(request)
  const id = reqString(request.data?.id, 'id', { max: 200 })
  const product = validateFullProduct(request.data)

  const ref = db.collection('products').doc(id)
  const snap = await ref.get()
  if (!snap.exists) {
    // Surface a clean error rather than silently creating via set().
    throw new HttpsError('not-found', 'Product not found.')
  }

  await ref.update({
    ...product,
    updatedAt: FieldValue.serverTimestamp(),
  })

  await writeAdminLog({
    adminUid,
    action: 'updateProduct',
    targetId: id,
    detail: { name: product.name, sku: product.sku, priceCents: product.priceCents },
  })

  return { ok: true }
})

// ---- setProductActive -----------------------------------------------------
// Dedicated toggle so the list can flip visibility without sending the whole
// form. Public storefront reads are gated on `active == true` (firestore.rules).
export const setProductActive = onCall({ region: REGION }, async (request) => {
  const adminUid = assertAdmin(request)
  const id = reqString(request.data?.id, 'id', { max: 200 })
  const active = reqBool(request.data?.active, 'active')

  const ref = db.collection('products').doc(id)
  const snap = await ref.get()
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Product not found.')
  }

  await ref.update({ active, updatedAt: FieldValue.serverTimestamp() })

  await writeAdminLog({
    adminUid,
    action: 'setProductActive',
    targetId: id,
    detail: { active },
  })

  return { ok: true }
})
