<script setup>
import { onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import AppPreloader from '@/components/ui/AppPreloader.vue'
import { destroyLenis, initLenis } from '@/composables/useLenis'

// Boot Lenis once, before the first paint of any view.
initLenis()

// Release the RAF loop and listeners on full app teardown.
onBeforeUnmount(destroyLenis)

const route = useRoute()
</script>

<template>
  <!--
    The preloader sits OUTSIDE MainLayout and outside the route
    transition on purpose:

    • Outside MainLayout, so it is not inside the element that gets
      scrolled or transformed — a fixed overlay inside a transformed
      ancestor would be positioned relative to that ancestor.
    • Outside the RouterView transition, so it never participates in a
      page change. It is a one-per-session boot screen, not a page.

    It renders on top of everything at z-200 and lifts away, revealing
    the page that was already mounted and painted underneath.
  -->
  <AppPreloader />

  <MainLayout>
    <!--
      ⚠️ The wrapping <div> and its :key are load-bearing.

      Every view here renders MULTIPLE root nodes (HomeView renders 7
      sections, ErrorView 2, ThankYouView 2). Vue's <Transition> can only
      animate a SINGLE root element, and with mode="out-in" a multi-root
      component never finishes leaving — so the next view never mounts
      and navigation appears completely broken.

      A keyed wrapper gives Transition one stable element to swap, and
      :key makes each route a distinct element so the transition actually
      runs on navigation instead of reusing the same node.

      Deliberately NOT `display: contents`: an element with no box cannot
      be transformed, which would silently kill the animation. The views
      are all full-width block sections, so a plain div is layout-neutral.
    -->
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <div :key="route.path">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </MainLayout>
</template>

<style>
/*
  Page transition.

  NOTE: this must be a GLOBAL style, not <style scoped>. The transition
  classes are applied to a wrapper that exists only in App.vue's own
  template, but the elements being animated are the views inside it —
  scoped attributes do not reach them, so scoped rules would never match.

  Uses `--ease-brutal`, the token defined in main.css.
*/
.page-enter-active,
.page-leave-active {
  transition:
    opacity 220ms var(--ease-brutal),
    transform 220ms var(--ease-brutal);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Respect reduced motion: drop the movement, keep a plain fade. */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: opacity 150ms linear;
  }
  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}
</style>
