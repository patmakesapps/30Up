<script setup lang="ts">
// Confirmation page. Reads session_id from the URL and asks the server
// (sessionStatus) what happened. This page NEVER creates an order and never
// trusts the redirect as proof of payment — it only displays Stripe's status.
// The actual order is created by the Phase 5 webhook.
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { sessionStatus } from '../services/checkout'
import { useCart } from '../composables/useCart'
import { formatCents } from '../utils/money'

const route = useRoute()
const { clear } = useCart()

const loading = ref(true)
const error = ref<string | null>(null)
const status = ref<string | null>(null)
const paid = ref(false)
const email = ref<string | null>(null)
const amountCents = ref<number | null>(null)

onMounted(async () => {
  const sessionId = route.query.session_id
  if (typeof sessionId !== 'string' || !sessionId) {
    error.value = 'Missing session reference.'
    loading.value = false
    return
  }
  try {
    const { data } = await sessionStatus({ sessionId })
    status.value = data.status
    paid.value = data.status === 'complete' && data.paymentStatus === 'paid'
    email.value = data.customerEmail
    amountCents.value = data.amountTotalCents
    // Payment captured — safe to empty the cart. (Order creation is the
    // webhook's responsibility, not this page's.)
    if (paid.value) clear()
  } catch (err: any) {
    error.value = err?.message || 'Could not load your order status.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="container-pad py-20">
    <div class="mx-auto max-w-xl text-center">
      <p v-if="loading" class="text-slate-400">Confirming your order…</p>

      <div
        v-else-if="error"
        class="glass p-10"
      >
        <p class="text-lg font-semibold text-white">{{ error }}</p>
        <RouterLink to="/shop" class="btn-primary mt-6 inline-block">Back to shop</RouterLink>
      </div>

      <!-- Paid -->
      <div v-else-if="paid" class="glass p-10 shadow-card">
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-razz-500/20 text-razz-400"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <h1 class="mt-5 text-2xl font-bold text-white">Thank you — you're all set.</h1>
        <p class="mt-2 text-slate-300">
          We've received your payment<span v-if="amountCents"> of {{ formatCents(amountCents) }}</span>.
        </p>
        <p v-if="email" class="mt-1 text-sm text-slate-400">
          A confirmation will go to {{ email }}.
        </p>
        <RouterLink to="/shop" class="btn-secondary mt-6 inline-block">Continue shopping</RouterLink>
      </div>

      <!-- Open / expired / other -->
      <div v-else class="glass p-10">
        <h1 class="text-xl font-bold text-white">Your payment isn't complete</h1>
        <p class="mt-2 text-slate-300">
          Status: {{ status ?? 'unknown' }}. If you were charged, your order will
          still be processed — you can safely return to the shop.
        </p>
        <RouterLink to="/checkout" class="btn-primary mt-6 inline-block">Try again</RouterLink>
      </div>
    </div>
  </section>
</template>
