// Firebase initialization for 30Up.
//
// These values come from your Firebase project's Web app config and are read
// from environment variables (see `.env` / `.env.example`). NOTE: Firebase web
// config values are NOT secrets — they're safe to ship to the browser. Access
// is controlled by Firestore Security Rules, not by hiding these keys.

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

// Firestore database instance used by the waitlist form.
export const db = getFirestore(app)

// Auth instance used for account creation / sign-in.
export const auth = getAuth(app)

// Google Analytics — only initialized in browsers that support it.
isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app)
  })
  .catch(() => {
    /* Analytics unavailable (e.g. unsupported environment) — safe to ignore. */
  })
