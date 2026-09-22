import { onBeforeUnmount, onMounted } from 'vue'

import { initLenis } from '@/composables/useLenis'

/**
 * Scroll-driven "camera through type" effect.
 *
 * Ported from a React component (Glyph Portal, © Christian Katzmann, MIT).
 * The algorithm is unchanged — only the plumbing is: refs replace
 * useState, onMounted/onBeforeUnmount replace useEffect, and direct DOM
 * writes replace React state, which matters here because this runs every
 * frame and must never trigger a re-render.
 *
 * ── What it does ────────────────────────────────────────────────────
 * A word is rendered as SVG text and used as a clip path over a
 * background. As the section scrolls, the clip scales up until a single
 * letter's interior fills the viewport — so the page appears to travel
 * through the letter and out into the content behind it.
 *
 * The letter to travel through is chosen by finding the largest opaque
 * square inside each glyph, then inscribing a circle in it. That works
 * for any character, including ones with no vertical stem (O, S, Ø).
 *
 * ── Why a canvas ────────────────────────────────────────────────────
 * Finding that interior needs pixel data, so the glyphs are rasterised
 * to an offscreen canvas at 3× scale and scanned with a largest-square
 * dynamic program. This happens once per layout, never per frame.
 *
 * @param {object} opts
 * @param {import('vue').Ref<HTMLElement|null>} opts.sectionRef
 * @param {() => object} opts.getOptions  current props, read fresh each frame
 * @param {(p: number) => void} [opts.onProgress]
 */
export function useGlyphPortal({ sectionRef, getOptions, onProgress }) {
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n))
  const smooth = (a, b, n) => {
    const t = clamp((n - a) / (b - a))
    return t * t * (3 - 2 * t)
  }

  /** Used when a caller supplies no font, and as the last-resort fallback. */
  const DEFAULT_FONT = '"Arial Black", "Arial", sans-serif'

  /**
   * How many frames to keep retrying the initial glyph measurement before
   * giving up and leaving the section in its static layout.
   *
   * Measurement needs a laid-out glyph, which is not guaranteed on the
   * very first frame after mount. A handful of retries covers that
   * without risking an unbounded loop.
   */
  const MAX_MEASURE_ATTEMPTS = 20

  /** Largest opaque square inside a glyph, in linear time. */
  function interior(context, char, font) {
    const canvas = context.canvas
    context.font = font
    const m = context.measureText(char)
    const pad = 8
    const left = Math.ceil(m.actualBoundingBoxLeft)
    const ascent = Math.ceil(m.actualBoundingBoxAscent)

    canvas.width = Math.max(
      1,
      Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2,
    )
    canvas.height = Math.max(
      1,
      Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2,
    )

    context.font = font
    context.fontKerning = 'none'
    context.fillText(char, pad + left, pad + ascent)

    const { width, height } = canvas
    const pixels = context.getImageData(0, 0, width, height).data
    const rows = new Uint16Array(width + 1)

    let size = 0
    let bx = 0
    let by = 0

    for (let y = 0; y < height; y++) {
      let diagonal = 0
      for (let x = 0; x < width; x++) {
        const above = rows[x + 1]
        rows[x + 1] =
          pixels[(y * width + x) * 4 + 3] > 245
            ? Math.min(above, rows[x], diagonal) + 1
            : 0
        diagonal = above
        if (rows[x + 1] > size) {
          size = rows[x + 1]
          bx = x
          by = y
        }
      }
    }

    if (size < 3) return null

    // Scanned at 3× SVG size — divide back down.
    return {
      x: (bx + 1 - size / 2 - pad - left) / 3,
      y: (by + 1 - size / 2 - pad - ascent) / 3,
      radius: (size / 2 - 1) / 3,
    }
  }

  /** Nearest scrollable ancestor, so the effect works inside a scroller. */
  function scrollParent(element) {
    for (let p = element.parentElement; p; p = p.parentElement) {
      if (
        /(auto|scroll|hidden)/.test(getComputedStyle(p).overflowY) &&
        p !== document.body &&
        p !== document.documentElement
      ) {
        return p
      }
    }
    return null
  }

  let cleanup = null

  onMounted(() => {
    const section = sectionRef.value
    if (!section) return

    const q = (sel) => section.querySelector(sel)
    const pin = q('[data-gp-pin]')
    const field = q('[data-gp-field]')
    const art = q('[data-gp-art]')
    const clip = q('[data-gp-clip]')
    const glyph = q('[data-gp-glyph]')
    const marks = q('[data-gp-marks]')
    const choices = q('[data-gp-choices]')
    const picker = q('[data-gp-select]')
    const viewportProbe = q('[data-gp-viewport]')

    if (!pin || !field || !art || !clip || !glyph || !marks) return

    const buttons = Array.from(choices?.querySelectorAll('button') ?? [])
    const root = scrollParent(section)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })

    let disposed = false
    let raf = 0
    let dirty = true
    let active = true
    let ready = false

    /** Set once the browser has actually painted a frame. */
    let browserFrameSeen = false
    /** True when the glyph font was not ready at setup. */
    let stalled = false
    /** Frames spent waiting for the glyph to become measurable. */
    let measureAttempts = 0

    let W = 1
    let H = 1
    let travel = 1
    let startScale = 1
    let endScale = 1
    let center = { x: 0, y: 0 }
    let target = null
    let lastProgress = -1

    let candidates = []
    let letters = []
    let choosing = false
    let bounds = { x: 0, y: 0, width: 1, height: 1 }

    // ---- Text setup -----------------------------------------------------
    /*
      Options are read ONCE, at mount.

      `word` is baked into the glyph measurement, the SVG clip text and
      the per-letter hit targets, so changing it mid-flight would mean
      re-measuring everything. Callers that need a different word should
      remount the component with a `:key` — which is why the prop is
      treated as fixed for the lifetime of this effect.
    */
    const opts = getOptions()
    const text = (opts.word ?? '').trim().normalize('NFC') || 'SUBLIME'
    const length = Number.isFinite(opts.scrollLength)
      ? clamp(opts.scrollLength, 1, 8)
      : 2.4
    const weight = Number.isFinite(opts.fontWeight)
      ? clamp(opts.fontWeight, 1, 1000)
      : 900
    const hasFront = opts.hasFront ?? false

    /*
      Character offsets are not computed here. The template owns the
      per-letter buttons and derives its own list, so duplicating that
      logic in this file would be two sources of truth for the same
      thing — and they would drift the moment either changed.
    */

    /*
      ── Font handling ──────────────────────────────────────────────────
      The glyph must be measured with the same face it renders with: a
      font that swaps in later would move the ink under the camera
      mid-scroll.

      Two details here are easy to get wrong, and both were:

      1. An empty `fontFamily` must fall back to the display font.
         `??` is not enough — an empty string is not nullish, so it
         cleared the inline style and the glyph silently inherited the
         BODY font (Inter) instead of the display font.

      2. Only the PRIMARY family is tested. The computed stack also
         contains generic fallbacks (`system-ui`, `sans-serif`) that are
         never "missing", so testing every entry reported a stall even
         when the real face was ready.

      ── Why this no longer blocks the animation ────────────────────────
      An earlier version disabled motion entirely when the font was not
      ready, and only re-enabled it after `document.fonts.ready` — which
      resolves when EVERY font on the page has settled. One slow or
      blocked webfont therefore left the portal permanently in reading
      flow: the word in one full-height block and the gallery in another,
      which is exactly the "two sections" symptom.

      Now the animation always runs. If the face arrives late we simply
      re-measure, because the cached glyph metrics came from whatever
      face was on screen at the time.
    */
    const requested = opts.fontFamily?.trim() || DEFAULT_FONT
    glyph.style.fontFamily = requested

    const computedFamily = getComputedStyle(glyph).fontFamily
    const primaryFamily = computedFamily
      .split(',')[0]
      .trim()
      .replace(/^["']|["']$/g, '')

    /** Is the intended face on screen right now? */
    const isFontReady = () => {
      try {
        return document.fonts.check(`${weight} 100px "${primaryFamily}"`, text)
      } catch {
        // No Font Loading API — assume whatever renders is final.
        return true
      }
    }

    // Keep the whole stack so the browser can still fall back if it must.
    glyph.style.fontFamily = computedFamily
    stalled = !isFontReady()

    // ---- Ink measurement -------------------------------------------------
    const readInk = () => {
      if (!context) return false

      const font = getComputedStyle(glyph)
      const scanFont = `${font.fontWeight} 300px ${font.fontFamily}`
      context.font = `${font.fontWeight} 100px ${font.fontFamily}`
      context.fontKerning = 'none'

      const metrics = context.measureText(text)
      const advances = Array.from({ length: text.length }, (_, i) =>
        context.measureText(text.slice(0, i)).width,
      )

      bounds = {
        x: -metrics.actualBoundingBoxLeft,
        y: -metrics.actualBoundingBoxAscent,
        width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      }
      if (!bounds.width || !bounds.height) return false

      center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }

      const focusChar = opts.focusChar
      const requestedIndex = focusChar ? text.indexOf(focusChar.normalize('NFC')) : -1

      let offset = 0
      candidates = []
      letters = []

      for (const char of Array.from(text)) {
        context.font = `${font.fontWeight} 100px ${font.fontFamily}`
        const m = context.measureText(char)

        letters.push({
          index: offset,
          x: advances[offset] - m.actualBoundingBoxLeft,
          y: -m.actualBoundingBoxAscent,
          width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
          height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
        })

        const found = interior(context, char, scanFont)
        if (found) candidates.push({ ...found, x: found.x + advances[offset], index: offset })

        offset += char.length
      }

      target =
        candidates.find((c) => c.index === requestedIndex) ??
        [...candidates].sort(
          (a, b) =>
            b.radius - a.radius || Math.abs(a.x - center.x) - Math.abs(b.x - center.x),
        )[0] ??
        null

      return true
    }

    // ---- Selection -------------------------------------------------------
    /**
     * Recompute everything that depends on which letter is chosen.
     *
     * @param {object|null} [next]
     *   Omit to keep the current target (recomputing only the derived
     *   values against the new viewport). Pass an object to switch, or
     *   `null` to clear the selection entirely.
     */
    const select = (next) => {
      if (next !== undefined) target = next

      endScale = target
        ? Math.max(startScale, Math.hypot(W, H) / (target.radius * 1.35))
        : startScale

      section.dataset.gpFocus = target ? Array.from(text.slice(target.index))[0] : ''
      section.dataset.gpFocusIndex = String(target?.index ?? -1)

      for (const button of buttons) {
        const index = Number(button.dataset.gpLetter)
        const usable = candidates.some((c) => c.index === index)
        const selected = index === target?.index
        button.disabled = !usable
        button.setAttribute('aria-checked', String(selected))
        button.tabIndex = selected ? 0 : -1
      }

      if (picker && picker.value !== '') picker.value = String(target?.index ?? -1)

      // ---- Annotation path (the corner ticks + crosshair) ---------------
      const u = 1 / startScale
      const y = bounds.y + bounds.height + 25 * u
      const x = bounds.x
      const right = x + bounds.width
      const cross = target
        ? `M${target.x - 9 * u} ${target.y}h${18 * u}M${target.x} ${target.y - 9 * u}v${18 * u}`
        : ''

      const path = marks.querySelector('path')
      if (path) {
        path.setAttribute(
          'd',
          `M${x} ${y}H${right}M${x} ${y - 5 * u}v${10 * u}M${right} ${y - 5 * u}v${10 * u}${cross}`,
        )
        path.setAttribute('stroke-width', String(u))
      }
    }

    const position = () => {
      const origin = root ? root.getBoundingClientRect().top + root.clientTop : 0
      return clamp((origin - section.getBoundingClientRect().top) / travel)
    }

    // ---- Paint -----------------------------------------------------------
    const paint = (progress) => {
      /*
        Only two things can hold the portal in reading flow now: the OS
        asking for reduced motion, or the browser not having painted a
        frame yet. Font readiness is deliberately NOT a condition — see
        the font-handling note above.
      */
      const isStatic = motion.matches || !browserFrameSeen || !target
      const p = isStatic ? 0 : progress

      const t = clamp(p / 0.78)
      const eased =
        t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2

      const scale = Math.exp(
        Math.log(startScale) + Math.log(endScale / startScale) * eased,
      )
      const blend =
        endScale === startScale
          ? 0
          : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale)

      const cx = center.x + ((target?.x ?? center.x) - center.x) * blend
      const cy = center.y + ((target?.y ?? center.y) - center.y) * blend
      const roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t))

      const transform = `translate(${W / 2} ${H * 0.46 + H * 0.04 * eased}) scale(${scale}) rotate(${roll}) translate(${-cx} ${-cy})`

      /*
        Scale goes on the clip, translation on the glyph.
        Keeping scale off the text avoids SVG text paint limits, and a
        text-local translation follows page zoom in WebKit — translation
        on an HTML clip reference does not.
      */
      const radians = (roll * Math.PI) / 180
      const dx = W / 2 / scale
      const dy = (H * 0.46 + H * 0.04 * eased) / scale

      clip.setAttribute('transform', `scale(${scale}) rotate(${roll})`)
      glyph.setAttribute(
        'transform',
        `translate(${Math.cos(radians) * dx + Math.sin(radians) * dy - cx} ${
          -Math.sin(radians) * dx + Math.cos(radians) * dy - cy
        })`,
      )
      marks.setAttribute('transform', transform)
      marks.style.opacity = String(1 - smooth(0.015, 0.17, p))

      choosing = (opts.interactive ?? true) && !isStatic && p < 0.04
      if (choices) choices.inert = !choosing
      section.dataset.gpChoosing = String(choosing)

      // Drop the clip only once ink already fills the viewport.
      field.style.clipPath = t >= 1 ? 'none' : `url(#${clip.id})`

      section.style.setProperty('--gp-caption', String(1 - smooth(0.01, 0.16, p)))
      section.style.setProperty('--gp-reveal', String(isStatic ? 1 : smooth(0.78, 0.9, p)))
      section.style.setProperty('--gp-field-scale', String(1 + 0.16 * smooth(0, 0.82, p)))
      section.style.setProperty('--gp-caption-hit', p < 0.08 ? 'auto' : 'none')
      section.dataset.gpEntered = String(p >= 0.9)
      section.dataset.gpProgress = p.toFixed(5)

      if (p !== lastProgress) {
        lastProgress = p
        onProgress?.(p)
      }
    }

    // ---- Layout ----------------------------------------------------------
    const layout = () => {
      if (!section.clientWidth) return

      W = pin.clientWidth

      // A 100svh probe keeps mobile browser chrome from changing the
      // scroll distance as the address bar collapses.
      const smallViewport = viewportProbe?.offsetHeight ?? window.innerHeight
      const viewportHeight = Math.max(
        1,
        Math.min(root?.clientHeight ?? smallViewport, smallViewport),
      )

      H = motion.matches ? Math.min(viewportHeight * 0.75, 480) : viewportHeight
      section.style.setProperty('--gp-height', `${H}px`)
      travel = H * length

      art.setAttribute('viewBox', `0 0 ${W} ${H}`)

      if (!ready) {
        ready = readInk()
        if (!ready) return
      }

      /*
        No argument: readInk() has already set `target` from the measured
        candidates on the first pass, and on later passes we want to keep
        whichever letter the visitor chose. select() only recomputes the
        values derived from the viewport size.
      */
      select()

      const wordHeight =
        hasFront && H < 480 ? Math.min(H * 0.38, Math.max(24, H - 264)) : H * 0.38

      startScale = Math.min((W * 0.84) / bounds.width, wordHeight / bounds.height)

      // Position each letter's hit target over its rendered glyph.
      for (const button of buttons) {
        const letter = letters.find((l) => l.index === Number(button.dataset.gpLetter))
        if (!letter) continue
        Object.assign(button.style, {
          left: `${W / 2 + (letter.x - center.x) * startScale}px`,
          top: `${H * 0.46 + (letter.y - center.y) * startScale - Math.max(0, 44 - letter.height * startScale) / 2}px`,
          width: `${Math.max(1, letter.width * startScale)}px`,
          height: `${Math.max(44, letter.height * startScale)}px`,
        })
      }

      section.style.setProperty(
        '--gp-word-top',
        `${H * 0.46 - (bounds.height * startScale) / 2}px`,
      )
      section.style.setProperty(
        '--gp-word-bottom',
        `${H * 0.46 + (bounds.height * startScale) / 2}px`,
      )

      section.dataset.gpReady = 'true'
      section.dataset.gpMotion =
        !motion.matches && browserFrameSeen && target ? 'on' : 'off'
    }

    // ---- Frame loop ------------------------------------------------------
    const frame = (time) => {
      raf = 0
      if (disposed) return

      /*
        The first frame proves the browser is rendering, which is the only
        thing we need to know before enabling motion.

        There is deliberately NO "did the first frame take too long?"
        heuristic here. An earlier version treated a slow first frame as
        evidence of a hung font and disabled the animation permanently —
        but the first frame is also late whenever something else holds the
        page, such as the boot preloader. That turned a slow start into a
        dead effect. Font readiness is now checked directly, at setup.
      */
      if (time !== undefined && !browserFrameSeen) {
        browserFrameSeen = true
        dirty = true
      }

      if (dirty) {
        dirty = false
        layout()
      }

      if (ready) {
        paint(position())
        return
      }

      /*
        Still measuring. Retry on the next frame, but only a bounded
        number of times: a canvas that cannot be read (or a font that
        never resolves) would otherwise spin this loop forever, burning a
        frame callback for the life of the page.
      */
      if (measureAttempts < MAX_MEASURE_ATTEMPTS) {
        measureAttempts += 1
        schedule()
      }
    }

    const schedule = () => {
      if (!raf && active) raf = requestAnimationFrame(frame)
    }
    const resize = () => {
      cancelAnimationFrame(raf)
      dirty = true
      frame()
    }
    const onScroll = () => schedule()

    // ---- Interaction -----------------------------------------------------
    const choose = (event) => {
      if (!choosing || position() >= 0.04) return
      const button = event.target.closest('[data-gp-letter]')
      const next = candidates.find(
        (c) => c.index === Number(button?.dataset.gpLetter),
      )
      if (!next || next === target) return
      select(next)
      paint(position())
    }

    const navigate = (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
      if (!choosing || !keys.includes(event.key)) return
      event.preventDefault()

      const current = candidates.indexOf(target)
      const index =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? candidates.length - 1
            : (current +
                (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) +
                candidates.length) %
              candidates.length

      buttons
        .find((b) => Number(b.dataset.gpLetter) === candidates[index].index)
        ?.focus({ preventScroll: true })
    }

    const pick = () => {
      if (!choosing || position() >= 0.04 || !picker) return
      const next = candidates.find((c) => c.index === Number(picker.value))
      if (next) {
        select(next)
        paint(position())
      }
    }

    choices?.addEventListener('pointerover', choose)
    choices?.addEventListener('click', choose)
    choices?.addEventListener('focusin', choose)
    choices?.addEventListener('keydown', navigate)
    picker?.addEventListener('change', pick)

    // ---- Observers -------------------------------------------------------
    const observer = new ResizeObserver(resize)
    observer.observe(section)
    if (root) observer.observe(root)

    const visibility = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting
        if (active) {
          dirty = true
          schedule()
        } else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { root, rootMargin: '100% 0px' },
    )
    visibility.observe(section)

    /*
      ── Late font re-measure ───────────────────────────────────────────
      The glyph metrics cached by readInk() came from whatever face was on
      screen at setup. If the intended face arrives afterwards, the ink
      has moved and the camera would be aiming at the old position.

      So: re-measure once, when the face we actually wanted becomes
      available. Waiting on the specific face rather than the global
      `fonts.ready` means one unrelated slow font cannot hold this up.
    */
    if (stalled && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (disposed || !isFontReady()) return
          stalled = false
          ready = false // force readInk() to re-measure
          dirty = true
          schedule()
        })
        .catch(() => {
          // A font that never loads must not break the section.
        })
    }

    /*
      ── Why this does not add its own Lenis ──────────────────────────
      The React original spun up a second Lenis instance. This app already
      owns one shared instance (useLenis.js) driving the router, navbar
      and modal. A second one would mean two scroll hijackers fighting
      over the same window.

      Instead we listen to the window scroll event, which Lenis updates
      synchronously each frame — same timing, no competing loop.
    */
    initLenis()
    ;(root ?? window).addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize)
    window.visualViewport?.addEventListener('resize', resize)
    motion.addEventListener('change', resize)

    frame()
    schedule()

    cleanup = () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      visibility.disconnect()
      ;(root ?? window).removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      window.visualViewport?.removeEventListener('resize', resize)
      motion.removeEventListener('change', resize)
      choices?.removeEventListener('pointerover', choose)
      choices?.removeEventListener('click', choose)
      choices?.removeEventListener('focusin', choose)
      choices?.removeEventListener('keydown', navigate)
      picker?.removeEventListener('change', pick)
    }
  })

  onBeforeUnmount(() => {
    cleanup?.()
    cleanup = null
  })

  return { clamp, smooth }
}
