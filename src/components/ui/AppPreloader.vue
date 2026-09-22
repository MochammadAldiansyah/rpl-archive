<script setup>
import { computed } from 'vue'

import LoaderCliSpinner from '@/components/ui/LoaderCliSpinner.vue'
import { usePreloader } from '@/composables/usePreloader'
import { TOTAL_STUDENTS } from '@/data/students'

const { phase, progress, completed, steps } = usePreloader()

/**
 * The overlay stays mounted during `revealing` so the curtain animation
 * has something to animate, then unmounts at `done` — which also tears
 * down the spinners' intervals and drops the element out of the
 * accessibility tree.
 */
const isVisible = computed(() => phase.value !== 'done')

/** Drives the lift. */
const isRevealing = computed(() => phase.value === 'revealing')

/** Spinner variant per step, cycled so the log has visual variety. */
const SPINNER_VARIANTS = ['braille-spin', 'aesthetic', 'dots']
</script>

<template>
  <!--
    No <Transition> wrapper on purpose.

    The lift animation already carries the overlay off-screen, and it
    uses `forwards` fill so it holds that position. A leave transition on
    top of it would be dead code at best — and at worst it would race the
    animation, removing the element before the lift finished.

    `v-if` alone is correct: by the time `phase` becomes 'done' the
    overlay is already off-screen, so unmounting it is invisible.
  -->
  <div
    v-if="isVisible"
    class="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-ink px-4"
    :class="isRevealing && 'preloader--lift'"
    role="status"
    aria-live="polite"
    :aria-label="`Memuat website, ${progress} persen`"
  >
    <!-- Brutalist grid backdrop, matching the rest of the site -->
    <div class="brutal-grid-bg-light absolute inset-0 opacity-60" aria-hidden="true" />

    <!-- ==================== Terminal window ==================== -->
    <div
      class="relative w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] border-4 border-paper bg-ink shadow-[12px_12px_0px_0px_rgba(255,248,231,1)]"
    >
      <!-- Title bar -->
      <div
        class="flex items-center gap-2 border-b-4 border-paper px-4 py-3"
        aria-hidden="true"
      >
        <span class="h-3 w-3 border-2 border-paper bg-blood" />
        <span class="h-3 w-3 border-2 border-paper bg-acid" />
        <span class="h-3 w-3 border-2 border-paper bg-slime" />
        <span class="ml-2 font-mono text-xs text-paper/60">bash — xii-rpl</span>
      </div>

      <!-- Body -->
      <div class="space-y-3 px-5 py-6 font-mono text-sm">
        <!-- The command being "run" -->
        <p class="text-paper/60">
          <span class="text-acid">$</span> npm run build:kelas
        </p>

        <!--
          Steps. Each unfinished step shows its own spinner variant;
          finished steps swap to a tick and dim, so the list reads as a
          real build log rather than a decorative animation.
        -->
        <p
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex items-center gap-3 text-paper"
        >
          <LoaderCliSpinner
            v-if="!completed.includes(step.id)"
            :variant="SPINNER_VARIANTS[index % SPINNER_VARIANTS.length]"
            :speed="1.4"
            size="1em"
            :aria-label="step.label"
            class="text-acid"
          />
          <span v-else class="text-slime" aria-hidden="true">✓</span>

          <span :class="completed.includes(step.id) && 'text-paper/50'">
            {{ step.label }}
          </span>

          <span
            v-if="completed.includes(step.id)"
            class="ml-auto text-xs text-paper/30"
          >
            done
          </span>
        </p>

        <!-- Progress -->
        <div class="pt-2">
          <div
            class="flex items-center justify-between font-mono text-xs text-paper/50"
          >
            <span>progress</span>
            <span class="tabular-nums">{{ progress }}%</span>
          </div>

          <!--
            Hard-edged meter: square segments, no rounding, no gradient,
            so it matches the brutalist language instead of looking like a
            generic UI kit progress bar.
          -->
          <div
            class="mt-2 flex h-4 gap-1 border-2 border-paper p-0.5"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Progres pemuatan ${progress} persen`"
          >
            <span
              v-for="n in 20"
              :key="n"
              class="h-full flex-1 transition-colors duration-200"
              :class="progress >= n * 5 ? 'bg-acid' : 'bg-paper/10'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== Wordmark ==================== -->
    <p
      class="relative mt-8 font-display text-2xl font-bold tracking-tighter text-paper uppercase sm:text-3xl"
    >
      Orang Orangan
      <span class="border-4 border-paper bg-acid px-1.5 text-ink">Erpeel</span>
    </p>

    <p class="relative mt-3 font-mono text-xs tracking-widest text-paper/40 uppercase">
      {{ TOTAL_STUDENTS }} siswa · satu repositori
    </p>
  </div>
</template>

<style scoped>
/*
  ── The reveal ──────────────────────────────────────────────────────
  The whole overlay lifts off the top edge like a curtain, uncovering
  the page that was already mounted and painted underneath.

  Why the entire overlay moves rather than a separate cover panel: a
  panel would have to sit above the terminal from the start, so the user
  would see a blank slab instead of the boot log. Lifting the overlay
  itself means the terminal is visible for the whole load and then
  travels away with the curtain — which is the effect that was asked for.

  Only `transform` is animated — a compositor-only property, so the lift
  stays smooth even while the hero's parallax is simultaneously
  transforming four layers.
*/
.preloader--lift {
  animation: preloader-lift 850ms cubic-bezier(0.76, 0, 0.24, 1) forwards;
  /* Stop the overlay swallowing clicks once it starts moving. */
  pointer-events: none;
}

@keyframes preloader-lift {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, -100%, 0);
  }
}

/*
  Reduced motion: the composable jumps straight to `done` without ever
  entering `revealing`, so the lift never runs. This block is a
  belt-and-braces guard in case the OS preference changes mid-session.
*/
@media (prefers-reduced-motion: reduce) {
  .preloader--lift {
    animation: none;
  }
}
</style>
