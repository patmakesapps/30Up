import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import HomeView from '../views/HomeView.vue'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      meta: { hideForAuthed: true },
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue'),
      meta: { requiresAuth: true },
    },
    // Unknown routes fall back to home.
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // Scroll to #hash targets (used by the header section links) and to top otherwise.
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// Wait until Firebase has reported the initial auth state before deciding.
function whenAuthReady(): Promise<void> {
  const { authReady } = useAuth()
  if (authReady.value) return Promise.resolve()
  return new Promise((resolve) => {
    const stop = watch(authReady, (ready) => {
      if (ready) {
        stop()
        resolve()
      }
    })
  })
}

router.beforeEach(async (to) => {
  await whenAuthReady()
  const { user } = useAuth()

  // Protect account routes.
  if (to.meta.requiresAuth && !user.value) {
    return { name: 'auth', query: { redirect: to.fullPath } }
  }

  // Keep signed-in users out of the login page.
  if (to.meta.hideForAuthed && user.value) {
    return { name: 'account' }
  }

  return true
})

export default router
