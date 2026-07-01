// Order operation callables (Phase 6) + refundOrder (Phase 8).
//
// Every one re-verifies admin server-side (assertAdmin) and writes an adminLogs
// entry. Orders themselves were created only by the webhook; these mutate
// fulfillment fields. Refunds intentionally do NOT set status here — the refund
// is issued via Stripe and the charge.refunded webhook flips status to
// 'refunded', keeping a single source of truth for that transition.
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import { db } from './firebaseAdmin'
import { STRIPE_SECRET_KEY } from './secrets'
import { assertAdmin, writeAdminLog } from './util/admin'
import { reqString } from './util/validate'
import { sendShippedEmail } from './email'

const REGION = 'us-central1'

// Statuses an admin may set by hand. 'paid' is set by the webhook on creation;
// 'refunded' is driven only by the refund flow / charge.refunded webhook.
const MANUAL_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'] as const
type ManualStatus = (typeof MANUAL_STATUSES)[number]

function orderRef(id: string) {
  return db.collection('orders').doc(id)
}

// ---- updateOrderStatus ----------------------------------------------------
export const updateOrderStatus = onCall({ region: REGION }, async (request) => {
  const adminUid = assertAdmin(request)
  const orderId = reqString(request.data?.orderId, 'orderId', { max: 200 })
  const status = request.data?.status
  if (!MANUAL_STATUSES.includes(status)) {
    throw new HttpsError(
      'invalid-argument',
      `status must be one of: ${MANUAL_STATUSES.join(', ')}.`,
    )
  }

  const ref = orderRef(orderId)
  const snap = await ref.get()
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found.')
  const previous = (snap.data() as any).status

  await ref.update({ status: status as ManualStatus, updatedAt: FieldValue.serverTimestamp() })
  await writeAdminLog({
    adminUid,
    action: 'updateOrderStatus',
    targetId: orderId,
    detail: { from: previous, to: status },
  })
  return { ok: true }
})

// ---- addOrderNote (append-only) -------------------------------------------
export const addOrderNote = onCall({ region: REGION }, async (request) => {
  const adminUid = assertAdmin(request)
  const orderId = reqString(request.data?.orderId, 'orderId', { max: 200 })
  const text = reqString(request.data?.text, 'text', { max: 2000 })

  const ref = orderRef(orderId)
  // serverTimestamp() can't be used inside array elements, so stamp the note
  // with Timestamp.now() and append in a transaction to avoid lost updates.
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new HttpsError('not-found', 'Order not found.')
    const notes = (snap.data() as any).notes ?? []
    notes.push({ text, adminUid, at: Timestamp.now() })
    tx.update(ref, { notes, updatedAt: FieldValue.serverTimestamp() })
  })

  await writeAdminLog({
    adminUid,
    action: 'addOrderNote',
    targetId: orderId,
    detail: { textPreview: text.slice(0, 80) },
  })
  return { ok: true }
})

// ---- setTracking ----------------------------------------------------------
export const setTracking = onCall({ region: REGION }, async (request) => {
  const adminUid = assertAdmin(request)
  const orderId = reqString(request.data?.orderId, 'orderId', { max: 200 })
  const trackingNumber = reqString(request.data?.trackingNumber, 'trackingNumber', {
    max: 200,
  })

  const ref = orderRef(orderId)
  const snap = await ref.get()
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found.')
  const order = snap.data() as any

  await ref.update({ trackingNumber, updatedAt: FieldValue.serverTimestamp() })
  await writeAdminLog({
    adminUid,
    action: 'setTracking',
    targetId: orderId,
    detail: { trackingNumber },
  })

  // Phase 7 hook: notify the customer their order shipped (no-op stub for now).
  await sendShippedEmail({
    orderId,
    customerEmail: order.customerEmail ?? '',
    customerName: order.customerName ?? '',
    amountTotalCents: order.amountTotalCents ?? 0,
    currency: order.currency ?? 'usd',
    trackingNumber,
  })

  return { ok: true }
})

// ---- refundOrder (Phase 8) ------------------------------------------------
// Issues the refund via Stripe. Does NOT flip status here — the charge.refunded
// webhook does that, so 'refunded' has exactly one source of truth.
export const refundOrder = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    const adminUid = assertAdmin(request)
    const orderId = reqString(request.data?.orderId, 'orderId', { max: 200 })

    const ref = orderRef(orderId)
    const snap = await ref.get()
    if (!snap.exists) throw new HttpsError('not-found', 'Order not found.')
    const order = snap.data() as any

    const paymentIntentId = order.stripePaymentIntentId
    if (!paymentIntentId) {
      throw new HttpsError('failed-precondition', 'Order has no payment to refund.')
    }
    if (order.status === 'refunded') {
      throw new HttpsError('failed-precondition', 'Order is already refunded.')
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY.value())
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId })

    await writeAdminLog({
      adminUid,
      action: 'refundOrder',
      targetId: orderId,
      detail: { refundId: refund.id, paymentIntentId },
    })

    // Status stays until charge.refunded arrives and flips it to 'refunded'.
    return { ok: true, refundId: refund.id }
  },
)
