import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Characters used to mask letters mid-scramble. */
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Cycle through a list of words with a "decoding" scramble transition.
 * Returns a plain-text ref — deliberately NOT v-html, so there is no
 * injection surface and no per-character markup to diff.
 *
 * @param {string[]} words
 * @param {{ interval?: number, speed?: number }} options
 */
export function useTextScramble(words, options = {}) {
  const { interval = 2800, speed = 30 } = options

  const text = ref(words[0] ?? '')

  let swapTimer = null
  let rafId = null
  let wordIndex = 0

  const scrambleTo = (target) => {
    const from = text.value
    const length = Math.max(from.length, target.length)

    // Build a per-character animation window.
    const queue = Array.from({ length }, (_, i) => {
      const start = Math.floor(Math.random() * 14)
      return {
        from: from[i] ?? '',
        to: target[i] ?? '',
        start,
        end: start + Math.floor(Math.random() * 14) + 6,
        char: '',
      }
    })

    let frame = 0

    const tick = () => {
      let out = ''
      let finished = 0

      for (const item of queue) {
        if (frame >= item.end) {
          finished += 1
          out += item.to
        } else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.32) {
            item.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          }
          out += item.char
        } else {
          out += item.from
        }
      }

      text.value = out

      if (finished === queue.length) {
        rafId = null
        return
      }
      frame += 1
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
  }

  const next = () => {
    wordIndex = (wordIndex + 1) % words.length
    scrambleTo(words[wordIndex])
  }

  onMounted(() => {
    if (words.length < 2 || prefersReducedMotion()) return
    swapTimer = window.setInterval(next, interval)
  })

  onBeforeUnmount(() => {
    if (swapTimer) window.clearInterval(swapTimer)
    if (rafId) cancelAnimationFrame(rafId)
  })

  return { text }
}
