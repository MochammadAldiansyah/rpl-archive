<script setup>
import { onBeforeUnmount } from 'vue'

import MainLayout from '@/layouts/MainLayout.vue'
import { destroyLenis, initLenis } from '@/composables/useLenis'

// Boot Lenis once, before the first paint of any view.
initLenis()

// Release the RAF loop and listeners on full app teardown.
onBeforeUnmount(destroyLenis)
</script>

<template>
  <MainLayout>
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </MainLayout>
</template>

<style>
/* Page transition — a hard, brutalist snap rather than a soft fade. */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.25s var(--ease-brutal),
    transform 0.25s var(--ease-brutal);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
