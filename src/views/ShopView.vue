<script setup lang="ts">
// Storefront product grid. Reads ONLY active products (firestore.rules enforces
// active == true for public reads; the query mirrors that). Add-to-cart stores
// just { productId, qty } — no prices client-side.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import type { ProductDoc } from '../types/models'
import { useCart } from '../composables/useCart'
import { formatCents } from '../utils/money'

const products = ref<ProductDoc[]>([])
const loading = ref(true)
const { items, add, setQty, count } = useCart()

// Reactive lookup of how many of each product is currently in the cart.
const qtyById = computed(() => {
  const map: Record<string, number> = {}
  for (const l of items.value) map[l.productId] = l.qty
  return map
})

let unsub: (() => void) | null = null

onMounted(() => {
  // No orderBy here so we don't require the composite index for a public read;
  // sort client-side by name instead.
  const q = query(collection(db, 'products'), where('active', '==', true))
  unsub = onSnapshot(q, (snap) => {
    products.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as ProductDoc)
      .sort((a, b) => a.name.localeCompare(b.name))
    loading.value = false
  })
})
onUnmounted(() => unsub?.())

function addToCart(p: ProductDoc) {
  add(p.id, 1)
}
function inc(p: ProductDoc) {
  const current = qtyById.value[p.id] ?? 0
  if (current < p.inventoryCount) setQty(p.id, current + 1)
}
function dec(p: ProductDoc) {
  const current = qtyById.value[p.id] ?? 0
  setQty(p.id, current - 1) // useCart removes the line at 0
}
</script>

<template>
  <section class="container-pad py-16">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span class="eyebrow">Shop</span>
        <h1 class="mt-2 text-3xl font-extrabold text-white sm:text-4xl">30Up</h1>
      </div>
      <RouterLink
        v-if="count > 0"
        to="/checkout"
        class="btn-primary self-start sm:self-auto"
      >
        Checkout ({{ count }})
      </RouterLink>
    </div>

    <p v-if="loading" class="mt-12 text-slate-400">Loading…</p>

    <div
      v-else-if="products.length === 0"
      class="mt-12 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-slate-400"
    >
      No products are available right now. Check back soon.
    </div>

    <div v-else class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="p in products" :key="p.id" class="glass flex flex-col overflow-hidden">
        <div class="aspect-square bg-white/5">
          <img
            v-if="p.images && p.images.length"
            :src="p.images[0]"
            :alt="p.name"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full items-center justify-center text-4xl" aria-hidden="true">
            📦
          </div>
        </div>
        <div class="flex flex-1 flex-col p-5">
          <h2 class="font-bold text-white">{{ p.name }}</h2>
          <p class="mt-1 line-clamp-2 text-sm text-slate-400">{{ p.description }}</p>
          <div class="mt-4 flex items-center justify-between gap-3">
            <span class="text-lg font-semibold text-white">{{ formatCents(p.priceCents) }}</span>

            <!-- Sold out -->
            <button v-if="p.inventoryCount < 1" type="button" class="btn-primary" disabled>
              Sold out
            </button>

            <!-- In cart: qty stepper -->
            <div
              v-else-if="qtyById[p.id]"
              class="inline-flex items-center rounded-lg border border-white/15"
            >
              <button
                type="button"
                class="px-3 py-1.5 text-slate-300 hover:text-white"
                aria-label="Decrease quantity"
                @click="dec(p)"
              >
                −
              </button>
              <span class="min-w-[2rem] text-center text-sm font-medium text-white">
                {{ qtyById[p.id] }}
              </span>
              <button
                type="button"
                class="px-3 py-1.5 text-slate-300 hover:text-white disabled:opacity-40"
                aria-label="Increase quantity"
                :disabled="qtyById[p.id] >= p.inventoryCount"
                @click="inc(p)"
              >
                +
              </button>
            </div>

            <!-- Not in cart -->
            <button v-else type="button" class="btn-primary" @click="addToCart(p)">
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
