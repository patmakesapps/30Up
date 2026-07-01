<script setup lang="ts">
// Split-screen checkout. LEFT: editable order summary (qty +/- and remove),
// clamped to available stock. RIGHT: Stripe Embedded Checkout mounted into a
// plain div — the buyer never leaves 30up.
//
// Editing the cart recreates the Stripe session (line items are fixed once a
// session is created), debounced so rapid clicks collapse into one rebuild.
// Left-side totals are display-only; authoritative pricing happens server-side.
// NO order is created here.
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCart } from '../composables/useCart'
import { createCheckoutSession, getStripe } from '../services/checkout'
import { formatCents } from '../utils/money'
import type { StripeEmbeddedCheckout } from '@stripe/stripe-js'

interface ProductMeta {
  name: string
  image: string | null
  unitPriceCents: number
  inventoryCount: number
}

const router = useRouter()
const { items, setQty, remove } = useCart()

// Product details cached by id so the summary updates instantly on qty changes
// (no per-click Firestore round-trip).
const productCache = ref<Record<string, ProductMeta>>({})

const initializing = ref(true) // first paint
const updating = ref(false) // rebuilding the Stripe session after an edit
const error = ref<string | null>(null)

const checkoutEl = ref<HTMLDivElement | null>(null)
let embedded: StripeEmbeddedCheckout | null = null
let gen = 0 // guards against a stale async mount overwriting a newer one
let debounceTimer: ReturnType<typeof setTimeout> | undefined

// Lines to render = cart items joined with their cached product meta.
const lines = computed(() =>
  items.value
    .map((l) => {
      const meta = productCache.value[l.productId]
      return meta ? { productId: l.productId, qty: l.qty, ...meta } : null
    })
    .filter((l): l is { productId: string; qty: number } & ProductMeta => l !== null),
)

const subtotalCents = computed(() =>
  lines.value.reduce((sum, l) => sum + l.unitPriceCents * l.qty, 0),
)

// Fetch any product ids we haven't cached yet. Also clamps the cart to reality:
// drops sold-out items, and caps quantities at available stock.
async function loadProducts() {
  for (const line of [...items.value]) {
    if (productCache.value[line.productId]) {
      // Re-clamp against the cached stock in case qty was bumped past it.
      const cap = productCache.value[line.productId].inventoryCount
      if (line.qty > cap) setQty(line.productId, cap)
      continue
    }
    const snap = await getDoc(doc(db, 'products', line.productId))
    if (!snap.exists()) {
      remove(line.productId)
      continue
    }
    const p = snap.data() as any
    if (typeof p.inventoryCount !== 'number' || p.inventoryCount <= 0) {
      remove(line.productId) // sold out
      continue
    }
    if (line.qty > p.inventoryCount) setQty(line.productId, p.inventoryCount)
    productCache.value[line.productId] = {
      name: p.name,
      image: p.images?.[0] ?? null,
      unitPriceCents: p.priceCents,
      inventoryCount: p.inventoryCount,
    }
  }
}

function teardown() {
  embedded?.destroy()
  embedded = null
}

// (Re)create the Stripe Embedded Checkout session for the current cart.
async function createSession() {
  const myGen = ++gen
  updating.value = true
  error.value = null
  teardown()
  try {
    if (items.value.length === 0) {
      router.replace('/shop')
      return
    }
    const { data } = await createCheckoutSession({
      cart: items.value,
      origin: window.location.origin,
    })
    if (myGen !== gen) return
    const stripe = await getStripe()
    if (!stripe) throw new Error('Stripe failed to load.')
    if (myGen !== gen) return
    const ec = await stripe.initEmbeddedCheckout({ clientSecret: data.clientSecret })
    if (myGen !== gen) {
      ec.destroy()
      return
    }
    embedded = ec
    if (checkoutEl.value) embedded.mount(checkoutEl.value)
  } catch (err: any) {
    if (myGen === gen) error.value = err?.message || 'Could not start checkout.'
  } finally {
    if (myGen === gen) updating.value = false
  }
}

// --- Cart edit controls ---
function inc(l: { productId: string; qty: number; inventoryCount: number }) {
  if (l.qty < l.inventoryCount) setQty(l.productId, l.qty + 1)
}
function dec(l: { productId: string; qty: number }) {
  setQty(l.productId, l.qty - 1) // useCart removes the line at 0
}
function removeLine(productId: string) {
  remove(productId)
}

onMounted(async () => {
  if (items.value.length === 0) {
    router.replace('/shop')
    return
  }
  await loadProducts()
  if (items.value.length === 0) {
    router.replace('/shop')
    return
  }
  await createSession()
  initializing.value = false
})

// Rebuild the session (debounced) whenever the cart changes after first paint.
watch(
  items,
  () => {
    if (initializing.value) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      if (items.value.length === 0) {
        teardown()
        router.replace('/shop')
        return
      }
      await loadProducts()
      await createSession()
    }, 300)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  teardown()
})
</script>

<template>
  <section class="container-pad py-12">
    <div class="grid gap-10 lg:grid-cols-2">
      <!-- LEFT: editable order summary -->
      <div>
        <RouterLink to="/shop" class="text-sm text-slate-400 hover:text-white">
          ← Back to shop
        </RouterLink>
        <h1 class="mt-3 text-2xl font-bold text-white">Order summary</h1>

        <ul class="mt-6 divide-y divide-white/10 border-y border-white/10">
          <li v-for="line in lines" :key="line.productId" class="flex items-center gap-4 py-4">
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
              <p class="text-sm text-slate-400">{{ formatCents(line.unitPriceCents) }} each</p>

              <!-- Qty stepper + remove -->
              <div class="mt-2 flex items-center gap-3">
                <div class="inline-flex items-center rounded-lg border border-white/15">
                  <button
                    type="button"
                    class="px-2.5 py-1 text-slate-300 hover:text-white disabled:opacity-40"
                    aria-label="Decrease quantity"
                    @click="dec(line)"
                  >
                    −
                  </button>
                  <span class="min-w-[2rem] text-center text-sm text-white">{{ line.qty }}</span>
                  <button
                    type="button"
                    class="px-2.5 py-1 text-slate-300 hover:text-white disabled:opacity-40"
                    aria-label="Increase quantity"
                    :disabled="line.qty >= line.inventoryCount"
                    @click="inc(line)"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  class="text-xs font-medium text-slate-400 hover:text-red-300"
                  @click="removeLine(line.productId)"
                >
                  Remove
                </button>
                <span
                  v-if="line.qty >= line.inventoryCount"
                  class="text-xs text-slate-500"
                >
                  Max stock
                </span>
              </div>
            </div>

            <span class="self-start font-semibold text-white">
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
          <p class="mt-2 text-red-200/80">Adjust your cart on the left, or</p>
          <RouterLink to="/shop" class="font-medium underline">return to shop</RouterLink>.
        </div>

        <p v-else-if="initializing || updating" class="text-slate-400">
          Loading secure checkout…
        </p>

        <!-- Stripe mounts its iframe here. Kept in the DOM (v-show) so remount works. -->
        <div v-show="!error" ref="checkoutEl"></div>
      </div>
    </div>
  </section>
</template>
