import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import { sitemap } from './vite-plugins/sitemap.js'

/**
 * ⚠️ Ganti dengan domain asli setelah deploy.
 * Nilai ini juga dipakai di index.html (canonical, og:url) dan
 * public/robots.txt — ubah ketiganya bersamaan.
 */
const SITE_URL = 'https://rpl1-antartika.sch.id'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    sitemap({
      siteUrl: SITE_URL,
      // Tambahkan route di sini kalau nanti ada halaman baru.
      routes: ['/'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
