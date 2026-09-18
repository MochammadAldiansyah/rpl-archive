# Kelas 12 RPL — Website Kelas

Website resmi kelas **12 RPL (Rekayasa Perangkat Lunak)**. Dibangun dengan
gaya **Brutalist / Neo-Brutalist**: kontras tinggi, border tebal, shadow
solid tanpa blur, dan tipografi raksasa.

## Stack

| Bagian | Teknologi |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 (`@theme` tokens, tanpa `tailwind.config.js`) |
| Routing | Vue Router 4 |
| Smooth scroll | Lenis (`lenis` — penerus `@studio-freight/lenis`) |
| Font | Space Grotesk · Inter · JetBrains Mono |

## Menjalankan

```bash
npm install
npm run icons    # generate favicon + og-image dari logo (sekali saja)
npm run dev      # http://localhost:5173
npm run build    # produksi
npm run preview  # cek hasil build
```

## SEO

| Berkas | Isi |
|---|---|
| `index.html` | Title, meta description, canonical, Open Graph, Twitter Card, JSON-LD |
| `src/config/site.js` | Nama situs, deskripsi, alamat sekolah — dipakai router |
| `public/robots.txt` | Aturan crawler + lokasi sitemap |
| `public/site.webmanifest` | Metadata PWA (nama, ikon, theme color) |
| `vite-plugins/sitemap.js` | Generate `sitemap.xml` otomatis saat build |
| `public/og-image.jpg` | Gambar preview saat link dibagikan (1200×630) |

### ⚠️ Ganti domain sebelum deploy

Domain saat ini masih placeholder `https://rpl1-antartika.sch.id`.
Ganti di **empat** tempat:

1. `vite.config.js` → `SITE_URL`
2. `index.html` → `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, JSON-LD
3. `public/robots.txt` → baris `Sitemap:`
4. `src/config/site.js` → `site.url`

Sitemap otomatis ikut berubah karena di-generate dari `SITE_URL` saat build.

## Favicon

Favicon dibuat dari **`src/assets/images/logo.jpeg`**:

```bash
npm run icons
```

Menghasilkan `favicon-16x16.png`, `favicon-32x32.png`,
`apple-touch-icon.png`, `android-chrome-192x192.png`,
`android-chrome-512x512.png`, dan `og-image.jpg` (dari foto kelas).

Butuh `sharp` — kalau belum ada: `npm install -D sharp`.

**Fallback:** `public/favicon.svg` adalah badge vektor yang selalu ada,
jadi tab browser tidak pernah kosong walau PNG belum di-generate.

## Struktur

```
src/
├── assets/css/main.css      # Token desain brutalist + primitif komponen
├── assets/images/           # logo.jpeg, 12rpl.jpeg
├── components/
│   ├── layout/              # AppNavbar, AppFooter
│   ├── sections/            # 6 section utama halaman
│   └── ui/                  # BaseButton, BaseCard, MarqueeTicker, FrameworkStrip, FrameworkLogo, SectionHeading
├── composables/
│   ├── useLenis.js          # Singleton smooth-scroll
│   └── useTextScramble.js   # Efek decode pada hero
├── config/site.js           # Identitas situs (SEO)
├── data/                    # ⚠️ MOCK DATA — ganti dengan data asli
├── layouts/MainLayout.vue   # Navbar + slot + Footer
├── router/index.js
├── utils/format.js
└── views/HomeView.vue
```

## Aset

Foto kelas asli ada di **`src/assets/images/12rpl.jpeg`** dan dipakai
sebagai background hero.

> **Kenapa di `src/assets`, bukan `public/`?**
> File di `public/` di-serve apa adanya dan **tidak boleh di-import**
> sebagai module — Vite akan menolaknya. Karena hero memakai `import`,
> fotonya harus berada di `src/assets/`. Vite lalu mem-fingerprint file
> tersebut (nama ber-hash saat build) sehingga caching-nya optimal.

Kalau mengganti foto, timpa file dengan nama yang sama. Kalau nama
filenya berbeda, ubah baris import di
`src/components/sections/HeroSection.vue`:

```js
import heroPhoto from '@/assets/images/12rpl.jpeg'
```

Dua nilai yang bisa disetel di hero kalau fotonya terasa terlalu gelap
atau terlalu pudar:

```
contrast-[1.05]   → naikkan untuk foto lebih "nendang"
grayscale-[0.3]   → turunkan ke grayscale-[0] untuk warna asli
```

Opacity scrim ada di `style="background-image: linear-gradient(...)"`
pada file yang sama.

## Mengganti Data Mock

Semua data palsu terisolasi di `src/data/`:

- **`students.js`** — daftar **45 siswa**. Ditulis sebagai tuple
  `[nama, panggilan, jabatan, skill[], quote, accent]` lalu di-map,
  jadi mengganti data cukup mengedit satu baris per siswa.
  `TOTAL_STUDENTS` diekspor dan dipakai hero stat — angka di hero
  otomatis ikut berubah, tidak akan basi.
- **`organisation.js`** — struktur organisasi kelas.
- **`gallery.js`** — slot galeri. Tambahkan `src: '/images/foo.jpg'`
  pada sebuah item dan gambarnya otomatis menggantikan blok warna.

### Catatan `accent`

Nilai `accent` **harus** salah satu dari kunci yang ada di peta `ACCENTS`
pada masing-masing section (`acid`, `electric`, `blood`, `slime`,
`concrete`, `ink`). Tailwind hanya mengirim class yang terlihat di source
code, jadi warna tidak boleh dirakit dari string.

## Palet

| Token | Hex | Utilitas |
|---|---|---|
| `ink` | `#0a0a0a` | `bg-ink` |
| `paper` | `#fafafa` | `bg-paper` |
| `acid` | `#ffe600` | `bg-acid` |
| `electric` | `#2b5cff` | `bg-electric` |
| `blood` | `#ff2d2d` | `bg-blood` |
| `slime` | `#00d46a` | `bg-slime` |
| `concrete` | `#c9c9c9` | `bg-concrete` |

Shadow: `shadow-brutal-xs` → `shadow-brutal-xl` (semua tanpa blur).

## Catatan Teknis

**Lenis + Vue Router.** Lenis memiliki posisi scroll, sehingga
`scrollBehavior()` pada router mengembalikan `false` — router tidak boleh
ikut menggulir. Reset posisi dilakukan lewat `lenis.scrollTo(0)` di
`afterEach`.

**Mobile.** `syncTouch: false` — di perangkat sentuh, momentum scroll
native lebih mulus daripada yang digerakkan JS.

**Reduced motion.** `useLenis` dan `useTextScramble` sama-sama mundur
sepenuhnya bila `prefers-reduced-motion: reduce` aktif.

**Tailwind v4.** Token didefinisikan di blok `@theme` dalam
`src/assets/css/main.css`, bukan `tailwind.config.js`. Menambah warna
cukup dengan menambah `--color-nama` di sana.
