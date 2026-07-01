<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import logoMark from '../photos/logo-mark.webp'

// Section links resolve to the home route + hash so they work from any page.
const navLinks = [
  { label: 'Product', hash: '#product' },
  { label: 'Why 30Up', hash: '#why' },
  { label: 'First Batch', hash: '#waitlist' },
  { label: 'FAQ', hash: '#faq' },
]

const { user } = useAuth()
const { count } = useCart()
const mobileOpen = ref(false)

function closeMenu() {
  mobileOpen.value = false
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-white/10 bg-ink-800/80 backdrop-blur-md"
  >
    <nav class="container-pad flex h-16 items-center justify-between" aria-label="Primary">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center" aria-label="30Up home">
        <img :src="logoMark" alt="30Up" class="h-8 w-auto" width="854" height="326" />
      </RouterLink>

      <!-- Desktop nav -->
      <ul class="hidden items-center gap-8 md:flex">
        <li v-for="link in navLinks" :key="link.hash">
          <RouterLink
            :to="{ path: '/', hash: link.hash }"
            class="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>

      <div class="hidden items-center gap-3 md:flex">
        <RouterLink
          to="/shop"
          class="text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          Shop
        </RouterLink>
        <RouterLink
          to="/checkout"
          class="relative text-sm font-medium text-slate-300 transition-colors hover:text-white"
          aria-label="Cart"
        >
          Cart
          <span
            v-if="count > 0"
            class="ml-1 rounded-full bg-razz-500 px-1.5 py-0.5 text-xs font-semibold text-white"
          >
            {{ count }}
          </span>
        </RouterLink>
        <RouterLink
          v-if="user"
          to="/account"
          class="text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          My Account
        </RouterLink>
        <RouterLink
          v-else
          to="/login"
          class="text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          Log in
        </RouterLink>
        <RouterLink :to="{ path: '/', hash: '#waitlist' }" class="btn-primary">
          Join the First Batch
        </RouterLink>
      </div>

      <!-- Mobile toggle -->
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg p-2 text-white md:hidden"
        :aria-expanded="mobileOpen"
        aria-controls="mobile-menu"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="sr-only">Toggle navigation menu</span>
        <svg
          v-if="!mobileOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <!-- Mobile menu -->
    <div v-show="mobileOpen" id="mobile-menu" class="border-t border-white/10 md:hidden">
      <ul class="container-pad flex flex-col gap-1 py-4">
        <li v-for="link in navLinks" :key="link.hash">
          <RouterLink
            :to="{ path: '/', hash: link.hash }"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-200 hover:bg-white/5 hover:text-white"
            @click="closeMenu"
          >
            {{ link.label }}
          </RouterLink>
        </li>
        <li>
          <RouterLink
            :to="user ? '/account' : '/login'"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-200 hover:bg-white/5 hover:text-white"
            @click="closeMenu"
          >
            {{ user ? 'My Account' : 'Log in' }}
          </RouterLink>
        </li>
        <li class="pt-2">
          <RouterLink
            :to="{ path: '/', hash: '#waitlist' }"
            class="btn-primary w-full"
            @click="closeMenu"
          >
            Join the First Batch
          </RouterLink>
        </li>
      </ul>
    </div>
  </header>
</template>
