import { onMounted, onBeforeUnmount, readonly, ref, shallowRef } from 'vue'
import Lenis from 'lenis'

/**
 * Singleton Lenis instance.
 *
 * A single instance is shared app-wide so that the router, anchor links and
 * any component can all drive the same scroll without fighting each other.
 */
const lenis = shallowRef(null)
const isReady = ref(false)

/** Module-scoped RAF handle so teardown can always cancel the loop. */
let frameId = null

/** Cache reduced-motion preference once — it can't change mid-session in practice. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Initialise Lenis and bind it to the render loop.
 * Safe to call from multiple components — the first call wins.
 */
function initLenis() {
  if (lenis.value || typeof window === 'undefined') return lenis.value

  // Respect the OS setting: skip hijacking scroll entirely.
  if (prefersReducedMotion()) {
    isReady.value = true
    return null
  }

  const instance = new Lenis({
    // Defaults, tuned for touch:
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    // Touch devices: native momentum beats JS-driven scroll, so leave it off.
    syncTouch: false,
    touchMultiplier: 1.5,
    wheelMultiplier: 1,
    autoResize: true,
  })

  const raf = (time) => {
    instance.raf(time)
    frameId = requestAnimationFrame(raf)
  }
  frameId = requestAnimationFrame(raf)

  lenis.value = instance
  isReady.value = true
  return instance
}

/** Cancel the RAF loop and tear down the instance. */
function teardown() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
  lenis.value?.destroy()
  lenis.value = null
  isReady.value = false
}

/**
 * Composable wrapper around the shared Lenis instance.
 *
 * @returns {{
 *   lenis: import('vue').ShallowRef<Lenis|null>,
 *   isReady: import('vue').Ref<boolean>,
 *   scrollTo: (target: any, options?: object) => void,
 *   stop: () => void,
 *   start: () => void,
 *   destroy: () => void,
 * }}
 */
export function useLenis() {
  onMounted(() => initLenis())

  const scrollTo = (target, options = {}) => {
    if (!lenis.value) {
      // Reduced-motion / no-JS fallback: jump natively.
      if (typeof target === 'string') {
        document.querySelector(target)?.scrollIntoView()
      }
      return
    }
    lenis.value.scrollTo(target, { offset: -96, duration: 1.2, ...options })
  }

  const stop = () => lenis.value?.stop()
  const start = () => lenis.value?.start()
  const destroy = teardown

  return {
    lenis: readonly(lenis),
    isReady: readonly(isReady),
    scrollTo,
    stop,
    start,
    destroy,
  }
}

/** Exposed for the app-level teardown in App.vue. */
export function destroyLenis() {
  teardown()
}

export { initLenis }
