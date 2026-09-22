<script setup>
import { RouterLink } from 'vue-router'

import MarqueeTicker from '@/components/ui/MarqueeTicker.vue'
import classLogo from '@/assets/images/logo.jpeg'

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'GitHub', href: 'https://github.com' },
]

/**
 * Internal links. A footer sitemap is one of the strongest internal
 * linking signals: it puts every section one click from anywhere, which
 * helps both crawlers and users who reached a dead end.
 */
const PAGES = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang', to: '/#tentang' },
  { label: 'Struktur', to: '/#struktur' },
  { label: 'Anggota', to: '/#anggota' },
  { label: 'Galeri', to: '/#galeri' },
  { label: 'Kontak', to: '/#kontak' },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-auto">
    <!-- Marquee ticker sits directly above the footer, as specified. -->
    <MarqueeTicker text="KELAS 12 RPL · SATU KODE SATU KEKACAUAN" surface="bg-acid text-ink" />

    <div class="bg-ink text-paper">
      <div
        class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <!-- Identity — mirrors the hero wordmark -->
        <div>
          <div class="flex items-center gap-4">
            <img
              :src="classLogo"
              alt="Logo XII RPL — SMK Antartika 1 Sidoarjo"
              class="h-16 w-16 rounded-full border-4 border-paper object-cover sm:h-20 sm:w-20"
            />
            <p
              class="font-display text-3xl leading-[0.9] font-bold tracking-tighter uppercase sm:text-4xl"
            >
              Orang<br />Orangan<br />
              <span class="inline-block bg-acid px-1 text-ink">Erpeel</span>
            </p>
          </div>
          <p class="mt-4 max-w-xs font-mono text-sm text-concrete">
            Rekayasa Perangkat Lunak. Kami tidak menulis kode — kami menulis
            masa depan.
          </p>
        </div>

        <!-- Socials -->
        <nav aria-label="Tautan sosial">
          <p class="brutal-label mb-4 text-acid">Ikuti Kami</p>
          <ul class="flex flex-wrap gap-3">
            <li v-for="social in SOCIALS" :key="social.label">
              <a
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block rounded-[var(--radius-control)] border-4 border-paper px-4 py-2 font-display text-sm font-bold uppercase tracking-tight transition-all duration-200 hover:-translate-y-1 hover:bg-acid hover:text-ink"
              >
                {{ social.label }}
              </a>
            </li>
          </ul>
        </nav>

        <!-- Meta -->
        <div class="md:col-span-2 lg:col-span-1">
          <p class="brutal-label mb-4 text-acid">Info</p>
          <p class="font-mono text-sm text-concrete">
            SMK · Jurusan RPL<br />
            Angkatan {{ year - 1 }}/{{ year }}
          </p>
        </div>

        <!-- Internal sitemap -->
        <nav
          aria-label="Peta situs"
          class="border-t-4 border-paper pt-8 md:col-span-2 lg:col-span-3"
        >
          <p class="brutal-label mb-4 text-acid">// Peta Situs</p>
          <ul class="flex flex-wrap gap-x-6 gap-y-2">
            <li v-for="page in PAGES" :key="page.to">
              <RouterLink
                :to="page.to"
                class="font-mono text-sm text-concrete underline-offset-4 transition-colors hover:text-acid hover:underline"
              >
                {{ page.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="border-t-4 border-paper">
        <p
          class="mx-auto max-w-7xl px-4 py-4 font-mono text-xs tracking-wider text-concrete sm:px-6"
        >
          © {{ year }} Kelas 12 RPL — SMK Antartika 1 Sidoarjo. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
