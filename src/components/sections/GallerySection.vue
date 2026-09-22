<script setup>
import { ref } from 'vue'

import GlyphPortal from '@/components/ui/GlyphPortal.vue'
import { galleryItems, TOTAL_MOMENTS } from '@/data/gallery'
import { padIndex } from '@/utils/format'

import galleryBackground from '@/assets/images/galeri/background.jpeg'

/**
 * Badge colours are a literal class map — Tailwind only ships classes it
 * can see in source, so they can never be built from a string.
 */
const ACCENTS = {
  acid: 'bg-acid text-ink',
  electric: 'bg-electric text-paper',
  blood: 'bg-blood text-paper',
  slime: 'bg-slime text-ink',
  concrete: 'bg-concrete text-ink',
  ink: 'bg-ink text-paper',
}

const accentOf = (key) => ACCENTS[key] ?? ACCENTS.concrete

/**
 * Written by the portal on every scroll frame. Kept in a ref rather than
 * read from the DOM so the template can react to it.
 */
const progress = ref(0)

const onProgress = (value) => {
  progress.value = value
}
</script>

<template>
  <section id="galeri" class="border-b-4 border-ink bg-ink">
    <!--
      The portal opens the section: a scroll-driven camera through the
      word "GALERI", with the class photo revealed inside the letters.
      The gallery grid below is its content slot, so the travel lands the
      visitor directly in the photos rather than in another heading.
    -->
    <GlyphPortal
      word="GALERI"
      focus-char="A"
      :scroll-length="2.2"
      enter-label="Masuk ke galeri"
      @progress="onProgress"
    >
      <!-- Background the letters open onto -->
      <template #background>
        <img
          :src="galleryBackground"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          :style="{ transform: 'scale(var(--gp-field-scale, 1))' }"
        />
        <!-- Scrim so the paper-coloured glyph edges stay legible -->
        <div class="absolute inset-0 bg-ink/55" aria-hidden="true" />
      </template>

      <!-- Opening frame: title, count, scroll hint -->
      <template #front>
        <div
          class="absolute inset-x-0 top-0 flex flex-wrap items-center justify-center gap-3 px-4 pt-6 sm:pt-8"
        >
          <p class="brutal-label brutal-pill border-paper bg-blood px-3 py-1 text-paper">
            // 04 — GALERI &amp; MOMEN
          </p>
          <p class="brutal-label brutal-pill border-paper bg-ink px-3 py-1 text-paper">
            {{ TOTAL_MOMENTS }} FOTO
          </p>
        </div>
      </template>

      <!-- ============ Content revealed after the travel ============ -->
      <div class="mx-auto max-w-7xl">
        <header class="mb-10 sm:mb-14">
          <p class="brutal-label mb-3 text-acid">// 04 — GALERI &amp; MOMEN</p>
          <h2
            class="font-display text-4xl leading-[0.9] font-bold tracking-tighter text-paper uppercase sm:text-6xl lg:text-7xl"
          >
            Bukti Kami
            <span class="rounded-[var(--radius-card)] bg-acid px-2 text-ink">
              Pernah
            </span>
            Di Sini
          </h2>
          <p class="mt-6 max-w-xl leading-relaxed text-paper/70">
            {{ TOTAL_MOMENTS }} momen yang tidak akan pernah masuk ke rapor.
          </p>
        </header>

        <!--
          Irregular grid: auto-rows + per-item col/row-span gives a
          masonry-ish rhythm without a JS masonry library.
        -->
        <div
          class="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <figure
            v-for="(item, index) in galleryItems"
            :key="item.id"
            class="group brutal-tilt relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border-4 border-paper p-5"
            :class="item.span"
          >
            <img
              :src="item.src"
              :alt="item.caption"
              loading="lazy"
              decoding="async"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />

            <!-- Scrim: keeps the caption readable over any photo -->
            <div
              class="absolute inset-0"
              style="
                background-image: linear-gradient(
                  to top,
                  rgba(26, 26, 26, 0.85) 0%,
                  rgba(26, 26, 26, 0.15) 55%,
                  rgba(26, 26, 26, 0.35) 100%
                );
              "
              aria-hidden="true"
            />

            <figcaption
              class="relative z-10 flex h-full flex-col justify-between text-paper"
            >
              <div class="flex items-start justify-between gap-3">
                <span
                  class="brutal-pill px-2 py-0.5 text-[0.65rem] tracking-widest"
                  :class="accentOf(item.accent)"
                >
                  {{ item.tag }}
                </span>
                <span class="font-mono text-xs text-paper/60">
                  {{ padIndex(index + 1) }}
                </span>
              </div>

              <p
                class="mt-8 font-display text-lg leading-tight font-bold tracking-tight uppercase sm:text-xl"
              >
                {{ item.caption }}
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </GlyphPortal>

    <!--
      Progress readout for screen readers only.
      Deliberately NOT aria-hidden: `sr-only` already hides it visually
      while keeping it in the accessibility tree, so pairing the two
      would hide it from everyone and make it pointless.

      `aria-live="off"` on purpose — this value changes every frame, and a
      polite live region would flood the reader with announcements.
    -->
    <p class="sr-only" aria-live="off">
      Galeri berisi {{ TOTAL_MOMENTS }} foto. Progres gulir
      {{ Math.round(progress * 100) }} persen.
    </p>
  </section>
</template>
