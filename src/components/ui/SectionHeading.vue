<script setup>
defineProps({
  /** Small monospace eyebrow, e.g. "// 02 — TENTANG KAMI" */
  label: { type: String, default: '' },
  title: { type: String, required: true },
  /** Highlight colour applied to the title's underline block. */
  accent: { type: String, default: 'bg-acid' },
})
</script>

<template>
  <header class="mb-10 sm:mb-16">
    <p v-if="label" class="brutal-label mb-3 text-ink/60">{{ label }}</p>

    <h2 class="brutal-heading">
      <!--
        `isolate` creates a stacking context so the -z-10 highlight
        block stays behind the text but in front of the section
        background. Without it the block can render behind the page.
      -->
      <span class="relative isolate inline-block">
        {{ title }}
        <!-- Solid highlighter block instead of a soft underline. -->
        <span
          class="absolute -bottom-1 left-0 -z-10 h-3 w-full sm:h-5"
          :class="accent"
          aria-hidden="true"
        />
      </span>
    </h2>
  </header>
</template>
