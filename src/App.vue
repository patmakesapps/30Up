<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'

// Admin routes render their own full-screen shell (AdminLayout), so we drop the
// storefront header/footer for anything under /admin.
const route = useRoute()
const isAdminRoute = computed(() => route.meta.admin === true)
</script>

<template>
  <template v-if="isAdminRoute">
    <RouterView />
  </template>
  <template v-else>
    <SiteHeader />
    <main>
      <RouterView />
    </main>
    <SiteFooter />
  </template>
</template>
