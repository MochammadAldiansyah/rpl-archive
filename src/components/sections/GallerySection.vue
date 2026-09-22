<script setup>
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { galleryItems } from '@/data/gallery'
import { padIndex } from '@/utils/format'

/** Literal class maps — see RosterSection for the rationale. */
const ACCENTS = {
  acid: { surface: 'bg-acid text-ink', badge: 'bg-ink text-paper' },
  electric: { surface: 'bg-electric text-paper', badge: 'bg-paper text-ink' },
  blood: { surface: 'bg-blood text-paper', badge: 'bg-paper text-ink' },
  slime: { surface: 'bg-slime text-ink', badge: 'bg-ink text-paper' },
  concrete: { surface: 'bg-concrete text-ink', badge: 'bg-ink text-paper' },
  ink: { surface: 'bg-ink text-paper', badge: 'bg-acid text-ink' },
}

const accentOf = (key) => ACCENTS[key] ?? ACCENTS.concrete
</script>

<template>
  <section id="galeri" class="border-b-4 border-ink bg-paper">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        label="// 04 — GALERI & MOMEN"
        title="Bukti Kami Pernah Di Sini"
        accent="bg-blood"
      />

      <!--
        Irregular grid: dense auto-flow + per-item lg:col/row-span gives a
        masonry-ish rhythm without a JS masonry library.
      -->
      <div
        class="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <figure
          v-for="(item, index) in galleryItems"
          :key="item.id"
          class="group brutal-box brutal-tilt relative flex flex-col justify-between overflow-hidden p-5"
          :class="[accentOf(item.accent).surface, item.span]"
        >
          <!-- Real photo drops in here later; the colour block is the fallback. -->
          <img
            v-if="item.src"
            :src="item.src"
            :alt="item.caption"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover"
          />

          <figcaption
            v-else
            class="relative z-10 flex h-full flex-col justify-between"
          >
            <div class="flex items-start justify-between gap-3">
              <span
                class="brutal-pill border-current px-2 py-0.5 text-[0.65rem] tracking-widest"
              >
                {{ item.tag }}
              </span>
              <span class="font-mono text-xs opacity-50">
                {{ padIndex(index + 1) }}
              </span>
            </div>

            <p
              class="mt-8 font-display text-xl leading-tight font-bold tracking-tight uppercase sm:text-2xl"
            >
              {{ item.caption }}
            </p>
          </figcaption>

          <!-- Hover scrim: hard-edged, no soft gradient. -->
          <span
            class="pointer-events-none absolute inset-0 translate-y-full bg-ink/0 transition-transform duration-300 group-hover:translate-y-0 group-hover:bg-ink/10"
            aria-hidden="true"
          />
        </figure>
      </div>

      <p class="mt-8 font-mono text-sm text-ink/50">
        * Slot foto masih placeholder — ganti dengan gambar asli di
        <code class="border-2 border-ink bg-acid px-1">src/data/gallery.js</code>.
      </p>
    </div>
  </section>
</template>
