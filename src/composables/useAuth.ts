// Shared authentication state + helpers built on Firebase Auth.
//
// `user` is a single app-wide ref that any component can import and react to.
// `authReady` flips to true once Firebase has reported the initial auth state,
// which lets route guards avoid redirecting before we know if someone is signed in.

import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase'

const user = ref<User | null>(null)
const authReady = ref(false)
// Whether the signed-in user carries the { admin: true } custom claim.
// This is derived from the Firebase ID token, which is verified by Firebase —
// it is NOT something the client can set. Server-side rules/functions re-check
// the same claim; this ref only drives UI/route decisions.
const isAdmin = ref(false)

// Read the admin custom claim off the current user's ID token.
async function resolveAdminClaim(u: User | null): Promise<void> {
  if (!u) {
    isAdmin.value = false
    return
  }
  try {
    const token = await u.getIdTokenResult()
    isAdmin.value = token.claims.admin === true
  } catch {
    isAdmin.value = false
  }
}

// Start listening once, as soon as this module is first imported.
// We resolve the admin claim BEFORE flipping authReady so route guards can
// trust isAdmin the moment they run.
onAuthStateChanged(auth, async (u) => {
  user.value = u
  await resolveAdminClaim(u)
  authReady.value = true
})

// Force-refresh the ID token and re-read claims. Call this right after an admin
// claim is granted server-side so the user doesn't have to fully sign out/in.
async function refreshClaims(): Promise<boolean> {
  const u = auth.currentUser
  if (!u) {
    isAdmin.value = false
    return false
  }
  await u.getIdToken(true) // bust the cached token
  await resolveAdminClaim(u)
  return isAdmin.value
}

async function signUp(email: string, password: string, displayName?: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    await updateProfile(cred.user, { displayName })
  }
  return cred.user
}

async function logIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

async function logOut() {
  await signOut(auth)
}

// Google sign-in (provider must be enabled in the Firebase Console).
async function logInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  return cred.user
}

export function useAuth() {
  return {
    user,
    authReady,
    isAdmin,
    refreshClaims,
    signUp,
    logIn,
    logOut,
    logInWithGoogle,
  }
}
