import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import { site } from '@/config/site'

/**
 * Route table.
 *
 * Home is bundled eagerly because it is the landing page for almost
 * everyone. Every other view is lazy-loaded, so error and thank-you
 * code stays out of the initial bundle.
 *
 * `meta.code` on the error routes selects which copy ErrorView renders
 * (see src/data/errors.js). Adding a code = one route + one entry there.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: site.name },
    },
    {
      path: '/terima-kasih',
      name: 'thank-you',
      component: () => import('@/views/ThankYouView.vue'),
      // Maps the ?nama= query onto the component's `name` prop.
      props: (route) => ({ name: String(route.query.nama ?? '') }),
      meta: { title: 'Terima Kasih' },
    },

    // ---- Error routes ------------------------------------------------
    // Declared before the catch-all so they stay directly reachable.
    {
      path: '/403',
      name: 'error-403',
      component: () => import('@/views/ErrorView.vue'),
      meta: { code: 403, title: 'Akses Ditolak' },
    },
    {
      path: '/500',
      name: 'error-500',
      component: () => import('@/views/ErrorView.vue'),
      meta: { code: 500, title: 'Server Error' },
    },
    {
      path: '/503',
      name: 'error-503',
      component: () => import('@/views/ErrorView.vue'),
      meta: { code: 503, title: 'Sedang Maintenance' },
    },

    /**
     * Catch-all 404.
     *
     * Previously this redirected home, which is actively harmful: search
     * engines see a 200 on a page that does not exist (a soft 404), and
     * a visitor who mistyped a URL is moved somewhere else with no
     * explanation. Rendering a real 404 tells both of them the truth.
     */
    {
      path: '/:pathMatch(.*)*',
      name: 'error-404',
      component: () => import('@/views/ErrorView.vue'),
      meta: { code: 404, title: 'Halaman Tidak Ditemukan' },
    },
  ],

  /**
   * Lenis owns the scroll position, so the router must NOT scroll.
   * Returning `false` disables the built-in behaviour; afterEach below
   * resets Lenis instead.
   */
  scrollBehavior() {
    return false
  },
})

router.afterEach((to, from) => {
  // ---- Document title -------------------------------------------------
  const base = site.name
  document.title = to.meta?.title ? `${to.meta.title} — ${base}` : base

  // ---- Scroll handling ------------------------------------------------
  import('@/composables/useLenis').then(({ initLenis }) => {
    const lenis = initLenis()

    /**
     * Support hash links such as /#anggota. Without this the router
     * would always jump to the top and in-page anchors would appear
     * broken.
     */
    if (to.hash) {
      // `immediate` only on a fresh load — animating feels right when
      // navigating within the app, but a hard jump is correct on load.
      lenis?.scrollTo(to.hash, { offset: -96, immediate: from.name == null })
      return
    }

    lenis?.scrollTo(0, { immediate: true })
  })
})

export default router
