<script setup>
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const CONTACT = [
  { label: 'Email', value: 'kelas12rpl@example.com', href: 'mailto:kelas12rpl@example.com' },
  { label: 'Instagram', value: '@rpl.society', href: 'https://instagram.com' },
  { label: 'GitHub', value: '/kelas-12-rpl', href: 'https://github.com' },
]
</script>

<template>
  <section id="kontak" class="bg-acid">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        label="// 05 — HUBUNGI KAMI"
        title="Ada Proyek? Ngobrol."
        accent="bg-ink"
      />

      <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
        <p class="max-w-lg text-xl leading-relaxed sm:text-2xl">
          Mau kerja sama, undang kami lomba, atau sekadar tanya kenapa website
          ini kotak-kotak? Kirim pesan. Kami biasanya balas — kecuali sedang
          <span class="border-4 border-ink bg-ink px-1 text-acid">kejar deadline</span>.
        </p>

        <dl class="brutal-box divide-y-4 divide-ink bg-paper">
          <div
            v-for="item in CONTACT"
            :key="item.label"
            class="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt class="brutal-label text-ink/50">{{ item.label }}</dt>
            <dd>
              <a
                :href="item.href"
                target="_blank"
                rel="noopener noreferrer"
                class="font-display text-lg font-bold tracking-tight underline-offset-4 transition-colors hover:bg-electric hover:text-paper hover:underline"
              >
                {{ item.value }}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <div class="mt-10">
        <BaseButton variant="ink" href="mailto:kelas12rpl@example.com">
          Kirim Email →
        </BaseButton>
      </div>
    </div>
  </section>
</template>
