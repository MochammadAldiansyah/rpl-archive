import { onBeforeUnmount, onMounted, ref } from 'vue'

import { initLenis } from '@/composables/useLenis'

/**
 * Scroll progress for a pinned "unfurling" section.
 *
 * Reports how far the viewport has travelled through a tall container
 * that is pinned with `position: sticky`. Progress runs 0 → 1 from the
 * moment the container's top reaches the viewport top, to the moment its
 * bottom does.
 *
 * ── Why this does not use framer-motion ─────────────────────────────
 * The React original used `useScroll` + `useSpring` + `useTransform` to
 * map progress onto a dozen animated values. None of that is needed
 * here:
 *
 *   • The progress is one division — how far scrolled, over how tall the
 *     container is.
 *   • The smoothing is the same critically damped spring used by
 *     `useKineticScroll`, about ten lines.
 *   • `useTransform`'s job — turning one number into many — is just
 *     arithmetic the component can do inline.
 *
 * A library would also mean a second animation loop competing with the
 * one Lenis already runs.
 *
 * ── Why the loop runs continuously ──────────────────────────────────
 * Not only while scrolling. The spring has to keep integrating after the
 * scroll stops in order to settle, and the pin has to stay accurate if
 * the page is resized or the user jumps with a keyboard. Starting the
 * loop on scroll events would freeze the animation mid-transition.
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 *   The tall element that defines the scroll range.
 */
export function useScrollProgress(containerRef) {
  /**
   * Smoothed progress, 0 → 1.
   *
   * Written from a requestAnimationFrame loop rather than the scroll
   * event: scroll fires far more often than the display refreshes, and
   * writing per event would force a re-render each time.
   */
  const progress = ref(0)

  let lenis = null
  let frame = null
  let observer = null

  /** Cache of the geometry, refreshed on resize rather than per frame. */
  let containerTop = 0
  let containerHeight = 1

  /** Spring state. */
  let current = 0
  let velocity = 0

  /*
    Stiffness pulls toward the target, damping resists motion. Damping is
    the critical value (2 * sqrt(stiffness)) so the spring settles without
    oscillating — an under-damped spring would visibly bounce after the
    scroll stops.
  */
  const stiffness = 120
  const damping = 2 * Math.sqrt(stiffness)

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /**
   * Cache the container's position and height.
   *
   * Reading `getBoundingClientRect()` forces a layout flush, so it is
   * done here — on mount and on resize — never inside the frame loop.
   */
  const measure = () => {
    const el = containerRef.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    containerTop = rect.top + window.scrollY
    // Guard against a zero height before layout settles, which would
    // make the division below produce Infinity.
    containerHeight = Math.max(1, rect.height)
  }

  /** Raw progress for the current scroll position, before smoothing. */
  const targetProgress = () => {
    const travelled = window.scrollY - containerTop
    const scrollable = containerHeight - window.innerHeight
    if (scrollable <= 0) return 0
    return Math.min(Math.max(travelled / scrollable, 0), 1)
  }

  const step = () => {
    const target = targetProgress()

    // Fixed timestep: a measured one would make the spring behave
    // differently on a 120Hz display than on a 60Hz one.
    const dt = 1 / 60
    const accel = (target - current) * stiffness - velocity * damping

    velocity += accel * dt
    current += velocity * dt

    // Snap when the difference is invisible, so a sub-pixel value is not
    // carried forever.
    if (Math.abs(target - current) < 0.0005 && Math.abs(velocity) < 0.0005) {
      current = target
      velocity = 0
    }

    // 4dp is finer than a pixel of travel on any realistic section height.
    progress.value = Math.round(current * 10000) / 10000

    frame = requestAnimationFrame(step)
  }

  const onResize = () => measure()

  onMounted(() => {
    if (!containerRef.value) return

    // Honour the OS setting: report a settled value and stop. The
    // component renders its final state when progress is 0, so the
    // content is visible immediately.
    if (prefersReducedMotion()) {
      progress.value = 0
      return
    }

    lenis = initLenis()

    measure()
    window.addEventListener('resize', onResize, { passive: true })

    /*
      A ResizeObserver in addition to the window listener: the container's
      height can change without the window resizing — fonts swapping in,
      images decoding, a mobile browser collapsing its address bar. Any of
      those shifts the range the progress is measured against.
    */
    observer = new ResizeObserver(onResize)
    observer.observe(containerRef.value)

    frame = requestAnimationFrame(step)
  })

  onBeforeUnmount(() => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null

    window.removeEventListener('resize', onResize)
    observer?.disconnect()
    observer = null

    lenis = null
  })

  return { progress, measure }
}
