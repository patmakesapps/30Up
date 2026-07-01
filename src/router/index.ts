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
    // Storefront + checkout (public; checkout does not require an account).
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShopView.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue'),
    },
    {
      path: '/checkout/return',
      name: 'checkout-return',
      component: () => import('../views/CheckoutReturnView.vue'),
    },
    // Admin area — guarded by requiresAdmin (auth + admin custom claim).
    // `meta.admin` tells App.vue to drop the storefront header/footer chrome.
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true, admin: true },
      children: [
        { path: '', redirect: { name: 'admin-products' } },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('../views/admin/AdminProductsView.vue'),
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('../views/admin/AdminOrdersView.vue'),
        },
      ],
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
  const { user, isAdmin } = useAuth()

  // Protect account routes.
  if (to.meta.requiresAuth && !user.value) {
    return { name: 'auth', query: { redirect: to.fullPath } }
  }

  // Protect the admin area: must be signed in AND carry the admin claim.
  // The claim is verified from the Firebase ID token (resolved before
  // authReady flips), and re-checked server-side on every write.
  if (to.meta.requiresAdmin) {
    if (!user.value) {
      return { name: 'auth', query: { redirect: to.fullPath } }
    }
    if (!isAdmin.value) {
      // Signed in but not an admin — send them to their account, not the login.
      return { name: 'account' }
    }
  }

  // Keep signed-in users out of the login page.
  if (to.meta.hideForAuthed && user.value) {
    return { name: 'account' }
  }

  return true
})

export default router
