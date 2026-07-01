// Cloud Functions entry point for 30Up.
//
// Importing ./firebaseAdmin first guarantees the Admin SDK is initialized before
// any function module uses Firestore. Each phase adds its exports here:
//   Phase 3: product management callables (below)
//   Phase 4: createCheckoutSession, sessionStatus
//   Phase 5: stripeWebhook
//   Phase 6: order operation callables
//   Phase 8: refundOrder
import './firebaseAdmin'

export { createProduct, updateProduct, setProductActive } from './products'
export { createCheckoutSession, sessionStatus } from './checkout'
