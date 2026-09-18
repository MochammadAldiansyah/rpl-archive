<script setup>
defineProps({
  /** Adds hover-lift / active-press micro-interactions. */
  interactive: { type: Boolean, default: true },
  /** Background utility, e.g. "bg-paper" or "bg-acid". */
  surface: { type: String, default: 'bg-paper' },
})
</script>

<template>
  <article
    class="brutal-box p-5 sm:p-6"
    :class="[surface, interactive && 'brutal-interactive']"
  >
    <slot />
  </article>
</template>
