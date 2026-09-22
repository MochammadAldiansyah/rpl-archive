<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import MarqueeTicker from '@/components/ui/MarqueeTicker.vue'
import { errorOf } from '@/data/errors'

const route = useRoute()
const router = useRouter()

/** Route meta drives the content; unknown codes fall back to 404. */
const info = computed(() => errorOf(Number(route.meta?.code)))

const reload = () => window.location.reload()
</script>

<template>
  <section class="border-b-4 border-ink bg-paper">
    <div
      class="brutal-grid-bg mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-24"
    >
      <!-- Status code: the loudest thing on the page -->
      <p
        class="inline-block self-start border-4 border-ink px-4 py-2 font-mono text-sm font-bold tracking-[0.25em] uppercase shadow-brutal-sm"
        :class="info.accent"
      >
        ERROR {{ info.code }}
      </p>

      <h1
        class="mt-8 font-display text-[20vw] leading-[0.8] font-bold tracking-tighter uppercase sm:text-[14vw] lg:text-[11rem]"
      >
        {{ info.code }}
      </h1>

      <h2
        class="mt-4 font-display text-3xl leading-[0.95] font-bold tracking-tighter uppercase sm:text-5xl"
      >
        {{ info.title }}
      </h2>

      <p class="mt-6 max-w-xl text-xl leading-relaxed sm:text-2xl">
        {{ info.lead }}
      </p>

      <p class="mt-4 max-w-xl leading-relaxed text-ink/70">
        {{ info.body }}
      </p>

      <!--
        Actions. BaseButton renders a <button> or an <a> (via `href`),
        so internal navigation goes through the router rather than
        nesting a RouterLink inside a button (invalid HTML).
      -->
      <div class="mt-10 flex flex-wrap gap-4">
        <BaseButton v-if="info.action?.reload" @click="reload">
          {{ info.action.label }}
        </BaseButton>
        <BaseButton
          v-else-if="info.action?.to"
          @click="router.push(info.action.to)"
        >
          {{ info.action.label }}
        </BaseButton>

        <BaseButton
          v-if="info.secondary?.to"
          variant="ink"
          @click="router.push(info.secondary.to)"
        >
          {{ info.secondary.label }}
        </BaseButton>
      </div>

      <!-- Escape hatch: always offer a way back into the site -->
      <p class="mt-10 font-mono text-sm text-ink/50">
        Atau langsung ke:
        <RouterLink
          to="/#anggota"
          class="border-2 border-ink bg-acid px-1.5 font-bold transition-colors hover:bg-ink hover:text-paper"
        >
          Daftar Anggota
        </RouterLink>
        ·
        <RouterLink
          to="/#galeri"
          class="border-2 border-ink bg-acid px-1.5 font-bold transition-colors hover:bg-ink hover:text-paper"
        >
          Galeri
        </RouterLink>
      </p>
    </div>
  </section>

  <MarqueeTicker
    text="ERROR ADALAH GURU · JANGAN PANIK"
    surface="bg-ink text-paper"
  />
</template>
