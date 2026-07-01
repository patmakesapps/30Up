<script setup lang="ts">
// Product image picker for the admin form. Uploads chosen files straight to
// Firebase Storage (admin-only per storage.rules) and manages the ordered list
// of download URLs via v-model. images[0] is the storefront's primary image.
import { ref } from 'vue'
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { storage } from '../../firebase'

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const MAX_BYTES = 5 * 1024 * 1024

interface Upload {
  id: string
  name: string
  progress: number
  error: string | null
}

const uploads = ref<Upload[]>([])
const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function setImages(next: string[]) {
  emit('update:modelValue', next)
}

function pick() {
  fileInput.value?.click()
}

function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) handleFiles(target.files)
  target.value = '' // allow re-selecting the same file
}

function onDrop(e: DragEvent) {
  dragging.value = false
  if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files)
}

function handleFiles(fileList: FileList) {
  for (const file of Array.from(fileList)) {
    if (!file.type.startsWith('image/')) {
      addFailed(file.name, 'Not an image file.')
      continue
    }
    if (file.size > MAX_BYTES) {
      addFailed(file.name, 'Larger than 5 MB.')
      continue
    }
    uploadOne(file)
  }
}

function addFailed(name: string, error: string) {
  uploads.value.push({ id: `${name}-${uploads.value.length}`, name, progress: 0, error })
}

function uploadOne(file: File) {
  // Unique, storage-safe path under products/.
  const rand = Math.random().toString(36).slice(2, 8)
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `products/${Date.now()}_${rand}_${safe}`

  const entry: Upload = { id: path, name: file.name, progress: 0, error: null }
  uploads.value.push(entry)

  const task = uploadBytesResumable(storageRef(storage, path), file, {
    contentType: file.type,
  })

  task.on(
    'state_changed',
    (snap) => {
      entry.progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
    },
    (err) => {
      entry.error = err.code === 'storage/unauthorized' ? 'Not authorized.' : 'Upload failed.'
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref)
      setImages([...props.modelValue, url])
      // Drop the finished progress row.
      uploads.value = uploads.value.filter((u) => u.id !== entry.id)
    },
  )
}

function removeImage(url: string) {
  setImages(props.modelValue.filter((u) => u !== url))
}

function makePrimary(url: string) {
  setImages([url, ...props.modelValue.filter((u) => u !== url)])
}

function dismissError(id: string) {
  uploads.value = uploads.value.filter((u) => u.id !== id)
}
</script>

<template>
  <div>
    <!-- Thumbnails of already-uploaded images -->
    <div v-if="modelValue.length" class="mb-3 grid grid-cols-3 gap-3">
      <div
        v-for="(url, i) in modelValue"
        :key="url"
        class="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5"
      >
        <img :src="url" alt="" class="h-full w-full object-cover" />

        <!-- Primary badge -->
        <span
          v-if="i === 0"
          class="absolute left-1.5 top-1.5 rounded-md bg-razz-500 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white"
        >
          Primary
        </span>

        <!-- Hover controls -->
        <div
          class="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <button
            v-if="i !== 0"
            type="button"
            class="rounded-md bg-white/15 px-1.5 py-0.5 text-[0.65rem] font-medium text-white hover:bg-white/25"
            @click="makePrimary(url)"
          >
            Make primary
          </button>
          <span v-else></span>
          <button
            type="button"
            class="rounded-md bg-red-500/80 px-1.5 py-0.5 text-[0.65rem] font-medium text-white hover:bg-red-500"
            @click="removeImage(url)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- In-progress / failed uploads -->
    <div v-if="uploads.length" class="mb-3 space-y-2">
      <div
        v-for="u in uploads"
        :key="u.id"
        class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
      >
        <div class="flex items-center justify-between">
          <span class="truncate text-slate-300">{{ u.name }}</span>
          <span v-if="u.error" class="text-red-300">{{ u.error }}</span>
          <span v-else class="text-slate-400">{{ u.progress }}%</span>
        </div>
        <div v-if="!u.error" class="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
          <div class="h-full bg-razz-500 transition-all" :style="{ width: u.progress + '%' }"></div>
        </div>
        <button
          v-else
          type="button"
          class="mt-1 text-[0.65rem] text-slate-400 underline hover:text-white"
          @click="dismissError(u.id)"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Drop zone / picker -->
    <button
      type="button"
      class="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors"
      :class="dragging ? 'border-razz-400 bg-razz-500/10' : 'border-white/15 hover:border-white/30'"
      @click="pick"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="text-2xl" aria-hidden="true">🖼️</span>
      <span class="mt-1 text-sm font-medium text-white">Click to upload or drag &amp; drop</span>
      <span class="mt-0.5 text-xs text-slate-500">PNG, JPG, WebP — up to 5 MB each</span>
    </button>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onInputChange"
    />
  </div>
</template>
