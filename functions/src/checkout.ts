// Checkout callables.
//
//   createCheckoutSession — the ONLY place prices are decided. It ignores any
//     price the client might send and reads priceCents straight from Firestore.
//     It creates a Stripe Embedded Checkout Session and returns its clientSecret.
//     NO ORDER IS CREATED HERE. The order is written later, exactly once, by the
//     Phase 5 webhook on checkout.session.completed. This function has no write
//     to `orders` at all — that separation is intentional and load-bearing.
//
//   sessionStatus — read-only status lookup for the return page. Unauthenticated
//     (a guest may have just paid); returns only non-sensitive status fields.
//
// The productId is stamped into each line item's product_data.metadata so the
// webhook can rebuild an authoritative item snapshot from the Stripe session
// itself — no size-limited metadata blobs, no client-supplied line data.
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineBoolean } from 'firebase-functions/params'
import Stripe from 'stripe'
import { db } from './firebaseAdmin'
import { STRIPE_SECRET_KEY } from './secrets'
import { reqString, reqInt } from './util/validate'

const REGION = 'us-central1'
const CURRENCY = 'usd'

// Toggle Stripe Tax without a code change. Defaults ON. Override at deploy time
// (e.g. AUTOMATIC_TAX_ENABLED=false in functions/.env) if Stripe Tax isn't set
// up yet — the session will then be created without automatic tax.
const AUTOMATIC_TAX_ENABLED = defineBoolean('AUTOMATIC_TAX_ENABLED', {
  default: true,
})
const ALLOWED_SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
  ['US']

// Built lazily inside handlers so STRIPE_SECRET_KEY.value() is available.
function stripeClient(): Stripe {
  return new Stripe(STRIPE_SECRET_KEY.value())
}

interface CartLineInput {
  productId: string
  qty: number
}

// Validate the raw cart payload into a clean list. Rejects empty carts and
// non-integer quantities; the price is NOT taken from the client at all.
function parseCart(raw: unknown): CartLineInput[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new HttpsError('invalid-argument', 'Cart is empty.')
  }
  if (raw.length > 50) {
    throw new HttpsError('invalid-argument', 'Too many line items.')
  }
  return raw.map((line: any, i) => ({
    productId: reqString(line?.productId, `cart[${i}].productId`, { max: 200 }),
    qty: reqInt(line?.qty, `cart[${i}].qty`, { min: 1, max: 999 }),
  }))
}

export const createCheckoutSession = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    const cart = parseCart(request.data?.cart)

    // The client tells us where to send the buyer back; embedded checkout
    // requires an absolute return_url containing the session-id template.
    const origin = reqString(request.data?.origin, 'origin', { max: 500 })
    if (!/^https?:\/\//.test(origin)) {
      throw new HttpsError('invalid-argument', 'Invalid origin.')
    }

    // Collapse duplicate productIds so a repeated id can't dodge stock checks.
    const qtyById = new Map<string, number>()
    for (const line of cart) {
      qtyById.set(line.productId, (qtyById.get(line.productId) ?? 0) + line.qty)
    }

    // Load every product from Firestore — this is the authoritative source for
    // price, name, availability and stock. Anything the client claimed is moot.
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    for (const [productId, qty] of qtyById) {
      const snap = await db.collection('products').doc(productId).get()
      if (!snap.exists) {
        throw new HttpsError('not-found', `Product ${productId} no longer exists.`)
      }
      const p = snap.data() as {
        name: string
        priceCents: number
        active: boolean
        inventoryCount: number
        images?: string[]
      }
      if (!p.active) {
        throw new HttpsError('failed-precondition', `"${p.name}" is not available.`)
      }
      if (typeof p.priceCents !== 'number' || !Number.isInteger(p.priceCents)) {
        throw new HttpsError('internal', `"${p.name}" has an invalid price.`)
      }
      if (p.inventoryCount < qty) {
        throw new HttpsError(
          'failed-precondition',
          `Not enough stock for "${p.name}" (${p.inventoryCount} left).`,
        )
      }

      lineItems.push({
        quantity: qty,
        price_data: {
          currency: CURRENCY,
          unit_amount: p.priceCents, // authoritative, integer cents
          product_data: {
            name: p.name,
            images: p.images?.slice(0, 1),
            // Lets the webhook map this Stripe line back to our product.
            metadata: { productId },
          },
        },
      })
    }

    const session = await stripeClient().checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: lineItems,
      automatic_tax: { enabled: AUTOMATIC_TAX_ENABLED.value() },
      shipping_address_collection: { allowed_countries: ALLOWED_SHIPPING_COUNTRIES },
      return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    })

    return { clientSecret: session.client_secret }
  },
)

export const sessionStatus = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    const sessionId = reqString(request.data?.sessionId, 'sessionId', { max: 200 })
    const session = await stripeClient().checkout.sessions.retrieve(sessionId)

    // Only non-sensitive fields — enough to render a confirmation.
    return {
      status: session.status, // 'open' | 'complete' | 'expired'
      paymentStatus: session.payment_status, // 'paid' | 'unpaid' | 'no_payment_required'
      customerEmail: session.customer_details?.email ?? null,
      amountTotalCents: session.amount_total ?? null,
      currency: session.currency ?? CURRENCY,
    }
  },
)
