<script setup lang="ts">
// Order detail drawer: full order, shipping, items, Stripe link, and the
// fulfillment controls (status, notes, tracking, refund). Every mutation goes
// through a callable that re-checks admin server-side. The order object is
// passed reactively from the live list, so webhook-driven changes (e.g. a
// refund flipping status) appear here without a manual refresh.
import { ref, watch } from 'vue'
import type { OrderDoc } from '../../types/models'
import { formatCents } from '../../utils/money'
import {
  updateOrderStatus,
  addOrderNote,
  setTracking,
  refundOrder,
} from '../../services/adminOrders'

const props = defineProps<{ order: OrderDoc }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled'] as const

// Test-mode dashboard link; swap /test/ out at go-live for live payments.
const stripeBase = 'https://dashboard.stripe.com/test/payments/'

const savingStatus = ref(false)
const noteText = ref('')
const savingNote = ref(false)
const trackingInput = ref('')
const savingTracking = ref(false)
const refunding = ref(false)
const actionError = ref<string | null>(null)

// Keep the tracking input in sync when a different order is opened.
watch(
  () => props.order.id,
  () => {
    trackingInput.value = props.order.trackingNumber ?? ''
    noteText.value = ''
    actionError.value = null
  },
  { immediate: true },
)

function fmtDate(ts: any): string {
  try {
    return ts?.toDate ? ts.toDate().toLocaleString() : ''
  } catch {
    return ''
  }
}

async function onStatusChange(e: Event) {
  const status = (e.target as HTMLSelectElement).value as (typeof STATUS_OPTIONS)[number]
  savingStatus.value = true
  actionError.value = null
  try {
    await updateOrderStatus({ orderId: props.order.id, status })
  } catch (err: any) {
    actionError.value = err?.message || 'Could not update status.'
  } finally {
    savingStatus.value = false
  }
}

async function submitNote() {
  if (!noteText.value.trim() || savingNote.value) return
  savingNote.value = true
  actionError.value = null
  try {
    await addOrderNote({ orderId: props.order.id, text: noteText.value.trim() })
    noteText.value = ''
  } catch (err: any) {
    actionError.value = err?.message || 'Could not add note.'
  } finally {
    savingNote.value = false
  }
}

async function saveTracking() {
  if (!trackingInput.value.trim() || savingTracking.value) return
  savingTracking.value = true
  actionError.value = null
  try {
    await setTracking({ orderId: props.order.id, trackingNumber: trackingInput.value.trim() })
  } catch (err: any) {
    actionError.value = err?.message || 'Could not save tracking.'
  } finally {
    savingTracking.value = false
  }
}

async function doRefund() {
  if (refunding.value) return
  if (!window.confirm('Refund this order in full? This cannot be undone.')) return
  refunding.value = true
  actionError.value = null
  try {
    await refundOrder({ orderId: props.order.id })
    // Status flips to 'refunded' when the charge.refunded webhook arrives.
  } catch (err: any) {
    actionError.value = err?.message || 'Refund failed.'
  } finally {
    refunding.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex justify-end bg-black/60"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div class="flex h-full w-full max-w-xl flex-col bg-ink-800 shadow-xl">
      <!-- Header -->
      <header class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 class="text-lg font-bold text-white">Order</h2>
          <p class="font-mono text-xs text-slate-400">{{ order.id }}</p>
        </div>
        <button
          type="button"
          class="rounded-lg p-1 text-slate-400 hover:text-white"
          aria-label="Close"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>

      <div class="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <!-- Summary -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-400">Placed</p>
            <p class="text-white">{{ fmtDate(order.createdAt) }}</p>
          </div>
          <div>
            <p class="text-slate-400">Total</p>
            <p class="text-white">{{ formatCents(order.amountTotalCents, order.currency) }}</p>
          </div>
          <div>
            <p class="text-slate-400">Customer</p>
            <p class="text-white">{{ order.customerName || '—' }}</p>
            <p class="text-slate-300">{{ order.customerEmail }}</p>
          </div>
          <div>
            <p class="text-slate-400">Status</p>
            <span
              class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
              :class="
                order.status === 'refunded'
                  ? 'bg-amber-400/15 text-amber-300'
                  : order.status === 'cancelled'
                    ? 'bg-slate-400/15 text-slate-400'
                    : 'bg-emerald-400/15 text-emerald-300'
              "
            >
              {{ order.status }}
            </span>
          </div>
        </div>

        <!-- Shipping -->
        <div>
          <h3 class="text-sm font-semibold text-white">Shipping address</h3>
          <address class="mt-1 text-sm not-italic text-slate-300">
            <div>{{ order.shippingAddress.line1 }}</div>
            <div v-if="order.shippingAddress.line2">{{ order.shippingAddress.line2 }}</div>
            <div>
              {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }}
              {{ order.shippingAddress.postalCode }}
            </div>
            <div>{{ order.shippingAddress.country }}</div>
          </address>
        </div>

        <!-- Items -->
        <div>
          <h3 class="text-sm font-semibold text-white">Items</h3>
          <ul class="mt-2 divide-y divide-white/10 border-y border-white/10">
            <li v-for="(it, i) in order.items" :key="i" class="flex justify-between py-2 text-sm">
              <span class="text-slate-200">{{ it.name }} × {{ it.qty }}</span>
              <span class="text-white">{{ formatCents(it.unitPriceCents * it.qty) }}</span>
            </li>
          </ul>
        </div>

        <!-- Stripe link -->
        <div v-if="order.stripePaymentIntentId">
          <a
            :href="stripeBase + order.stripePaymentIntentId"
            target="_blank"
            rel="noopener"
            class="text-sm text-razz-400 underline hover:text-razz-300"
          >
            View payment in Stripe ↗
          </a>
        </div>

        <p
          v-if="actionError"
          class="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {{ actionError }}
        </p>

        <hr class="border-white/10" />

        <!-- Controls -->
        <div class="space-y-5">
          <!-- Status -->
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-white">Status</label>
            <select
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-2.5 text-white focus:border-razz-400 disabled:opacity-50"
              :value="STATUS_OPTIONS.includes(order.status as any) ? order.status : ''"
              :disabled="savingStatus || order.status === 'refunded'"
              @change="onStatusChange"
            >
              <option value="" disabled>
                {{ order.status }} — choose new…
              </option>
              <option v-for="s in STATUS_OPTIONS" :key="s" :value="s" class="capitalize">
                {{ s }}
              </option>
            </select>
          </div>

          <!-- Tracking -->
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-white">Tracking number</label>
            <div class="flex gap-2">
              <input
                v-model="trackingInput"
                type="text"
                class="flex-1 rounded-xl border border-white/15 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-razz-400"
                placeholder="1Z…"
              />
              <button
                type="button"
                class="btn-secondary"
                :disabled="savingTracking || !trackingInput.trim()"
                @click="saveTracking"
              >
                {{ savingTracking ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-white">Notes</label>
            <ul v-if="order.notes?.length" class="mb-2 space-y-2">
              <li
                v-for="(n, i) in order.notes"
                :key="i"
                class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <p class="text-slate-200">{{ n.text }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ fmtDate(n.at) }}</p>
              </li>
            </ul>
            <div class="flex gap-2">
              <input
                v-model="noteText"
                type="text"
                class="flex-1 rounded-xl border border-white/15 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-razz-400"
                placeholder="Add an internal note…"
                @keyup.enter="submitNote"
              />
              <button
                type="button"
                class="btn-secondary"
                :disabled="savingNote || !noteText.trim()"
                @click="submitNote"
              >
                {{ savingNote ? 'Adding…' : 'Add' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Refund footer -->
      <footer class="border-t border-white/10 px-6 py-4">
        <button
          type="button"
          class="w-full rounded-xl border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-400/10 disabled:opacity-50"
          :disabled="refunding || order.status === 'refunded' || !order.stripePaymentIntentId"
          @click="doRefund"
        >
          {{
            order.status === 'refunded'
              ? 'Refunded'
              : refunding
                ? 'Refunding…'
                : 'Refund order'
          }}
        </button>
        <p class="mt-2 text-center text-xs text-slate-500">
          Refunds are issued via Stripe; status flips to “refunded” when Stripe confirms.
        </p>
      </footer>
    </div>
  </div>
</template>
