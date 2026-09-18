<script setup>
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const PILLARS = [
  {
    index: '01',
    title: 'Bikin Dulu',
    body: 'Rencana sempurna tidak pernah dikirim. Kami menulis, menghapus, lalu menulis lagi sampai jalan.',
    accent: 'bg-acid',
  },
  {
    index: '02',
    title: 'Hancurkan, Lalu Perbaiki',
    body: 'Bug bukan aib. Bug adalah bukti bahwa kode kita benar-benar dijalankan.',
    accent: 'bg-electric',
  },
  {
    index: '03',
    title: 'Satu Kelas, Satu Tim',
    body: 'Yang jago ngoding bantu yang baru mulai. Tidak ada yang lulus sendirian.',
    accent: 'bg-blood',
  },
]
</script>

<template>
  <section id="tentang" class="border-b-4 border-ink bg-paper">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        label="// 01 — TENTANG KAMI"
        title="Bukan Sekadar Kelas"
        accent="bg-acid"
      />

      <div class="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <!-- Narrative -->
        <div class="lg:col-span-7">
          <p class="text-xl leading-relaxed sm:text-2xl">
            12 RPL adalah kumpulan orang yang memilih jalan yang lebih sulit:
            <span class="border-4 border-ink bg-acid px-1 font-bold"
              >membangun sesuatu dari nol</span
            >, baris demi baris.
          </p>

          <p class="mt-6 leading-relaxed text-ink/80">
            Kami belajar Rekayasa Perangkat Lunak — bukan cuma menulis kode,
            tapi berpikir sistematis: memecah masalah besar jadi bagian kecil,
            memilih alat yang tepat, dan bertanggung jawab saat semuanya
            berantakan. Di sini, error adalah guru dan deadline adalah musuh
            bersama.
          </p>

          <p class="mt-6 leading-relaxed text-ink/80">
            Website ini adalah rumah kami di internet. Tempat kami
            mendokumentasikan siapa kami, apa yang kami bangun, dan momen-momen
            yang tidak akan pernah masuk ke rapor.
          </p>
        </div>

        <!-- Manifesto block -->
        <aside class="lg:col-span-5">
          <div class="brutal-box bg-ink p-6 text-paper sm:p-8">
            <p class="brutal-label mb-4 text-acid">// MANIFESTO</p>
            <blockquote
              class="font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl"
            >
              “Kode yang jelek tapi jalan lebih berguna daripada kode indah yang
              tidak pernah selesai.”
            </blockquote>
            <p class="mt-6 font-mono text-sm text-concrete">
              — Kesepakatan tidak tertulis, kelas 12 RPL
            </p>
          </div>
        </aside>
      </div>

      <!-- Pillars -->
      <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BaseCard v-for="pillar in PILLARS" :key="pillar.index" surface="bg-paper">
          <div
            class="mb-5 inline-block border-4 border-ink px-3 py-1 font-display text-xl font-bold"
            :class="pillar.accent"
          >
            {{ pillar.index }}
          </div>
          <h3 class="font-display text-2xl font-bold tracking-tight uppercase">
            {{ pillar.title }}
          </h3>
          <p class="mt-3 leading-relaxed text-ink/75">{{ pillar.body }}</p>
        </BaseCard>
      </div>
    </div>
  </section>
</template>
