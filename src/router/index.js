import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import { site } from '@/config/site'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: site.name },
    },
    // Catch-all: this is a single-page class site for now.
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    },
  ],

  /**
   * Lenis owns the scroll position, so we must NOT let the router
   * perform native scrolling. Returning `false` disables the router's
   * built-in scroll handling; `afterEach` below resets Lenis instead.
   */
  scrollBehavior() {
    return false
  },
})

router.afterEach((to) => {
  // Update the document title.
  if (to.meta?.title) {
    document.title = to.meta.title
  }

  // Reset scroll through Lenis so its internal target stays in sync.
  // Imported lazily to avoid a circular import at module-eval time.
  import('@/composables/useLenis').then(({ initLenis }) => {
    const lenis = initLenis()
    lenis?.scrollTo(0, { immediate: true })
  })
})

export default router
