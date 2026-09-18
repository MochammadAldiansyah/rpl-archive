<script setup>
import FrameworkLogo from '@/components/ui/FrameworkLogo.vue'

/**
 * Frameworks we actually touch.
 *
 * `logo` is a Simple Icons slug — note Node.js is "nodedotjs", not
 * "nodejs"; an unknown slug returns a 404 and the icon self-hides.
 */
const FRAMEWORKS = [
  { logo: 'vue', label: 'Vue.js' },
  { logo: 'laravel', label: 'Laravel' },
  { logo: 'tailwindcss', label: 'Tailwind' },
  { logo: 'flutter', label: 'Flutter' },
  { logo: 'python', label: 'Python' },
  { logo: 'react', label: 'React' },
  { logo: 'nodedotjs', label: 'Node.js' },
  { logo: 'figma', label: 'Figma' },
]
</script>

<template>
  <!--
    Auto-scrolling framework strip. The track holds the list twice and
    animates to -50%, so the loop is seamless. Hover pauses it.
    Tiles are paper-coloured so the dark brand marks stay legible.
  -->
  <div class="overflow-hidden border-y-4 border-ink bg-ink py-4 select-none">
    <div class="marquee-track animate-marquee">
      <template v-for="copy in 2" :key="copy">
        <div
          v-for="item in FRAMEWORKS"
          :key="`${copy}-${item.logo}`"
          class="mx-3 flex shrink-0 items-center gap-3 border-4 border-paper bg-paper px-5 py-3 transition-colors duration-200 hover:bg-acid"
        >
          <FrameworkLogo :name="item.logo" :size="30" />
          <span
            class="font-display text-lg font-bold tracking-tight text-ink uppercase sm:text-xl"
          >
            {{ item.label }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
