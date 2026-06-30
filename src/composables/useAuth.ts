// Shared authentication state + helpers built on Firebase Auth.
//
// `user` is a single app-wide ref that any component can import and react to.
// `authReady` flips to true once Firebase has reported the initial auth state,
// which lets route guards avoid redirecting before we know if someone is signed in.

import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase'

const user = ref<User | null>(null)
const authReady = ref(false)

// Start listening once, as soon as this module is first imported.
onAuthStateChanged(auth, (u) => {
  user.value = u
  authReady.value = true
})

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

export function useAuth() {
  return { user, authReady, signUp, logIn, logOut }
}
