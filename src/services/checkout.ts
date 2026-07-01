// Typed wrappers for the checkout callables. The publishable key lives only in
// the client env (VITE_STRIPE_PUBLISHABLE_KEY); the secret key never leaves the
// server. No order is created by any of this — that's the webhook's job.
import { httpsCallable } from 'firebase/functions'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { functions } from '../firebase'
import type { CartLine } from '../types/models'

export const createCheckoutSession = httpsCallable<
  { cart: CartLine[]; origin: string },
  { clientSecret: string }
>(functions, 'createCheckoutSession')

export const sessionStatus = httpsCallable<
  { sessionId: string },
  {
    status: 'open' | 'complete' | 'expired' | null
    paymentStatus: string | null
    customerEmail: string | null
    amountTotalCents: number | null
    currency: string
  }
>(functions, 'sessionStatus')

// Singleton Stripe.js promise — loadStripe should be called once per app.
let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!pk) {
      return Promise.reject(
        new Error('VITE_STRIPE_PUBLISHABLE_KEY is not set in the client env.'),
      )
    }
    stripePromise = loadStripe(pk)
  }
  return stripePromise
}
