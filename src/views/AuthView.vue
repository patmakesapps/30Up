<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { signUp, logIn } = useAuth()
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
    default:
      return 'Something went wrong. Please try again.'
  }
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
    // Send them to where they were headed, or the account page.
    const redirect = (route.query.redirect as string) || '/account'
    router.push(redirect)
  } catch (err) {
    const code = (err as { code?: string }).code ?? ''
    errorMsg.value = friendlyError(code)
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

        <form class="mt-6 grid gap-5" novalidate @submit.prevent="handleSubmit">
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
