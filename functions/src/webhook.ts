// Stripe webhook — the SINGLE source of truth for orders.
//
// Orders are created here and NOWHERE else. The browser never writes an order;
// the success redirect is not trusted as proof of payment (firestore.rules also
// forbids client writes to `orders`). Only a Stripe-signed event that we verify
// with the endpoint's signing secret can create or mutate an order.
//
// Handled events:
//   checkout.session.completed -> create the authoritative order (status 'paid')
//     and decrement inventory, atomically + idempotently.
//   charge.refunded            -> flip the matching order to status 'refunded'.
import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import { FieldValue } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import { db } from './firebaseAdmin'
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from './secrets'
import { sendOrderConfirmation } from './email'

const REGION = 'us-central1'

function stripeClient(): Stripe {
  return new Stripe(STRIPE_SECRET_KEY.value())
}

interface OrderItem {
  productId: string
  name: string
  qty: number
  unitPriceCents: number
}

// Pull our productId (stamped into product_data.metadata in Phase 4) + the
// authoritative unit price off each expanded Stripe line item.
function buildItemSnapshot(session: Stripe.Checkout.Session): OrderItem[] {
  const items: OrderItem[] = []
  for (const li of session.line_items?.data ?? []) {
    const product = li.price?.product
    const productId =
      product && typeof product === 'object' && 'metadata' in product
        ? (product.metadata?.productId ?? undefined)
        : undefined
    if (!productId) continue // skip anything not one of our products (e.g. shipping)
    const name =
      product && typeof product === 'object' && 'name' in product
        ? ((product as Stripe.Product).name ?? li.description ?? '')
        : (li.description ?? '')
    items.push({
      productId,
      name,
      qty: li.quantity ?? 0,
      unitPriceCents: li.price?.unit_amount ?? 0,
    })
  }
  return items
}

function extractShipping(session: Stripe.Checkout.Session) {
  // Field moved across Stripe API versions: newer = collected_information,
  // older = shipping_details. Fall back to billing address if neither exists.
  const anySession = session as any
  const ship =
    anySession.collected_information?.shipping_details ??
    anySession.shipping_details ??
    null
  const addr = ship?.address ?? session.customer_details?.address ?? {}
  return {
    name: ship?.name ?? session.customer_details?.name ?? '',
    address: {
      line1: addr.line1 ?? '',
      line2: addr.line2 ?? null,
      city: addr.city ?? '',
      state: addr.state ?? '',
      postalCode: addr.postal_code ?? '',
      country: addr.country ?? '',
    },
  }
}

// ---- checkout.session.completed -------------------------------------------
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Only record a paid order. Async/delayed payment methods can complete a
  // session while still unpaid — those arrive later as their own events.
  if (session.payment_status !== 'paid') {
    logger.info('Session completed but not paid; skipping', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    })
    return
  }

  // Re-fetch the session with line items + product expanded so we can map each
  // line back to our productId and read the exact charged unit price.
  const full = await stripeClient().checkout.sessions.retrieve(session.id, {
    expand: ['line_items.data.price.product'],
  })

  const items = buildItemSnapshot(full)
  const shipping = extractShipping(full)
  const paymentIntentId =
    typeof full.payment_intent === 'string'
      ? full.payment_intent
      : (full.payment_intent?.id ?? null)

  // Aggregate quantities per product for the inventory decrement (defensive —
  // Phase 4 already merges duplicate ids into one line).
  const qtyByProduct = new Map<string, number>()
  for (const it of items) {
    qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) ?? 0) + it.qty)
  }

  // The order doc id IS the Stripe session id. That gives us idempotency for
  // free: a redelivered webhook resolves to the same doc, and the transaction
  // below no-ops if it already exists — no duplicate orders, no double
  // inventory decrement.
  const orderRef = db.collection('orders').doc(full.id)

  const created = await db.runTransaction(async (tx) => {
    // --- all reads first ---
    const existing = await tx.get(orderRef)
    if (existing.exists) {
      logger.info('Order already exists; idempotent no-op', { sessionId: full.id })
      return false
    }
    const productIds = [...qtyByProduct.keys()]
    const productRefs = productIds.map((id) => db.collection('products').doc(id))
    const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)))

    // --- then all writes ---
    productSnaps.forEach((snap, i) => {
      if (!snap.exists) return // product deleted since checkout; skip decrement
      const current = (snap.data() as any).inventoryCount ?? 0
      const next = Math.max(0, current - (qtyByProduct.get(productIds[i]) ?? 0))
      tx.update(productRefs[i], {
        inventoryCount: next,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    tx.set(orderRef, {
      stripeSessionId: full.id,
      stripePaymentIntentId: paymentIntentId,
      customerEmail: full.customer_details?.email ?? '',
      customerName: shipping.name,
      shippingAddress: shipping.address,
      amountTotalCents: full.amount_total ?? 0,
      currency: full.currency ?? 'usd',
      status: 'paid',
      trackingNumber: null,
      notes: [],
      items,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return true
  })

  if (created) {
    logger.info('Order created', { sessionId: full.id, items: items.length })
    // Phase 7 hook: order confirmation email (no-op stub for now). Kept outside
    // the transaction and only on first creation, so redeliveries don't re-send.
    await sendOrderConfirmation({
      orderId: full.id,
      customerEmail: full.customer_details?.email ?? '',
      customerName: shipping.name,
      amountTotalCents: full.amount_total ?? 0,
      currency: full.currency ?? 'usd',
    })
  }
}

// ---- charge.refunded ------------------------------------------------------
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null)
  if (!paymentIntentId) return

  const snap = await db
    .collection('orders')
    .where('stripePaymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get()

  if (snap.empty) {
    logger.warn('Refund for unknown order', { paymentIntentId })
    return
  }

  await snap.docs[0].ref.update({
    status: 'refunded',
    updatedAt: FieldValue.serverTimestamp(),
  })
  logger.info('Order marked refunded', { orderId: snap.docs[0].id })
}

export const stripeWebhook = onRequest(
  { region: REGION, secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    // 1. Verify the signature against the RAW body. Any failure is rejected.
    const signature = req.headers['stripe-signature']
    let event: Stripe.Event
    try {
      event = stripeClient().webhooks.constructEvent(
        req.rawBody, // Firebase provides the unparsed body here
        signature as string,
        STRIPE_WEBHOOK_SECRET.value(),
      )
    } catch (err: any) {
      logger.warn('Webhook signature verification failed', { message: err?.message })
      res.status(400).send(`Webhook Error: ${err?.message}`)
      return
    }

    // 2. Handle the events we care about. Throw -> 500 -> Stripe retries.
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break
        case 'charge.refunded':
          await handleChargeRefunded(event.data.object as Stripe.Charge)
          break
        default:
          // Acknowledge unhandled events so Stripe stops retrying them.
          break
      }
      res.status(200).json({ received: true })
    } catch (err: any) {
      logger.error('Webhook handler error', { type: event.type, message: err?.message })
      res.status(500).send('Webhook handler error')
    }
  },
)
