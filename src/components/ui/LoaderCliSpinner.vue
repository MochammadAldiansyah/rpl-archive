<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { CLI_SPINNERS } from './loader-cli-spinner-utils/cli-spinner-data'

/**
 * Animated terminal spinner.
 *
 * Ported from a React component to Vue 3. The behaviour is identical;
 * what changed is the plumbing — `useState`/`useRef` become `ref`,
 * `useEffect` becomes a `watch` plus an unmount hook, and `cn()` is not
 * needed because this project has no class-merge helper and the class
 * list is small enough to compute directly.
 *
 * @example
 * <CliSpinner variant="braille-spin" :speed="1.5" size="1.25em" />
 */
const props = defineProps({
  /** Key from CLI_SPINNERS. Unknown values fall back to braille-spin. */
  variant: { type: String, default: 'braille-spin' },
  /** Multiplier — 2 is twice as fast, 0.5 is half. 0 freezes. */
  speed: { type: Number, default: 1 },
  /** Number of pixels, or any CSS length such as "1.25em". */
  size: { type: [Number, String], default: '1em' },
  /** Freeze on the current frame without unmounting. */
  paused: { type: Boolean, default: false },
  /** Accessible name announced to screen readers. */
  ariaLabel: { type: String, default: 'Memuat' },
})

/** Falls back rather than throwing, so a typo degrades to a working spinner. */
const spinner = computed(
  () => CLI_SPINNERS[props.variant] ?? CLI_SPINNERS['braille-spin'],
)

const frameIndex = ref(0)

/** CSS length — a bare number means pixels. */
const fontSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size,
)

const currentFrame = computed(
  () => spinner.value.frames[frameIndex.value] ?? spinner.value.frames[0],
)

let timerId = null

const stop = () => {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

const start = () => {
  stop()

  // A paused spinner, or speed 0, should hold the current frame — not
  // keep a timer alive that does nothing.
  if (props.paused || props.speed <= 0) return

  // 16ms floor: faster than one frame at 60Hz would just burn CPU for
  // motion the display cannot show.
  const delay = Math.max(16, spinner.value.interval / props.speed)

  timerId = window.setInterval(() => {
    frameIndex.value = (frameIndex.value + 1) % spinner.value.frames.length
  }, delay)
}

/*
  Restart whenever the frames, speed, or paused state change.
  `immediate` covers the initial run, so there is no separate onMounted.

  Watching the sources individually (rather than a getter returning an
  array) makes it obvious what triggers a restart — an array-returning
  getter creates a new array on every evaluation, which hides the real
  dependencies.

  Resetting to frame 0 on every change matches the reference component
  and stops the animation resuming mid-cycle when a variant swaps.
*/
watch(
  [spinner, () => props.speed, () => props.paused],
  () => {
    frameIndex.value = 0
    start()
  },
  { immediate: true },
)

onBeforeUnmount(stop)
</script>

<template>
  <!--
    <output> carries an implicit ARIA live region, which is the correct
    element for a status indicator. `aria-live="polite"` waits for the
    screen reader to finish its current sentence instead of interrupting.

    The visible glyph is aria-hidden so a screen reader announces
    "Memuat" once, not a stream of braille characters.
  -->
  <output
    :aria-label="ariaLabel"
    aria-live="polite"
    class="inline-flex items-center justify-center font-mono leading-none tabular-nums"
    :style="{ fontSize, minWidth: '1ch' }"
  >
    <span aria-hidden="true">{{ currentFrame }}</span>
  </output>
</template>
