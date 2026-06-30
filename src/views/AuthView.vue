<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import logo from '../photos/logo-full.png'

const { signUp, logIn, logInWithGoogle } = useAuth()
const router = useRouter()
const route = useRoute()

// "login" or "signup" — toggled in the UI.
const mode = ref<'login' | 'signup'>(
  route.query.mode === 'signup' ? 'signup' : 'login',
)

const form = reactive({
  name: '',
  email: '',
  password: '',
})

const submitting = ref(false)
const errorMsg = ref<string | null>(null)

// Map Firebase Auth error codes to friendly copy.
function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email already has an account. Try logging in instead.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

function goNext() {
  const redirect = (route.query.redirect as string) || '/account'
  router.push(redirect)
}

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  errorMsg.value = null

  try {
    if (mode.value === 'signup') {
      await signUp(form.email.trim(), form.password, form.name.trim() || undefined)
    } else {
      await logIn(form.email.trim(), form.password)
    }
    goNext()
  } catch (err) {
    errorMsg.value = friendlyError((err as { code?: string }).code ?? '')
  } finally {
    submitting.value = false
  }
}

async function handleGoogle() {
  if (submitting.value) return
  submitting.value = true
  errorMsg.value = null

  try {
    await logInWithGoogle()
    goNext()
  } catch (err) {
    errorMsg.value = friendlyError((err as { code?: string }).code ?? '')
  } finally {
    submitting.value = false
  }
}

function switchMode(next: 'login' | 'signup') {
  mode.value = next
  errorMsg.value = null
}
</script>

<template>
  <section class="relative overflow-hidden py-20">
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-razz-600/20 blur-[120px]"></div>
    </div>

    <div class="container-pad">
      <div class="glass mx-auto max-w-md p-8 shadow-card sm:p-10">
        <RouterLink to="/" class="mx-auto mb-6 block w-40">
          <img :src="logo" alt="30Up — Energy for grown-up life" class="w-full" />
        </RouterLink>

        <h1 class="text-center text-3xl font-extrabold text-white">
          {{ mode === 'signup' ? 'Create your account' : 'Welcome back' }}
        </h1>
        <p class="mt-2 text-center text-sm text-slate-400">
          {{
            mode === 'signup'
              ? 'Join 30Up to track your first-batch status and, soon, your orders.'
              : 'Log in to your 30Up account.'
          }}
        </p>

        <!-- Mode toggle -->
        <div class="mt-6 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-ink-900/60 p-1">
          <button
            type="button"
            class="rounded-full py-2 text-sm font-semibold transition-colors"
            :class="mode === 'login' ? 'bg-razz-500 text-ink-900' : 'text-slate-300'"
            @click="switchMode('login')"
          >
            Log in
          </button>
          <button
            type="button"
            class="rounded-full py-2 text-sm font-semibold transition-colors"
            :class="mode === 'signup' ? 'bg-razz-500 text-ink-900' : 'text-slate-300'"
            @click="switchMode('signup')"
          >
            Sign up
          </button>
        </div>

        <!-- Social sign-in -->
        <div class="mt-6">
          <button
            type="button"
            class="btn-secondary w-full"
            :disabled="submitting"
            @click="handleGoogle"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <!-- Divider -->
        <div class="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500">
          <span class="h-px flex-1 bg-white/10"></span>
          or use email
          <span class="h-px flex-1 bg-white/10"></span>
        </div>

        <form class="grid gap-5" novalidate @submit.prevent="handleSubmit">
          <div v-if="mode === 'signup'">
            <label for="name" class="mb-2 block text-sm font-semibold text-white">
              Name <span class="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              name="name"
              autocomplete="name"
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-razz-400"
              placeholder="Your name"
            />
          </div>

          <div>
            <label for="auth-email" class="mb-2 block text-sm font-semibold text-white">
              Email address <span class="text-razz-400">*</span>
            </label>
            <input
              id="auth-email"
              v-model="form.email"
              type="email"
              name="email"
              autocomplete="email"
              required
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-razz-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label for="auth-password" class="mb-2 block text-sm font-semibold text-white">
              Password <span class="text-razz-400">*</span>
            </label>
            <input
              id="auth-password"
              v-model="form.password"
              type="password"
              name="password"
              :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
              required
              minlength="6"
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-razz-400"
              placeholder="••••••••"
            />
          </div>

          <p
            v-if="errorMsg"
            class="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {{ errorMsg }}
          </p>

          <button type="submit" class="btn-primary w-full" :disabled="submitting">
            {{
              submitting
                ? 'Please wait…'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Log in'
            }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
