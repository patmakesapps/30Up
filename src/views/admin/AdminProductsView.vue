<script setup lang="ts">
// Products admin — real-time list + create/edit. The list reads Firestore
// directly (allowed for admins by firestore.rules); all WRITES go through the
// callable Cloud Functions, which re-check the admin claim server-side.
import { onMounted, onUnmounted, ref } from 'vue'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import type { ProductDoc } from '../../types/models'
import { setProductActive } from '../../services/adminProducts'
import { formatCents } from '../../utils/money'
import ProductFormModal from '../../components/admin/ProductFormModal.vue'

const products = ref<ProductDoc[]>([])
const loading = ref(true)
const listError = ref<string | null>(null)

// Modal state: null = closed; { product } where product null = create.
const editing = ref<{ product: ProductDoc | null } | null>(null)
const togglingId = ref<string | null>(null)
const toggleError = ref<string | null>(null)

let unsubscribe: (() => void) | null = null

onMounted(() => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
  unsubscribe = onSnapshot(
    q,
    (snap) => {
      products.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ProductDoc)
      loading.value = false
    },
    (err) => {
      listError.value = err.message
      loading.value = false
    },
  )
})

onUnmounted(() => unsubscribe?.())

function openCreate() {
  editing.value = { product: null }
}
function openEdit(p: ProductDoc) {
  editing.value = { product: p }
}
function closeModal() {
  editing.value = null
}
function onSaved() {
  // onSnapshot will reflect the change in real time; just close.
  editing.value = null
}

async function toggleActive(p: ProductDoc) {
  if (togglingId.value) return
  togglingId.value = p.id
  toggleError.value = null
  try {
    await setProductActive({ id: p.id, active: !p.active })
  } catch (err: any) {
    toggleError.value = err?.message || 'Could not update status.'
  } finally {
    togglingId.value = null
  }
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Products</h1>
        <p class="mt-1 text-sm text-slate-400">
          {{ products.length }} product{{ products.length === 1 ? '' : 's' }}
        </p>
      </div>
      <button type="button" class="btn-primary" @click="openCreate">+ New product</button>
    </div>

    <p
      v-if="toggleError"
      class="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
      role="alert"
    >
      {{ toggleError }}
    </p>

    <!-- Loading -->
    <p v-if="loading" class="mt-10 text-slate-400">Loading products…</p>

    <!-- Error -->
    <p
      v-else-if="listError"
      class="mt-10 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
    >
      {{ listError }}
    </p>

    <!-- Empty -->
    <div
      v-else-if="products.length === 0"
      class="mt-10 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center"
    >
      <p class="font-semibold text-white">No products yet</p>
      <p class="mx-auto mt-1 max-w-sm text-sm text-slate-400">
        Add your first real product to get started. Nothing here is seeded.
      </p>
      <button type="button" class="btn-primary mt-5" @click="openCreate">
        + New product
      </button>
    </div>

    <!-- Table -->
    <div v-else class="mt-6 overflow-x-auto rounded-2xl border border-white/10">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-4 py-3 font-semibold">Product</th>
            <th class="px-4 py-3 font-semibold">SKU</th>
            <th class="px-4 py-3 font-semibold">Price</th>
            <th class="px-4 py-3 font-semibold">Inventory</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="p in products" :key="p.id" class="hover:bg-white/5">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="p.images && p.images.length"
                  :src="p.images[0]"
                  alt=""
                  class="h-10 w-10 rounded-lg object-cover"
                />
                <div
                  v-else
                  class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-500"
                  aria-hidden="true"
                >
                  📦
                </div>
                <span class="font-medium text-white">{{ p.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-slate-300">{{ p.sku }}</td>
            <td class="px-4 py-3 text-slate-200">{{ formatCents(p.priceCents) }}</td>
            <td class="px-4 py-3 text-slate-200">{{ p.inventoryCount }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="
                  p.active
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'bg-slate-400/15 text-slate-400'
                "
              >
                {{ p.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                  :disabled="togglingId === p.id"
                  @click="toggleActive(p)"
                >
                  {{ togglingId === p.id ? '…' : p.active ? 'Deactivate' : 'Activate' }}
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                  @click="openEdit(p)"
                >
                  Edit
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit modal -->
    <ProductFormModal
      v-if="editing"
      :product="editing.product"
      @close="closeModal"
      @saved="onSaved"
    />
  </section>
</template>
