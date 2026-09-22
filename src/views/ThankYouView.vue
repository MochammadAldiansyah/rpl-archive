<script setup>
import { RouterLink, useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import MarqueeTicker from '@/components/ui/MarqueeTicker.vue'

const router = useRouter()

/**
 * The sender's name arrives as a query string (?nama=...) so the page
 * can greet them. Falls back to a generic greeting when absent — the
 * normal case for a direct visit or a refresh.
 */
defineProps({
  name: { type: String, default: '' },
})

const NEXT_STEPS = [
  { label: 'Lihat Daftar Anggota', to: '/#anggota' },
  { label: 'Galeri Momen', to: '/#galeri' },
  { label: 'Tentang Kelas', to: '/#tentang' },
]
</script>

<template>
  <section class="border-b-4 border-ink bg-acid">
    <div
      class="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-24"
    >
      <p
        class="inline-block self-start border-4 border-ink bg-ink px-4 py-2 font-mono text-sm font-bold tracking-[0.25em] text-paper uppercase"
      >
        ✓ TERKIRIM
      </p>

      <h1
        class="mt-8 font-display text-[16vw] leading-[0.82] font-bold tracking-tighter uppercase sm:text-[11vw] lg:text-[8rem]"
      >
        Terima<br />Kasih
      </h1>

      <p class="mt-6 max-w-xl text-xl leading-relaxed sm:text-2xl">
        <template v-if="name">
          <span class="font-bold">{{ name }}</span
          >, pesanmu sudah masuk.
        </template>
        <template v-else> Pesanmu sudah masuk. </template>
      </p>

      <p class="mt-4 max-w-xl leading-relaxed text-ink/75">
        Kami biasanya balas dalam 1–2 hari. Kalau mendesak, langsung hubungi
        pengurus kelas lewat WhatsApp.
      </p>

      <!--
        BaseButton renders a <button>; nesting it in a RouterLink would
        produce invalid <a><button> markup. Router navigation goes
        through router.push instead.
      -->
      <div class="mt-10 flex flex-wrap gap-4">
        <BaseButton @click="router.push('/')">Balik ke Home</BaseButton>
        <BaseButton variant="ink" @click="router.push('/#kontak')">
          Kirim Pesan Lain
        </BaseButton>
      </div>

      <!-- Keep the visitor moving instead of dead-ending here -->
      <nav aria-label="Lanjut jelajahi" class="mt-14 border-t-4 border-ink pt-8">
        <p class="brutal-label mb-4 text-ink/60">// SELANJUTNYA</p>
        <ul class="flex flex-wrap gap-3">
          <li v-for="step in NEXT_STEPS" :key="step.to">
            <RouterLink
              :to="step.to"
              class="inline-block border-4 border-ink bg-paper px-4 py-2 font-display text-sm font-bold uppercase transition-colors hover:bg-ink hover:text-paper"
            >
              {{ step.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </section>

  <MarqueeTicker
    text="PESAN DITERIMA · SAMPAI JUMPA"
    surface="bg-ink text-paper"
    reverse
  />
</template>
