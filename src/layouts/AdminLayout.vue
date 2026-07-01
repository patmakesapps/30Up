<script setup lang="ts">
// Admin shell — sidebar nav + top bar, rendered around all /admin child routes.
// This layout is only ever reached after the router's requiresAdmin guard has
// passed, but note: hiding this UI is NOT the security boundary. Every write
// goes through a Cloud Function that re-verifies the admin claim server-side.
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import logoMark from '../photos/logo-mark.webp'

const { user, logOut } = useAuth()
const router = useRouter()

const navItems = [
  { label: 'Products', to: { name: 'admin-products' }, icon: '📦' },
  { label: 'Orders', to: { name: 'admin-orders' }, icon: '🧾' },
]

async function handleLogout() {
  await logOut()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-ink-900 text-white lg:flex">
    <!-- Sidebar -->
    <aside
      class="border-b border-white/10 bg-ink-800/80 lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r"
    >
      <div class="flex h-16 items-center gap-2 px-5">
        <img :src="logoMark" alt="30Up" class="h-7 w-auto" width="854" height="326" />
        <span class="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold tracking-wide">
          ADMIN
        </span>
      </div>
      <nav class="flex gap-1 px-3 pb-3 lg:flex-col lg:pb-0" aria-label="Admin">
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          <span aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <!-- Main -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Top bar -->
      <header
        class="flex h-16 items-center justify-between gap-4 border-b border-white/10 px-5"
      >
        <RouterLink to="/" class="text-sm text-slate-400 transition-colors hover:text-white">
          ← Back to site
        </RouterLink>
        <div class="flex items-center gap-4">
          <span class="hidden text-sm text-slate-400 sm:inline">{{ user?.email }}</span>
          <button type="button" class="btn-secondary" @click="handleLogout">Log out</button>
        </div>
      </header>

      <!-- Routed admin page -->
      <main class="min-w-0 flex-1 p-5 sm:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
