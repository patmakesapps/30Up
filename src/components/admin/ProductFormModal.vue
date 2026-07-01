<script setup lang="ts">
// Create/edit product form, shown as a slide-over modal.
// Passing `product = null` means "create"; otherwise it's an edit of that doc.
import { computed, reactive, ref, watch } from 'vue'
import type { ProductDoc } from '../../types/models'
import {
  createProduct,
  updateProduct,
  type ProductInput,
} from '../../services/adminProducts'
import { dollarsToCents, centsToDollarsInput } from '../../utils/money'
import ProductImageUploader from './ProductImageUploader.vue'

const props = defineProps<{ product: ProductDoc | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const isEdit = computed(() => props.product !== null)

// Form state. Price is a dollars STRING for input; converted to cents on submit.
const form = reactive({
  name: '',
  description: '',
  priceDollars: '',
  sku: '',
  inventoryCount: 0,
  active: true,
  images: [] as string[], // download URLs, images[0] is primary
})

const error = ref<string | null>(null)
const saving = ref(false)

// (Re)initialize the form whenever the target product changes.
watch(
  () => props.product,
  (p) => {
    error.value = null
    form.name = p?.name ?? ''
    form.description = p?.description ?? ''
    form.priceDollars = p ? centsToDollarsInput(p.priceCents) : ''
    form.sku = p?.sku ?? ''
    form.inventoryCount = p?.inventoryCount ?? 0
    form.active = p?.active ?? true
    form.images = p?.images ? [...p.images] : []
  },
  { immediate: true },
)

function buildInput(): ProductInput | null {
  const priceCents = dollarsToCents(form.priceDollars)
  if (priceCents === null) {
    error.value = 'Enter a valid price (e.g. 34.99).'
    return null
  }
  if (!form.name.trim()) {
    error.value = 'Name is required.'
    return null
  }
  if (!form.sku.trim()) {
    error.value = 'SKU is required.'
    return null
  }
  if (!Number.isInteger(form.inventoryCount) || form.inventoryCount < 0) {
    error.value = 'Inventory must be a whole number of 0 or more.'
    return null
  }
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    priceCents,
    sku: form.sku.trim(),
    inventoryCount: form.inventoryCount,
    active: form.active,
    images: form.images,
  }
}

async function handleSubmit() {
  if (saving.value) return
  error.value = null
  const input = buildInput()
  if (!input) return

  saving.value = true
  try {
    if (isEdit.value && props.product) {
      await updateProduct({ id: props.product.id, ...input })
    } else {
      await createProduct(input)
    }
    emit('saved')
  } catch (err: any) {
    // Callable errors surface as { code, message } — show the server message.
    error.value = err?.message || 'Something went wrong saving the product.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex justify-end bg-black/60"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <!-- Panel -->
    <div class="flex h-full w-full max-w-lg flex-col bg-ink-800 shadow-xl">
      <header class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="text-lg font-bold text-white">
          {{ isEdit ? 'Edit product' : 'New product' }}
        </h2>
        <button
          type="button"
          class="rounded-lg p-1 text-slate-400 hover:text-white"
          aria-label="Close"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>

      <form class="flex-1 overflow-y-auto px-6 py-5" @submit.prevent="handleSubmit">
        <div class="grid gap-5">
          <!-- Name -->
          <div>
            <label for="p-name" class="mb-1.5 block text-sm font-semibold text-white">
              Name <span class="text-razz-400">*</span>
            </label>
            <input
              id="p-name"
              v-model="form.name"
              type="text"
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-razz-400"
              placeholder="30Up Blue Razz Lemonade — 20-serving pouch"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="p-desc" class="mb-1.5 block text-sm font-semibold text-white">
              Description
            </label>
            <textarea
              id="p-desc"
              v-model="form.description"
              rows="4"
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-razz-400"
              placeholder="What it is, flavor, caffeine, servings…"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Price -->
            <div>
              <label for="p-price" class="mb-1.5 block text-sm font-semibold text-white">
                Price (USD) <span class="text-razz-400">*</span>
              </label>
              <div class="relative">
                <span class="pointer-events-none absolute left-3 top-2.5 text-slate-400">$</span>
                <input
                  id="p-price"
                  v-model="form.priceDollars"
                  inputmode="decimal"
                  class="w-full rounded-xl border border-white/15 bg-ink-900/60 py-2.5 pl-7 pr-4 text-white placeholder:text-slate-500 focus:border-razz-400"
                  placeholder="34.99"
                />
              </div>
              <p class="mt-1 text-xs text-slate-500">Stored as integer cents.</p>
            </div>

            <!-- SKU -->
            <div>
              <label for="p-sku" class="mb-1.5 block text-sm font-semibold text-white">
                SKU <span class="text-razz-400">*</span>
              </label>
              <input
                id="p-sku"
                v-model="form.sku"
                type="text"
                class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-razz-400"
                placeholder="30UP-BRL-20"
              />
            </div>
          </div>

          <!-- Inventory -->
          <div>
            <label for="p-inv" class="mb-1.5 block text-sm font-semibold text-white">
              Inventory count
            </label>
            <input
              id="p-inv"
              v-model.number="form.inventoryCount"
              type="number"
              min="0"
              step="1"
              class="w-full rounded-xl border border-white/15 bg-ink-900/60 px-4 py-2.5 text-white focus:border-razz-400"
            />
          </div>

          <!-- Images -->
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-white">Images</label>
            <ProductImageUploader v-model="form.images" />
            <p class="mt-1 text-xs text-slate-500">
              The first image is used as the primary storefront photo.
            </p>
          </div>

          <!-- Active toggle -->
          <label class="flex items-center gap-3">
            <input
              v-model="form.active"
              type="checkbox"
              class="h-5 w-5 rounded border-white/20 bg-ink-900 text-razz-500 focus:ring-razz-400"
            />
            <span class="text-sm font-medium text-white">
              Active (visible on the storefront)
            </span>
          </label>

          <!-- Error -->
          <p
            v-if="error"
            class="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {{ error }}
          </p>
        </div>
      </form>

      <footer class="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
        <button type="button" class="btn-secondary" @click="emit('close')">Cancel</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleSubmit">
          {{ saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product' }}
        </button>
      </footer>
    </div>
  </div>
</template>
