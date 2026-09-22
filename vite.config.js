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
      /**
       * Only indexable pages belong here.
       * Deliberately EXCLUDED: /terima-kasih (a post-submit page with no
       * standalone value) and every error route — submitting a 404 to
       * Google is a soft-404 signal.
       */
      routes: ['/'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
