<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { user, logOut } = useAuth()
const router = useRouter()

const displayName = computed(
  () => user.value?.displayName || user.value?.email?.split('@')[0] || 'there',
)

async function handleLogout() {
  await logOut()
  router.push('/')
}

// TODO (later): once orders/preorders exist, fetch this user's transactions
// from Firestore, e.g.:
//   const q = query(
//     collection(db, 'orders'),
//     where('uid', '==', user.value.uid),
//     orderBy('createdAt', 'desc'),
//   )
//   const snap = await getDocs(q)
// Then render them in the "Order history" card below in place of the empty state.
</script>

<template>
  <section class="container-pad py-16">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span class="eyebrow">Your account</span>
        <h1 class="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
          Welcome, {{ displayName }}.
        </h1>
        <p class="mt-2 text-slate-400">{{ user?.email }}</p>
      </div>
      <button type="button" class="btn-secondary self-start" @click="handleLogout">
        Log out
      </button>
    </div>

    <div class="mt-10 grid gap-6 lg:grid-cols-3">
      <!-- Profile card -->
      <div class="glass p-7 shadow-card">
        <h2 class="text-lg font-bold text-white">Profile</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div>
            <dt class="text-slate-400">Name</dt>
            <dd class="font-medium text-white">{{ user?.displayName || '—' }}</dd>
          </div>
          <div>
            <dt class="text-slate-400">Email</dt>
            <dd class="font-medium text-white">{{ user?.email }}</dd>
          </div>
        </dl>
      </div>

      <!-- First batch -->
      <div class="glass flex flex-col p-7 shadow-card">
        <h2 class="text-lg font-bold text-white">First batch</h2>
        <p class="mt-4 text-sm text-slate-400">
          Want first dibs? Join the first batch list to vote on product direction
          and get notified when samples or preorders open.
        </p>
        <RouterLink
          :to="{ path: '/', hash: '#waitlist' }"
          class="btn-primary mt-5 self-start"
        >
          Join the First Batch
        </RouterLink>
      </div>

      <!-- Order / transaction history (placeholder for now) -->
      <div class="glass p-7 shadow-card lg:col-span-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-white">Order history</h2>
          <span class="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
            Coming soon
          </span>
        </div>

        <!-- Empty state — replaced by a real transaction list later -->
        <div
          class="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl"
            aria-hidden="true"
          >
            🧾
          </div>
          <p class="mt-4 font-semibold text-white">No orders yet</p>
          <p class="mt-1 max-w-sm text-sm text-slate-400">
            When 30Up launches, your preorders and transaction history will show
            up right here.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
