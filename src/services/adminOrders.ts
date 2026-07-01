// Typed wrappers for the order-operation callables (Phase 6) + refund (Phase 8).
// Each re-verifies admin server-side and writes an adminLogs entry.
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

export const updateOrderStatus = httpsCallable<
  { orderId: string; status: 'processing' | 'shipped' | 'delivered' | 'cancelled' },
  { ok: true }
>(functions, 'updateOrderStatus')

export const addOrderNote = httpsCallable<
  { orderId: string; text: string },
  { ok: true }
>(functions, 'addOrderNote')

export const setTracking = httpsCallable<
  { orderId: string; trackingNumber: string },
  { ok: true }
>(functions, 'setTracking')

export const refundOrder = httpsCallable<
  { orderId: string },
  { ok: true; refundId: string }
>(functions, 'refundOrder')
