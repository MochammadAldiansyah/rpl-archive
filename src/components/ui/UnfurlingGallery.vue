<script setup>
import { computed, ref } from 'vue'

import { useScrollProgress } from '@/composables/useScrollProgress'

/**
 * Unfurling 3D photo wall.
 *
 * A tall container pins a stage to the viewport. As you scroll through
 * it, the stage grows from a rounded card into a full-bleed wall and a
 * grid of photos rotates in 3D from a steep angle down to nearly flat,
 * while each column drifts at its own rate. By the end the wall has
 * unfolded into a flat grid you can look at.
 *
 * ── Why this does not use framer-motion ─────────────────────────────
 * The React original mapped scroll progress onto twelve animated values
 * with `useTransform`. That is arithmetic, not animation-library work:
 * one `progress` number in, twelve interpolated numbers out, all applied
 * as inline styles. Doing it directly keeps the whole effect at one
 * dependency (Lenis, already in this project) instead of adding a
 * library that would also run a second animation loop.
 *
 * @see useScrollProgress for how progress is measured and smoothed.
 */
const props = defineProps({
  /** Photo URLs. Repeated across four columns. */
  images: { type: Array, required: true },
  /**
   * How tall the scroll track is, as a multiple of the viewport.
   * Higher means the unfurl takes longer.
   */
  trackLength: { type: Number, default: 5 },
})

const containerRef = ref(null)
const { progress } = useScrollProgress(containerRef)

/** Clamp to 0..1 — the spring can overshoot by a hair at the ends. */
const p = computed(() => Math.min(Math.max(progress.value, 0), 1))

/**
 * Linear interpolation, clamped to the segment.
 *
 * This is the whole of what `useTransform(value, [a, b], [c, d])` does,
 * written out so the mapping is readable in one place.
 */
const lerp = (from, to, t) => from + (to - from) * Math.min(Math.max(t, 0), 1)

/** Progress remapped from [from, to] onto [0, 1], clamped. */
const segment = (from, to) => (p.value - from) / (to - from)

// ── Stage: grows from a rounded card into a full-bleed wall ──────────
const stageStyle = computed(() => {
  const t = segment(0, 0.15)
  return {
    width: `${lerp(90, 100, t)}vw`,
    height: `${lerp(78, 100, t)}vh`,
    borderRadius: `${lerp(48, 0, t)}px`,
    borderWidth: `${lerp(4, 0, t)}px`,
  }
})

// ── The wall: rotates from a steep 3D angle to nearly flat ───────────
const wallStyle = computed(() => {
  const t = segment(0.15, 1)
  return {
    transform: [
      `rotateX(${lerp(25, 4, t)}deg)`,
      `rotateY(${lerp(-45, -8, t)}deg)`,
      `rotateZ(${lerp(15, 2, t)}deg)`,
      `translateZ(${lerp(-800, 0, t)}px)`,
    ].join(' '),
    transformStyle: 'preserve-3d',
  }
})

/**
 * Per-column drift.
 *
 * Each column starts at a different offset and travels a different
 * distance, which is what breaks the grid out of a single flat plane and
 * makes it read as depth rather than one sheet sliding past.
 */
const COLUMN_DRIFT = [
  { from: 0, to: -40 },
  { from: -40, to: 10 },
  { from: 0, to: -40 },
  { from: -30, to: 20 },
]

/**
 * Split the photos across four columns, then repeat each column.
 *
 * The repeat matters: a column travels up to 40% of its own height, so
 * without a second copy of the set there would be visible gaps at the
 * top and bottom of the wall as it moves.
 */
const columns = computed(() => {
  const buckets = [[], [], [], []]
  props.images.forEach((src, index) => {
    buckets[index % 4].push(src)
  })
  return buckets.map((bucket) => [...bucket, ...bucket])
})

const columnStyle = (index) => ({
  transform: `translateY(${lerp(COLUMN_DRIFT[index].from, COLUMN_DRIFT[index].to, segment(0.15, 1))}%)`,
})
</script>

<template>
  <!--
    The track is tall on purpose: its extra height is the scroll distance
    the pinned stage uses to unfurl. `position: sticky` on the inner
    element is what keeps the stage on screen while the track scrolls past.
  -->
  <div
    ref="containerRef"
    class="unfurl-track relative w-full bg-ink"
    :style="{ height: `${trackLength * 100}vh` }"
  >
    <div class="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
      <!-- ==================== The stage ==================== -->
      <div
        class="unfurl-stage relative flex max-w-[1920px] items-center justify-center overflow-hidden border-solid border-paper/30 bg-ink"
        :style="stageStyle"
      >
        <!--
          The 3D scene.

          `perspective` has to live on an ancestor of the rotated element,
          not on the element itself — without it the rotations render flat
          and the whole effect collapses into a slight skew.
        -->
        <div
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
          style="perspective: 1000px"
        >
          <!--
            Vignette.

            Two inset shadows, one per axis, darken the edges so the wall
            fades into the stage instead of ending at a hard rectangle.
            They sit above the photos (z-20) and ignore pointer events, so
            they cannot swallow a click on a tile.
          -->
          <div
            class="pointer-events-none absolute inset-0 z-20"
            style="
              box-shadow:
                inset 0 100px 150px -50px rgba(26, 26, 26, 1),
                inset 0 -100px 150px -50px rgba(26, 26, 26, 1);
            "
            aria-hidden="true"
          />
          <div
            class="pointer-events-none absolute inset-0 z-20"
            style="
              box-shadow:
                inset 150px 0 150px -50px rgba(26, 26, 26, 1),
                inset -150px 0 150px -50px rgba(26, 26, 26, 1);
            "
            aria-hidden="true"
          />

          <!-- ==================== The photo wall ==================== -->
          <div
            class="unfurl-wall flex h-[150vh] w-[120vw] origin-center items-center justify-center gap-4 will-change-transform md:gap-6"
            :style="wallStyle"
          >
            <div
              v-for="(column, index) in columns"
              :key="index"
              class="flex w-[22vw] min-w-[200px] flex-col gap-4 will-change-transform md:gap-6"
              :style="columnStyle(index)"
            >
              <div
                v-for="(src, photoIndex) in column"
                :key="`${index}-${photoIndex}`"
                class="relative h-[200px] flex-shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-card)] border-2 border-paper/20 bg-ink transition-transform duration-300 hover:scale-[1.02] sm:h-[300px] md:h-[400px]"
              >
                <img
                  :src="src"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  class="h-full w-full object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Reduced motion: no pinning, no unfurl.

  The track collapses to its natural height and the wall renders flat and
  complete, so the photos are all still visible — the effect is removed,
  not the content.
*/
@media (prefers-reduced-motion: reduce) {
  .unfurl-track {
    height: auto !important;
  }

  .unfurl-track > div {
    position: relative !important;
    height: auto !important;
    padding-block: 4rem;
  }

  .unfurl-stage {
    width: 100% !important;
    height: auto !important;
    border-radius: 0 !important;
    border-width: 0 !important;
  }

  .unfurl-wall {
    position: relative !important;
    height: auto !important;
    width: 100% !important;
    transform: none !important;
    flex-wrap: wrap;
  }

  .unfurl-wall > div {
    transform: none !important;
    width: 22vw !important;
  }
}
</style>
