// Server-side admin enforcement + audit logging.
//
// THIS is the real access-control boundary for admin operations. The Vue router
// guard and hidden UI are conveniences; they prove nothing. Every admin callable
// calls assertAdmin() first, which verifies the { admin: true } custom claim on
// the caller's *verified* ID token. We check the claim only — never an email.
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../firebaseAdmin'

/**
 * Throw unless the caller is an authenticated admin. Returns the admin's uid.
 * `request.auth.token` holds the decoded, Firebase-verified ID token claims —
 * a client cannot forge `admin: true` here.
 */
export function assertAdmin(request: CallableRequest): string {
  const auth = request.auth
  if (!auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }
  if (auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Admin access required.')
  }
  return auth.uid
}

/** Append an entry to the admin audit trail. Best-effort but awaited. */
export async function writeAdminLog(params: {
  adminUid: string
  action: string
  targetId: string | null
  detail: Record<string, unknown>
}): Promise<void> {
  await db.collection('adminLogs').add({
    adminUid: params.adminUid,
    action: params.action,
    targetId: params.targetId,
    detail: params.detail,
    at: FieldValue.serverTimestamp(),
  })
}
