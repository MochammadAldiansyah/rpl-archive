<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 'acid' | 'ink' | 'paper' | 'electric' | 'blood' */
  variant: { type: String, default: 'acid' },
  /** Renders an <a> instead of a <button> when provided. */
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  block: { type: Boolean, default: false },
})

const VARIANTS = {
  acid: 'bg-acid text-ink hover:bg-electric hover:text-paper',
  ink: 'bg-ink text-paper hover:bg-blood hover:text-paper',
  paper: 'bg-paper text-ink hover:bg-acid',
  electric: 'bg-electric text-paper hover:bg-ink',
  blood: 'bg-blood text-paper hover:bg-ink',
}

const tag = computed(() => (props.href ? 'a' : 'button'))
const classes = computed(() => [
  'brutal-btn',
  VARIANTS[props.variant] ?? VARIANTS.acid,
  props.block ? 'w-full' : '',
])
</script>

<template>
  <component
    :is="tag"
    :class="classes"
    :href="href"
    :type="href ? undefined : type"
  >
    <slot />
  </component>
</template>
