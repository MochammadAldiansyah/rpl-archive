<script setup>
defineProps({
  /** Text repeated across the ticker. */
  text: { type: String, required: true },
  /** Separator glyph between repetitions. */
  separator: { type: String, default: '★' },
  /** Scroll direction. */
  reverse: { type: Boolean, default: false },
  /** Colour utilities for the strip. */
  surface: { type: String, default: 'bg-ink text-paper' },
})
</script>

<template>
  <div
    class="overflow-hidden border-y-4 border-ink py-3 select-none"
    :class="surface"
    aria-hidden="true"
  >
    <!--
      The track holds the content twice and animates to -50%, so the
      loop is seamless with a single keyframe definition.
      Direction is chosen here — never both classes at once.
    -->
    <div
      class="marquee-track"
      :class="reverse ? 'animate-marquee-rev' : 'animate-marquee'"
    >
      <template v-for="copy in 2" :key="copy">
        <span
          v-for="n in 8"
          :key="`${copy}-${n}`"
          class="flex shrink-0 items-center gap-4 px-4 font-display text-xl font-bold uppercase tracking-tight sm:text-3xl"
        >
          {{ text }}
          <span class="text-acid">{{ separator }}</span>
        </span>
      </template>
    </div>
  </div>
</template>
