<script setup>
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { organisation } from '@/data/organisation'

/**
 * Literal class maps — Tailwind only ships classes it can see in source,
 * so colours must be resolved through a lookup, never string-built.
 */
const ACCENTS = {
  ink: { surface: 'bg-ink text-paper', badge: 'bg-acid text-ink' },
  acid: { surface: 'bg-acid text-ink', badge: 'bg-ink text-paper' },
  electric: { surface: 'bg-electric text-paper', badge: 'bg-paper text-ink' },
  blood: { surface: 'bg-blood text-paper', badge: 'bg-paper text-ink' },
  slime: { surface: 'bg-slime text-ink', badge: 'bg-ink text-paper' },
  paper: { surface: 'bg-paper text-ink', badge: 'bg-ink text-paper' },
}

const accentOf = (key) => ACCENTS[key] ?? ACCENTS.paper
</script>

<template>
  <section id="struktur" class="border-b-4 border-ink bg-ink">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <header class="mb-10 sm:mb-16">
        <p class="brutal-label mb-3 text-acid">// 02 — STRUKTUR ORGANISASI</p>
        <h2
          class="font-display text-4xl leading-[0.9] font-bold tracking-tighter text-paper uppercase sm:text-6xl lg:text-7xl"
        >
          Siapa
          <span class="bg-acid px-2 text-ink">Ngatur</span>
          Siapa
        </h2>
      </header>

      <!-- Raw grid: one lead card spanning two columns, then the rest. -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!--
          Hover shadow is hardcoded to paper-white here: the shared
          `brutal-interactive` helper casts a black shadow, which would
          be invisible against this section's black background.
        -->
        <article
          v-for="person in organisation"
          :key="person.id"
          class="rounded-[var(--radius-card)] border-4 border-paper p-6 shadow-[8px_8px_0px_0px_rgba(255,248,231,1)] transition-all duration-200 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:rotate-[-1.5deg] hover:shadow-[14px_14px_0px_0px_rgba(255,248,231,1)] active:translate-x-1 active:translate-y-1 active:rotate-0 active:shadow-[2px_2px_0px_0px_rgba(255,248,231,1)]"
          :class="[
            accentOf(person.accent).surface,
            person.lead && 'sm:col-span-2',
          ]"
        >
          <div class="flex items-start justify-between gap-4">
            <span
              class="brutal-pill border-current px-3 py-1 text-xs tracking-[0.2em]"
            >
              {{ person.role }}
            </span>
            <span
              v-if="person.lead"
              class="brutal-pill border-ink px-3 py-1 text-xs"
              :class="accentOf(person.accent).badge"
            >
              PIMPINAN
            </span>
          </div>

          <h3
            class="mt-6 font-display text-2xl leading-tight font-bold tracking-tight uppercase sm:text-3xl"
            :class="person.lead && 'lg:text-4xl'"
          >
            {{ person.name }}
          </h3>

          <p class="mt-3 font-mono text-sm opacity-70">{{ person.note }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
