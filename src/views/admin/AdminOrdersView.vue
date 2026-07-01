<script setup lang="ts">
// Orders admin — real-time table with status/customer filtering and sorting.
// Reads Firestore directly (admins only, per firestore.rules). Row opens the
// detail drawer; all mutations there go through admin-checked callables.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import type { OrderDoc, OrderStatus } from '../../types/models'
import { formatCents } from '../../utils/money'
import OrderDetailDrawer from '../../components/admin/OrderDetailDrawer.vue'

const orders = ref<OrderDoc[]>([])
const loading = ref(true)
const listError = ref<string | null>(null)

const statusFilter = ref<'all' | OrderStatus>('all')
const search = ref('')
const sortBy = ref<'date' | 'total' | 'customer'>('date')

const selectedId = ref<string | null>(null)

const STATUS_FILTERS: Array<'all' | OrderStatus> = [
  'all',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

let unsub: (() => void) | null = null

onMounted(() => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  unsub = onSnapshot(
    q,
    (snap) => {
      orders.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as OrderDoc)
      loading.value = false
    },
    (err) => {
      listError.value = err.message
      loading.value = false
    },
  )
})
onUnmounted(() => unsub?.())

const filtered = computed(() => {
  let list = orders.value
  if (statusFilter.value !== 'all') {
    list = list.filter((o) => o.status === statusFilter.value)
  }
  const term = search.value.trim().toLowerCase()
  if (term) {
    list = list.filter(
      (o) =>
        o.customerEmail?.toLowerCase().includes(term) ||
        o.customerName?.toLowerCase().includes(term) ||
        o.id.toLowerCase().includes(term),
    )
  }
  const sorted = [...list]
  if (sortBy.value === 'total') {
    sorted.sort((a, b) => b.amountTotalCents - a.amountTotalCents)
  } else if (sortBy.value === 'customer') {
    sorted.sort((a, b) => (a.customerName || '').localeCompare(b.customerName || ''))
  }
  // 'date' keeps the query's createdAt desc order.
  return sorted
})

// Reactive lookup so the open drawer reflects live updates (e.g. refund status).
const selectedOrder = computed(
  () => orders.value.find((o) => o.id === selectedId.value) ?? null,
)

function fmtDate(ts: any): string {
  try {
    return ts?.toDate ? ts.toDate().toLocaleDateString() : ''
  } catch {
    return ''
  }
}

function statusClass(status: OrderStatus): string {
  if (status === 'refunded') return 'bg-amber-400/15 text-amber-300'
  if (status === 'cancelled') return 'bg-slate-400/15 text-slate-400'
  if (status === 'delivered') return 'bg-emerald-400/15 text-emerald-300'
  return 'bg-sky-400/15 text-sky-300'
}
</script>

<template>
  <section>
    <h1 class="text-2xl font-bold text-white">Orders</h1>
    <p class="mt-1 text-sm text-slate-400">
      {{ filtered.length }} of {{ orders.length }} order{{ orders.length === 1 ? '' : 's' }}
    </p>

    <!-- Filters -->
    <div class="mt-5 flex flex-wrap items-center gap-3">
      <select
        v-model="statusFilter"
        class="rounded-lg border border-white/15 bg-ink-900/60 px-3 py-2 text-sm text-white focus:border-razz-400"
      >
        <option v-for="s in STATUS_FILTERS" :key="s" :value="s" class="capitalize">
          {{ s === 'all' ? 'All statuses' : s }}
        </option>
      </select>
      <select
        v-model="sortBy"
        class="rounded-lg border border-white/15 bg-ink-900/60 px-3 py-2 text-sm text-white focus:border-razz-400"
      >
        <option value="date">Newest first</option>
        <option value="total">Highest total</option>
        <option value="customer">Customer A–Z</option>
      </select>
      <input
        v-model="search"
        type="search"
        placeholder="Search email, name, or order id…"
        class="min-w-[16rem] flex-1 rounded-lg border border-white/15 bg-ink-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-razz-400"
      />
    </div>

    <p v-if="loading" class="mt-10 text-slate-400">Loading orders…</p>
    <p
      v-else-if="listError"
      class="mt-10 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
    >
      {{ listError }}
    </p>

    <div
      v-else-if="orders.length === 0"
      class="mt-10 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-slate-400"
    >
      No orders yet. They appear here automatically when the Stripe webhook
      records a paid checkout.
    </div>

    <div v-else class="mt-6 overflow-x-auto rounded-2xl border border-white/10">
      <table class="w-full text-left text-sm">
        <thead
          class="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400"
        >
          <tr>
            <th class="px-4 py-3 font-semibold">Date</th>
            <th class="px-4 py-3 font-semibold">Customer</th>
            <th class="px-4 py-3 font-semibold">Total</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold">Tracking</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr
            v-for="o in filtered"
            :key="o.id"
            class="cursor-pointer hover:bg-white/5"
            @click="selectedId = o.id"
          >
            <td class="px-4 py-3 text-slate-300">{{ fmtDate(o.createdAt) }}</td>
            <td class="px-4 py-3">
              <div class="font-medium text-white">{{ o.customerName || '—' }}</div>
              <div class="text-xs text-slate-400">{{ o.customerEmail }}</div>
            </td>
            <td class="px-4 py-3 text-slate-200">
              {{ formatCents(o.amountTotalCents, o.currency) }}
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                :class="statusClass(o.status)"
              >
                {{ o.status }}
              </span>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-slate-400">
              {{ o.trackingNumber || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <OrderDetailDrawer
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedId = null"
    />
  </section>
</template>
