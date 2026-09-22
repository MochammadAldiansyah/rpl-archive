import { onBeforeUnmount, onMounted } from 'vue'

import { initLenis } from '@/composables/useLenis'

/**
 * Scroll-scrubbed parallax, built on the Lenis instance the app already
 * owns.
 *
 * ── Why there is no animation library here ──────────────────────────
 *
 * The usual approach is GSAP + ScrollTrigger. This project does not need
 * them, and pulling them in would cost more than it gives:
 *
 *   • ~70KB of JS for one effect that is ~40 lines of arithmetic.
 *   • A SECOND animation loop. Lenis already runs a requestAnimationFrame
 *     loop that updates scroll position every frame; GSAP's ticker would
 *     be a competing loop driving the same pixels.
 *   • A second scroll listener fighting the router, the navbar and the
 *     student modal, all of which already talk to the same Lenis.
 *
 * Instead we hook the scroll event Lenis already emits.
 *
 * ── How the motion works ────────────────────────────────────────────
 *
 * For each layer we compute one progress value, 0 → 1, describing how far
 * the container has travelled from "its top at the viewport top" to "its
 * bottom at the viewport top". Every layer then moves DOWN by `yPercent`
 * of its own height, scaled by that progress.
 *
 * A layer that moves down more therefore appears to scroll up more
 * slowly, which is what the eye reads as being farther away.
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 *   The element that defines the scroll range (the hero stage).
 * @param {{layer: string, yPercent: number}[]} layers
 *   `layer` matches `data-parallax-layer="<id>"` in the template.
 *   `yPercent` is a percentage of that element's OWN height.
 */
export function useParallax(containerRef, layers) {
  /** Layers with their per-unit offsets, rebuilt by measure(). */
  let targets = []
  let containerTop = 0
  let containerHeight = 0

  let lenis = null
  /** Set when we fall back to the native scroll event. */
  let usesNativeScroll = false

  let resizeObserver = null
  /** Pending frame from a resize, so bursts collapse into one write. */
  let measureFrame = null

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /**
   * Cache every layout value we need.
   *
   * Reading `offsetHeight` / `getBoundingClientRect()` forces the browser
   * to flush pending layout. Doing that inside a scroll handler would
   * thrash layout on every frame, so it happens only here — on mount and
   * whenever the container actually changes size.
   */
  const measure = () => {
    const root = containerRef.value
    if (!root) return

    const rect = root.getBoundingClientRect()
    containerTop = rect.top + window.scrollY
    containerHeight = rect.height

    /*
      offsetHeight is read once per element here, never per frame.
      `yPercent` is a share of the element's own height, so the distance
      to travel is precomputed as pixels.
    */
    targets = layers.flatMap(({ layer, yPercent }) =>
      Array.from(root.querySelectorAll(`[data-parallax-layer="${layer}"]`)).map(
        (el) => ({ el, travel: (yPercent / 100) * el.offsetHeight }),
      ),
    )
  }

  /**
   * Apply this frame's transform.
   *
   * Deliberately cheap and read-free: it only writes a style, using
   * values already cached by measure(). No layout reads means no risk of
   * forcing a synchronous reflow mid-scroll.
   *
   * `translate3d` rather than `translateY` keeps each layer on its own
   * compositor layer, which is what lets four simultaneous transforms
   * stay on the GPU instead of repainting.
   */
  const apply = () => {
    if (!containerHeight || !targets.length) return

    // Clamp to 0..1 so layers hold still before the stage reaches the top
    // and after it has fully passed — no snapping at either end.
    const travelled = window.scrollY - containerTop
    const progress = Math.min(Math.max(travelled / containerHeight, 0), 1)

    for (const { el, travel } of targets) {
      el.style.transform = `translate3d(0, ${progress * travel}px, 0)`
    }
  }

  /**
   * Called on every scroll event.
   *
   * No requestAnimationFrame hop here on purpose: Lenis dispatches this
   * from inside its own rAF loop, so we are already in the frame and the
   * style write lands before paint. Deferring to another rAF would add a
   * frame of lag for nothing.
   */
  const onScroll = () => apply()

  /**
   * Re-measure and re-apply, coalesced to one pass per frame.
   *
   * Coalescing matters here because a drag-resize fires dozens of events
   * a second and each pass re-reads layout.
   */
  const remeasure = () => {
    if (measureFrame !== null) return
    measureFrame = requestAnimationFrame(() => {
      measureFrame = null
      measure()
      apply()
    })
  }

  /** `load` fires at most once, so a named handler keeps removal simple. */
  const onLoad = () => {
    measure()
    apply()
  }

  onMounted(() => {
    const root = containerRef.value
    if (!root || !layers?.length) return

    // Honour the OS setting by leaving every layer at rest, rather than
    // running a shortened version of the motion.
    if (prefersReducedMotion()) return

    /*
      Prefer the shared Lenis instance. Fall back to the native scroll
      event if it is unavailable — which happens when another module has
      not initialised it yet, or when the OS asks for reduced motion and
      initLenis() therefore declines to create one.

      Without this fallback the parallax would silently never run.
    */
    lenis = initLenis()

    if (lenis) {
      lenis.on('scroll', onScroll)
    } else {
      usesNativeScroll = true
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    /*
      ── Why ResizeObserver instead of a window resize listener ────────

      A window listener only fires when the window itself changes size,
      and misses every other way this section can change height:

        • the preloader locking scroll with `overflow: hidden`, which
          removes the scrollbar and widens the viewport by ~15px
        • fonts swapping in and reflowing the headline
        • the hero photo decoding and taking its final aspect ratio
        • a mobile browser collapsing its address bar

      In all of those the container's own box changes, so observing the
      box is both more accurate and simpler than guessing which global
      events to listen to.

      This cannot feed back into itself: the parallax only writes
      `transform`, and transforms do not affect layout size, so the
      observer will not re-fire from our own writes.
    */
    resizeObserver = new ResizeObserver(remeasure)
    resizeObserver.observe(root)

    measure()
    apply()

    // `load` fires at most once; `once: true` keeps cleanup trivial.
    if (document.readyState !== 'complete') {
      window.addEventListener('load', onLoad, { once: true })
    }
  })

  onBeforeUnmount(() => {
    /*
      Detach from the shared Lenis rather than destroying it — the
      router, navbar and student modal are all still using it.
    */
    if (lenis) lenis.off('scroll', onScroll)
    if (usesNativeScroll) window.removeEventListener('scroll', onScroll)
    lenis = null
    usesNativeScroll = false

    resizeObserver?.disconnect()
    resizeObserver = null

    window.removeEventListener('load', onLoad)

    if (measureFrame !== null) {
      cancelAnimationFrame(measureFrame)
      measureFrame = null
    }

    /*
      Clear the inline transforms so a remount starts from the position
      the stylesheet describes, instead of inheriting a stale offset.
    */
    for (const { el } of targets) {
      el.style.transform = ''
    }
    targets = []
  })
}
