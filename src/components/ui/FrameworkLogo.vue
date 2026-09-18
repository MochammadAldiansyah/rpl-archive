<script setup>
/**
 * Framework logo.
 *
 * Uses the Simple Icons CDN rather than hand-written inline paths:
 * these are the official brand marks, so the shapes are guaranteed
 * correct. The browser fetches them at runtime; if the request fails
 * (offline / CDN blocked) the <img> is hidden and only the text label
 * remains, so the strip degrades gracefully instead of showing a
 * broken-image icon.
 *
 * Colour is fixed to ink (#0a0a0a) because every tile has a light
 * background (paper, turning acid on hover) — readable on both.
 *
 * To add a framework: add its Simple Icons slug, e.g. "nextdotjs".
 */
const props = defineProps({
  /** Simple Icons slug, e.g. "vue", "tailwindcss", "laravel". */
  name: { type: String, required: true },
  /** Rendered size in px (square). */
  size: { type: [Number, String], default: 32 },
})

const src = `https://cdn.simpleicons.org/${props.name}/0a0a0a`
</script>

<template>
  <img
    :src="src"
    :width="size"
    :height="size"
    :alt="`Logo ${name}`"
    loading="lazy"
    decoding="async"
    class="shrink-0 object-contain"
    @error="(e) => (e.target.style.display = 'none')"
  />
</template>
