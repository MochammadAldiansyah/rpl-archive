import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

import { initLenis } from '@/composables/useLenis'

/**
 * First-visit boot sequence.
 *
 * ── Design notes ────────────────────────────────────────────────────
 *
 * The progress shown is real, not a fake timer. Each step completes on
 * an actual browser event, so the counter reflects work that genuinely
 * happened. A timer-driven bar that reaches 100% before the page is
 * ready is worse than no bar at all — it lies, and it still leaves the
 * user staring at a blank screen.
 *
 * Three guards keep it from becoming a nuisance:
 *
 *   MIN_LOADING_MS  a floor, so a fast cache hit does not produce a
 *                   jarring flash of preloader.
 *   MAX_LOADING_MS  a ceiling, so an image that never resolves (offline,
 *                   blocked CDN) cannot trap the user on the screen.
 *   STORAGE_KEY     a sessionStorage flag, so it runs once per tab
 *                   session rather than on every navigation.
 */

const STORAGE_KEY = 'xii-rpl:booted'
const MIN_LOADING_MS = 1100
const MAX_LOADING_MS = 6000

/**
 * How long the curtain lift takes.
 *
 * ⚠️ This MUST stay in sync with the `preloader-lift` animation duration
 * in AppPreloader.vue. The CSS drives the visual; this value only tells
 * the composable when it is safe to unmount the overlay. If the CSS is
 * retimed and this is not, the overlay either unmounts mid-animation or
 * lingers invisibly on top of the page.
 */
const REVEAL_MS = 850

/**
 * The steps shown in the terminal.
 *
 * `id` is what marks the step complete; the label is display text.
 * Order matters — they render top to bottom.
 */
const STEPS = [
  { id: 'fonts', label: 'Memuat tipografi' },
  { id: 'assets', label: 'Menyiapkan aset halaman' },
  { id: 'ready', label: 'Menyusun tampilan' },
]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Has this tab already run the boot sequence?
 * Wrapped in try/catch because sessionStorage throws in some privacy
 * modes — if it is unavailable we simply show the preloader.
 */
function alreadyBooted() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markBooted() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Not persisting only means the sequence runs again next reload.
    // Not worth surfacing.
  }
}

/**
 * @returns {{
 *   phase: import('vue').Ref<'loading'|'revealing'|'done'>,
 *   progress: import('vue').Ref<number>,
 *   completed: import('vue').Ref<string[]>,
 *   steps: {id: string, label: string}[],
 * }}
 */
export function usePreloader() {
  const phase = ref('loading')
  const completed = ref([])
  const progress = ref(0)

  /** Every timer and listener we open, so teardown can close all of them. */
  let timers = []
  let cleanups = []

  const clearAll = () => {
    timers.forEach(clearTimeout)
    timers = []
    cleanups.forEach((fn) => fn())
    cleanups = []
  }

  /** Guards against steps ticking after the sequence has finished. */
  let settled = false

  const completeStep = (id) => {
    if (settled || completed.value.includes(id)) return
    completed.value = [...completed.value, id]
    progress.value = Math.round((completed.value.length / STEPS.length) * 100)
  }

  onMounted(async () => {
    // ---- Skip path ------------------------------------------------------
    // Repeat visit in this tab: jump straight to the finished state and
    // never paint the overlay.
    if (alreadyBooted()) {
      phase.value = 'done'
      return
    }

    // ---- Lock scrolling while the overlay is up -------------------------
    // Lenis drives the page, so pausing it is what actually stops the
    // background moving. The body rule is the fallback for when Lenis is
    // absent (reduced motion).
    const lenis = initLenis()
    lenis?.stop()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const releaseScroll = () => {
      lenis?.start()
      document.body.style.overflow = previousOverflow
    }

    // ---- The three real steps -------------------------------------------

    /** Resolves once `document.fonts` has settled, or immediately if absent. */
    const waitForFonts = async () => {
      if (!document.fonts?.ready) return
      try {
        await document.fonts.ready
      } catch {
        // A font that fails to load must not block the reveal.
      }
    }

    /** Resolves on window `load`, or immediately if it already fired. */
    const waitForLoad = () =>
      new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve()
          return
        }
        window.addEventListener('load', resolve, { once: true })
        cleanups.push(() => window.removeEventListener('load', resolve))
      })

    /*
      Each promise is created ONCE and reused. Calling these helpers
      twice — once to tick the step, once inside the race — would open a
      duplicate `load` listener and await `fonts.ready` twice, which is
      both wasteful and easy to get wrong when the two copies drift.
    */
    const fontsReady = waitForFonts()
    const pageLoaded = waitForLoad()

    // Tick each step as its own work finishes, so the log advances while
    // the user watches rather than jumping at the end.
    fontsReady.then(() => completeStep('fonts'))
    pageLoaded.then(() => completeStep('assets'))

    /*
      The floor. Applied to the whole sequence rather than per step, so
      the total wait is at least MIN_LOADING_MS without artificially
      padding each individual step.

      Both timers are tracked by id rather than only by the promise they
      resolve, so whichever loses the race can be cancelled. Leaving a
      losing 6-second timer armed would keep it in the event queue for
      the rest of the session for no reason.
    */
    let floorTimer = null
    let ceilingTimer = null

    const floor = new Promise((resolve) => {
      floorTimer = setTimeout(resolve, MIN_LOADING_MS)
      timers.push(floorTimer)
    })

    const ceiling = new Promise((resolve) => {
      ceilingTimer = setTimeout(resolve, MAX_LOADING_MS)
      timers.push(ceilingTimer)
    })

    await Promise.race([
      // Normal path: everything loaded AND the floor has elapsed.
      Promise.all([fontsReady, pageLoaded, floor]),
      // Safety path: something hung, stop waiting.
      ceiling,
    ])

    // Whichever fired, the other is now pointless — cancel it.
    clearTimeout(floorTimer)
    clearTimeout(ceilingTimer)

    /*
      Close the sequence before the final tick.

      On the timeout path a step promise may still resolve afterwards.
      Without this flag that late tick would append a fourth entry to a
      three-step list and push the percentage past 100.
    */
    settled = true

    // Force every step to its finished state, so a timed-out sequence
    // still ends on a complete-looking log rather than a stuck spinner.
    completed.value = STEPS.map((step) => step.id)
    progress.value = 100

    releaseScroll()
    markBooted()

    // ---- Reduced motion: skip the curtain entirely ----------------------
    if (prefersReducedMotion()) {
      phase.value = 'done'
      return
    }

    // ---- The curtain ----------------------------------------------------
    phase.value = 'revealing'
    timers.push(
      setTimeout(() => {
        phase.value = 'done'
      }, REVEAL_MS),
    )
  })

  onBeforeUnmount(clearAll)

  return {
    phase: readonly(phase),
    progress: readonly(progress),
    /** Which steps are finished — drives the ✓ marks. */
    completed: readonly(completed),
    /** Static list; exported so the view renders labels from one source. */
    steps: STEPS,
  }
}
