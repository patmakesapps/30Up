// Phase 7 placeholder — transactional emails.
//
// These are intentionally no-op stubs so the call sites exist now (order
// created, tracking added) and Phase 7 is just "fill in a provider". When we
// implement, pick Resend or SendGrid, add its API key as a defineSecret, render
// a minimal template, and send here. Failures must NOT break the calling flow
// (an email hiccup should never fail a webhook or a fulfillment write), so these
// swallow errors and only log.
import { logger } from 'firebase-functions'

export interface OrderEmailContext {
  orderId: string
  customerEmail: string
  customerName: string
  amountTotalCents: number
  currency: string
  trackingNumber?: string | null
}

/** Sent when the webhook creates a paid order. */
export async function sendOrderConfirmation(ctx: OrderEmailContext): Promise<void> {
  // TODO(Phase 7): send confirmation email via provider.
  logger.info('[email:TODO] order confirmation', {
    orderId: ctx.orderId,
    to: ctx.customerEmail,
  })
}

/** Sent when a tracking number is saved on an order. */
export async function sendShippedEmail(ctx: OrderEmailContext): Promise<void> {
  // TODO(Phase 7): send "your order shipped" email via provider.
  logger.info('[email:TODO] shipped notification', {
    orderId: ctx.orderId,
    to: ctx.customerEmail,
    tracking: ctx.trackingNumber ?? null,
  })
}
