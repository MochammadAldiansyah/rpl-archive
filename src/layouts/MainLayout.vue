<script setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-paper">
    <AppNavbar />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
