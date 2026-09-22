<script setup>
import { ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { useTextScramble } from '@/composables/useTextScramble'
import { useLenis } from '@/composables/useLenis'
import { useParallax } from '@/composables/useParallax'
import { TOTAL_STUDENTS } from '@/data/students'

import heroPhoto from '@/assets/images/12rpl.jpeg'
import classLogo from '@/assets/images/logo.jpeg'

const { scrollTo } = useLenis()

const { text: rotatingWord } = useTextScramble([
  'NGODING',
  'NGERROR',
  'NGOPI',
  'NGULANG',
])

// Derived from the roster so the hero can never drift out of sync.
const STATS = [
  { value: '-', label: 'Angkatan' },
  { value: String(TOTAL_STUDENTS), label: 'Siswa' },
  { value: '∞', label: 'Baris Kode' },
]

/**
 * Parallax layers.
 *
 * Every layer translates DOWNWARD as the section scrolls up. A layer that
 * moves down more therefore appears to scroll up more slowly, which reads
 * as being farther away:
 *
 *   layer 1  +20%  class photo + scrim  — far background
 *   layer 2  + 9%  the title            — subject
 *   layer 3  + 3%  class logo           — near foreground
 *
 * ⚠️ These are NOT the reference component's 70/55/40/10 values.
 *
 * `yPercent` is a percentage of the ELEMENT'S OWN height, so the original
 * numbers only work with the oversized artwork its own stylesheet
 * assumed — which was not part of the snippet. Applied to an element that
 * merely fills the stage, `yPercent: 70` slides the photo down by 70% of
 * the stage height and leaves the top of the hero empty.
 *
 * The values here are derived so the photo is guaranteed to still cover
 * the stage at every scroll position. With the photo at 140% height
 * starting 32% above the stage:
 *
 *   at rest : spans [-0.32H, +1.08H]  -> covers [0, H]
 *   at end  : shifts down 0.20 x 1.40H = 0.28H
 *             spans [-0.04H, +1.36H]  -> still covers [0, H]
 *
 * The 0.04H of headroom is the safety margin. Raising any yPercent here
 * without also growing the layer will re-introduce the gap.
 *
 * The spread between the values is what creates the depth — equal values
 * would make every layer move as one flat sheet.
 */
const LAYERS = [
  { layer: '1', yPercent: 20 },
  { layer: '2', yPercent: 9 },
  { layer: '3', yPercent: 3 },
]

const containerRef = ref(null)
useParallax(containerRef, LAYERS)
</script>

<template>
  <!--
    HERO
    ====
    A parallax stage (photo + title + logo, moving at different speeds)
    followed by a solid body holding the tagline, actions and stats.

      .hero-stage          the parallax viewport
      .hero-stage__visuals the stack the layers live in
      [data-parallax-layer] marks each layer for useParallax

    Three layers only: photo (slowest), title, logo (fastest). An
    earlier version added a fourth layer of flat colour blocks and a
    frame border; both sat on top of the photograph and were removed.

    The reference component's `.osmo-credits` block and its decorative
    SVG are dropped — they credit the demo's author and have no place
    here.
  -->
  <section id="hero" class="border-b-4 border-ink bg-ink">
    <!-- ==================== PARALLAX STAGE ==================== -->
    <div
      ref="containerRef"
      class="hero-stage relative isolate h-[92svh] min-h-[34rem] overflow-hidden"
    >
      <div class="hero-stage__visuals absolute inset-0">
        <!--
          Layer 1 — class photo, the deepest plane.

          Oversized and pulled up so that translating it downward by
          20% of its own height still leaves it covering the stage.
          At 140% tall starting 32% above the top:
            rest   -> spans [-32%, 108%]  covers the stage
            end    -> shifts +28%         spans [-4%, 136%]  still covers
          The 4% headroom is the margin. Shrinking this image, or raising
          yPercent for layer 1, will open a gap at the bottom.

          Grayscale is kept very light (0.15) — the photo is the point of
          this section, and heavy desaturation was making it read as a
          grey texture rather than a picture of the class.
        -->
        <img
          :src="heroPhoto"
          alt="Foto bersama siswa-siswi kelas XII RPL 1 di dalam kelas"
          loading="eager"
          decoding="async"
          data-parallax-layer="1"
          class="hero-layer absolute -top-[32%] left-0 h-[140%] w-full object-cover object-center contrast-[1.05] grayscale-[0.15]"
        />

        <!--
          Layer 1 scrim.

          Kept as light as readability allows. An earlier version ran to
          94% opacity, which effectively erased the photo — the hero read
          as a dark rectangle with text on it, and the class photo it was
          supposed to show was invisible.

          Deliberately lightest at the TOP so the students' faces stay
          visible, darkening toward the bottom where the eyebrow badges
          and the stage's lower edge need the contrast.
        -->
        <div
          class="hero-layer absolute -top-[32%] left-0 h-[140%] w-full"
          data-parallax-layer="1"
          style="
            background-image: linear-gradient(
              to bottom,
              rgba(26, 26, 26, 0.5) 0%,
              rgba(26, 26, 26, 0.72) 45%,
              rgba(26, 26, 26, 0.82) 100%
            );
          "
          aria-hidden="true"
        />

        <!--
          Layer 2 — the title.

          There is deliberately no decorative layer between the photo
          and the title. An earlier version placed three flat colour
          blocks here; they sat directly over the students' faces,
          competed with the photo for attention, and read as shapes
          with no reason to exist. The photo is the decoration — it
          does not need flat colour dropped on top of it.
        -->
        <div
          data-parallax-layer="2"
          class="hero-layer absolute inset-0 flex items-center justify-center px-4"
        >
          <h1
            class="text-center font-display text-[17vw] leading-[0.82] font-bold tracking-tighter text-paper uppercase sm:text-[13vw] lg:text-[9rem]"
          >
            <span class="block">Orang</span>
            <span class="block">Orangan</span>
            <span
              class="mt-2 inline-block rounded-[var(--radius-card)] border-4 border-paper bg-acid px-3 text-ink shadow-[8px_8px_0px_0px_rgba(255,248,231,1)]"
            >
              Erpeel
            </span>
          </h1>
        </div>

        <!--
          Layer 3 — the class logo.

          The inset frame that used to live here is gone too: a border
          tracing the whole viewport reads as a box drawn around the
          photograph. The logo earns its place — it is the class's own
          mark, not filler.
        -->
        <div
          data-parallax-layer="3"
          class="hero-layer pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <img
            :src="classLogo"
            alt=""
            loading="eager"
            decoding="async"
            class="absolute right-4 bottom-6 h-20 w-20 rounded-[var(--radius-card)] border-4 border-paper object-cover shadow-[6px_6px_0px_0px_rgba(255,248,231,1)] sm:right-8 sm:bottom-10 sm:h-28 sm:w-28"
          />
        </div>

        <!--
          Bottom edge.
          Blends the stage into the solid body below so there is no hard
          seam. Kept short (h-16) because the scrim above already darkens
          this area — a tall second gradient on top of it just crushes
          the bottom of the photo to black.
        -->
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style="
            background-image: linear-gradient(
              to top,
              #1a1a1a 0%,
              rgba(26, 26, 26, 0) 100%
            );
          "
          aria-hidden="true"
        />
      </div>

      <!-- Eyebrow badges float above the stage -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-center gap-3 px-4 pt-6 sm:pt-8"
      >
        <p class="brutal-label brutal-pill border-paper bg-ink px-3 py-1 text-paper">
          // SMK ANTARTIKA 1 SIDOARJO · REKAYASA PERANGKAT LUNAK
        </p>
        <p class="brutal-label brutal-pill border-paper bg-ink px-3 py-1 text-paper">
          EST. 2026
        </p>
      </div>
    </div>

    <!-- ==================== HERO BODY ==================== -->
    <div class="relative bg-ink">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-20"
      >
        <!-- Scramble line -->
        <p
          class="font-mono text-2xl font-bold tracking-tight text-paper sm:text-4xl lg:text-5xl"
        >
          <span class="text-acid">&gt;</span>
          <span class="ml-3 inline-block min-w-[9ch]">{{ rotatingWord }}</span>
          <span
            class="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.1em] animate-pulse bg-acid align-middle"
          />
        </p>

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
            <BaseButton @click="scrollTo('#anggota')">Lihat Anggota →</BaseButton>
            <BaseButton variant="paper" @click="scrollTo('#tentang')">
              Tentang Kami
            </BaseButton>
          </div>
        </div>

        <!-- Stat strip -->
        <dl
          class="grid grid-cols-3 divide-x-4 divide-ink overflow-hidden rounded-[var(--radius-card)] border-4 border-ink bg-paper shadow-[8px_8px_0px_0px_rgba(255,248,231,1)]"
        >
          <div v-for="stat in STATS" :key="stat.label" class="px-4 py-5 sm:px-6">
            <dt class="brutal-label text-ink/50">{{ stat.label }}</dt>
            <dd
              class="font-display text-4xl font-bold tracking-tighter sm:text-6xl"
            >
              {{ stat.value }}
            </dd>
          </div>
        </dl>

        <!-- Caption badge -->
        <p
          class="brutal-pill self-start border-paper bg-ink/80 px-3 py-1 font-mono text-xs tracking-wider text-paper"
        >
          Orang-Orangan Erpeel
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
  `will-change: transform` promotes each layer to its own compositor
  layer, so the per-frame translate stays off the main thread. Three
  layers is a safe number to promote; promoting dozens would cost more
  memory than it saves.
*/
.hero-layer {
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  /*
    Layers are left at their resting position by useParallax, so nothing
    moves. will-change is dropped because no transform will occur.
  */
  .hero-layer {
    will-change: auto;
  }
}
</style>
