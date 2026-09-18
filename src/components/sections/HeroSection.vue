<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { useTextScramble } from '@/composables/useTextScramble'
import { useLenis } from '@/composables/useLenis'
import { TOTAL_STUDENTS } from '@/data/students'

// Imported as a module so Vite fingerprints and bundles the file.
// A bare "/images/..." string only works for files inside /public,
// and Vite forbids importing from /public — hence src/assets here.
import heroPhoto from '@/assets/images/12rpl.jpeg'

const { scrollTo } = useLenis()

const { text: rotatingWord } = useTextScramble([
  'NGODING',
  'NGERROR',
  'NGOPI',
  'NGULANG',
])

// Derived from the roster so the hero can never drift out of sync.
const STATS = [
  { value: '12', label: 'Angkatan' },
  { value: String(TOTAL_STUDENTS), label: 'Siswa' },
  { value: '∞', label: 'Baris Kode' },
]
</script>

<template>
  <!--
    Photo background stack (bottom → top):
      -z-20  the class photo, object-cover
      -z-10  a heavy ink scrim  -> guarantees text contrast
      -z-10  light grid lines   -> keeps the brutalist texture
    `isolate` traps both layers inside this section's stacking context.
  -->
  <section
    id="hero"
    class="relative isolate overflow-hidden border-b-4 border-ink bg-ink"
  >
    <!--
      Slight desaturation + contrast lift unifies the busy classroom
      photo and helps the acid/electric accents pop. Dial these two
      values if you want the photo more true-to-life.
    -->
    <img
      :src="heroPhoto"
      alt="Foto bersama siswa-siswi kelas 12 RPL di dalam kelas"
      class="absolute inset-0 -z-20 h-full w-full object-cover object-center contrast-[1.05] grayscale-[0.3]"
    />

    <!--
      Scrim: darker toward the bottom where the text sits.
      Written as an inline style rather than a Tailwind gradient utility
      because v4 renamed `bg-gradient-to-*` to `bg-linear-to-*` — this
      form is correct on every version.
    -->
    <div
      class="absolute inset-0 -z-10"
      style="
        background-image: linear-gradient(
          to top,
          rgba(10, 10, 10, 0.95) 0%,
          rgba(10, 10, 10, 0.78) 45%,
          rgba(10, 10, 10, 0.62) 100%
        );
      "
      aria-hidden="true"
    />
    <div class="brutal-grid-bg-light absolute inset-0 -z-10" aria-hidden="true" />

    <div
      class="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:py-32"
    >
      <!-- Eyebrow -->
      <div class="flex flex-wrap items-center gap-3">
        <p class="brutal-label border-4 border-paper bg-blood px-3 py-1 text-paper">
          // SMK ANTARTIKA 1 SIDOARJO · REKAYASA PERANGKAT LUNAK
        </p>
        <p class="brutal-label border-4 border-paper bg-ink px-3 py-1 text-paper">
          EST. 2026
        </p>
      </div>

      <!-- Massive type block -->
      <div>
        <!--
          "ORANG ORANGAN ERPEEL" is a long string, so it is sized in vw
          rather than rem: 13vw keeps each word on its own line without
          overflowing even on a 320px phone.
        -->
        <h1
          class="font-display text-[13vw] leading-[0.85] font-bold tracking-tighter text-paper uppercase sm:text-[10vw] lg:text-[8.5rem]"
        >
          <span class="block">Orang</span>
          <span class="block">Orangan</span>
          <span
            class="mt-2 inline-block border-4 border-paper bg-acid px-3 text-ink shadow-[8px_8px_0px_0px_rgba(250,250,250,1)] transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[14px_14px_0px_0px_rgba(250,250,250,1)]"
          >
            Erpeel
          </span>
        </h1>

        <!-- Scramble line -->
        <p
          class="mt-4 font-mono text-2xl font-bold tracking-tight text-paper sm:text-4xl lg:text-5xl"
        >
          <span class="text-acid">&gt;</span>
          <span class="ml-3 inline-block min-w-[9ch]">{{ rotatingWord }}</span>
          <span
            class="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.1em] animate-pulse bg-acid align-middle"
          />
        </p>
      </div>

      <!-- Tagline + actions -->
      <div class="grid gap-8 lg:grid-cols-2 lg:items-end">
        <p class="max-w-xl text-lg leading-relaxed text-paper sm:text-xl">
          Kami bukan kelas biasa. Kami kelas yang
          <strong class="border-4 border-paper bg-electric px-1 text-paper"
            >menulis kode jam 3 pagi</strong
          >
          dan tetap datang terlambat. Satu kelas, satu repositori, satu
          kekacauan yang terkendali.
        </p>

        <div class="flex flex-wrap gap-4 lg:justify-end">
          <BaseButton @click="scrollTo('#anggota')">
            Lihat Anggota →
          </BaseButton>
          <BaseButton variant="paper" @click="scrollTo('#tentang')">
            Tentang Kami
          </BaseButton>
        </div>
      </div>

      <!-- Stat strip: opaque surface, so it reads over any photo area. -->
      <dl
        class="grid grid-cols-3 divide-x-4 divide-ink border-4 border-ink bg-paper shadow-[8px_8px_0px_0px_rgba(250,250,250,1)]"
      >
        <div v-for="stat in STATS" :key="stat.label" class="px-4 py-5 sm:px-6">
          <dt class="brutal-label text-ink/50">{{ stat.label }}</dt>
          <dd class="font-display text-4xl font-bold tracking-tighter sm:text-6xl">
            {{ stat.value }}
          </dd>
        </div>
      </dl>

      <!-- Caption badge -->
      <p
        class="self-start border-4 border-paper bg-ink/80 px-3 py-1 font-mono text-xs tracking-wider text-paper"
      >
        FOTO ASLI · XII RPL 1 · {{ TOTAL_STUDENTS }} SISWA
      </p>
    </div>
  </section>
</template>
