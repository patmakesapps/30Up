// Single Admin SDK initialization for all functions. The Admin SDK runs with
// full privileges and BYPASSES Firestore security rules — which is exactly why
// every callable must independently verify the caller is an admin (see
// ./util/admin.ts). Rules are the client's boundary; this code is trusted.
import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (getApps().length === 0) {
  initializeApp()
}

export const db = getFirestore()
