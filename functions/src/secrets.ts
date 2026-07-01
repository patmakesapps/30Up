// Server-side secrets, defined once and referenced by the functions that need
// them. Values come from functions/.secret.local for the emulator, and from
// Google Secret Manager in production (set with `firebase functions:secrets:set`).
//
// Product callables don't use Stripe, but the wiring lives here so Phases 4 & 5
// (checkout + webhook) just import these and attach them to their function's
// `secrets` option. NEVER read these on the client.
import { defineSecret } from 'firebase-functions/params'

export const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')
export const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET')
