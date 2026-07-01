<script setup lang="ts">
// Split-screen checkout. LEFT: our branded order summary (built from Firestore
// product data, display-only). RIGHT: Stripe Embedded Checkout mounted into a
// plain div — the buyer never leaves 30up.
//
// The left-side totals are for display only. Authoritative pricing + tax happen
// server-side (createCheckoutSession) and inside Stripe. NO order is created here.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCart } from '../composables/useCart'
import { createCheckoutSession, getStripe } from '../services/checkout'
import { formatCents } from '../utils/money'
import type { StripeEmbeddedCheckout } from '@stripe/stripe-js'

interface SummaryLine {
  productId: string
  name: string
  image: string | null
  qty: number
  unitPriceCents: number
}

const router = useRouter()
const { items } = useCart()

const summary = ref<SummaryLine[]>([])
const subtotalCents = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)

const checkoutEl = ref<HTMLDivElement | null>(null)
let embedded: StripeEmbeddedCheckout | null = null

async function buildSummary() {
  const lines: SummaryLine[] = []
  for (const line of items.value) {
    const snap = await getDoc(doc(db, 'products', line.productId))
    if (!snap.exists()) continue
    const p = snap.data() as any
    lines.push({
      productId: line.productId,
      name: p.name,
      image: p.images?.[0] ?? null,
      qty: line.qty,
      unitPriceCents: p.priceCents,
    })
  }
  summary.value = lines
  subtotalCents.value = lines.reduce((sum, l) => sum + l.unitPriceCents * l.qty, 0)
}

async function initCheckout() {
  // 1. Ask the server for a session (server prices the cart authoritatively).
  const { data } = await createCheckoutSession({
    cart: items.value,
    origin: window.location.origin,
  })

  // 2. Mount Stripe Embedded Checkout into our div (plain-JS, no React).
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe failed to load.')
  embedded = await stripe.initEmbeddedCheckout({ clientSecret: data.clientSecret })
  if (checkoutEl.value) embedded.mount(checkoutEl.value)
}

onMounted(async () => {
  if (items.value.length === 0) {
    router.replace('/shop')
    return
  }
  try {
    await buildSummary()
    if (summary.value.length === 0) {
      // Every cart item vanished (deleted/inactive) — bail to shop.
      router.replace('/shop')
      return
    }
    await initCheckout()
  } catch (err: any) {
    error.value = err?.message || 'Could not start checkout. Please try again.'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  // Required cleanup for embedded checkout to avoid a leaked iframe.
  embedded?.destroy()
  embedded = null
})
</script>

<template>
  <section class="container-pad py-12">
    <div class="grid gap-10 lg:grid-cols-2">
      <!-- LEFT: branded order summary -->
      <div>
        <RouterLink to="/shop" class="text-sm text-slate-400 hover:text-white">
          ← Back to shop
        </RouterLink>
        <h1 class="mt-3 text-2xl font-bold text-white">Order summary</h1>

        <ul class="mt-6 divide-y divide-white/10 border-y border-white/10">
          <li v-for="line in summary" :key="line.productId" class="flex items-center gap-4 py-4">
            <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
              <img
                v-if="line.image"
                :src="line.image"
                :alt="line.name"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full items-center justify-center text-2xl" aria-hidden="true">
                📦
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-white">{{ line.name }}</p>
              <p class="text-sm text-slate-400">
                {{ formatCents(line.unitPriceCents) }} × {{ line.qty }}
              </p>
            </div>
            <span class="font-semibold text-white">
              {{ formatCents(line.unitPriceCents * line.qty) }}
            </span>
          </li>
        </ul>

        <div class="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>Subtotal</span>
          <span class="text-white">{{ formatCents(subtotalCents) }}</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">
          Shipping &amp; tax are calculated at checkout on the right.
        </p>
      </div>

      <!-- RIGHT: Stripe Embedded Checkout -->
      <div>
        <div
          v-if="error"
          class="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {{ error }}
          <RouterLink to="/shop" class="mt-2 block font-medium underline">
            Return to shop
          </RouterLink>
        </div>

        <p v-else-if="loading" class="text-slate-400">Loading secure checkout…</p>

        <!-- Stripe mounts its iframe here -->
        <div ref="checkoutEl"></div>
      </div>
    </div>
  </section>
</template>
