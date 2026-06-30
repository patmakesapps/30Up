<script setup lang="ts">
/**
 * BaseSelect — a custom, accessible dropdown (ARIA listbox pattern).
 *
 * Replaces the native <select> so we can fully style it to match the brand.
 * Keyboard support: Up/Down to move, Home/End to jump, Enter/Space to select,
 * Esc to close, type-ahead by first letter. Closes on outside click / blur.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  options: string[]
  id: string
  placeholder?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const open = ref(false)
const activeIndex = ref(-1)
const rootEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLUListElement | null>(null)

const buttonLabel = computed(() => props.modelValue || props.placeholder || 'Select…')
const hasValue = computed(() => !!props.modelValue)

function openMenu() {
  if (open.value) return
  open.value = true
  // Highlight the current value, or the first option.
  activeIndex.value = Math.max(0, props.options.indexOf(props.modelValue))
  nextTick(scrollActiveIntoView)
}

function closeMenu() {
  open.value = false
  activeIndex.value = -1
}

function toggle() {
  open.value ? closeMenu() : openMenu()
}

function select(index: number) {
  const value = props.options[index]
  if (value === undefined) return
  emit('update:modelValue', value)
  closeMenu()
}

function move(delta: number) {
  if (!open.value) {
    openMenu()
    return
  }
  const count = props.options.length
  activeIndex.value = (activeIndex.value + delta + count) % count
  scrollActiveIntoView()
}

function scrollActiveIntoView() {
  const el = listEl.value?.children[activeIndex.value] as HTMLElement | undefined
  el?.scrollIntoView({ block: 'nearest' })
}

// Type-ahead: jump to the next option starting with the typed letter.
let typeBuffer = ''
let typeTimer: ReturnType<typeof setTimeout> | null = null
function onKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      move(-1)
      break
    case 'Home':
      if (open.value) {
        e.preventDefault()
        activeIndex.value = 0
        scrollActiveIntoView()
      }
      break
    case 'End':
      if (open.value) {
        e.preventDefault()
        activeIndex.value = props.options.length - 1
        scrollActiveIntoView()
      }
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      open.value ? select(activeIndex.value) : openMenu()
      break
    case 'Escape':
      if (open.value) {
        e.preventDefault()
        closeMenu()
      }
      break
    case 'Tab':
      closeMenu()
      break
    default:
      if (e.key.length === 1 && /\S/.test(e.key)) {
        typeBuffer += e.key.toLowerCase()
        if (typeTimer) clearTimeout(typeTimer)
        typeTimer = setTimeout(() => (typeBuffer = ''), 500)
        const match = props.options.findIndex((o) =>
          o.toLowerCase().startsWith(typeBuffer),
        )
        if (match >= 0) {
          if (!open.value) openMenu()
          activeIndex.value = match
          scrollActiveIntoView()
        }
      }
  }
}

function onDocClick(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) closeMenu()
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('click', onDocClick)
  else document.removeEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  if (typeTimer) clearTimeout(typeTimer)
})
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      :id="id"
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-ink-900/60 px-4 py-3 text-left transition-colors hover:border-white/25 focus:border-razz-400"
      :class="hasValue ? 'text-white' : 'text-slate-500'"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${id}-listbox`"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span class="truncate">{{ buttonLabel }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 shrink-0 text-razz-400 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <ul
        v-if="open"
        :id="`${id}-listbox`"
        ref="listEl"
        role="listbox"
        :aria-activedescendant="activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined"
        tabindex="-1"
        class="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-ink-700 p-1 shadow-card backdrop-blur-md"
      >
        <li
          v-for="(option, index) in options"
          :id="`${id}-opt-${index}`"
          :key="option"
          role="option"
          :aria-selected="option === modelValue"
          class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors"
          :class="[
            index === activeIndex ? 'bg-razz-500/20 text-white' : 'text-slate-200',
            option === modelValue ? 'font-semibold' : '',
          ]"
          @click="select(index)"
          @mousemove="activeIndex = index"
        >
          <span>{{ option }}</span>
          <svg
            v-if="option === modelValue"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-razz-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
          </svg>
        </li>
      </ul>
    </transition>
  </div>
</template>
