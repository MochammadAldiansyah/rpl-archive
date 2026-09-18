/**
 * Site-wide configuration.
 *
 * ⚠️ GANTI `url` dengan domain asli setelah deploy. Nilai ini dipakai
 * untuk canonical URL, Open Graph, sitemap, dan robots.txt.
 *
 * Catatan: `index.html` TIDAK bisa meng-import file ini (HTML statis
 * diproses sebelum JS jalan), jadi kalau domain berubah, ubah di DUA
 * tempat:
 *   1. File ini
 *   2. Tag <link rel="canonical"> dan og:url / og:image di index.html
 */
export const site = {
  name: 'XII RPL 1 — SMK Antartika 1 Sidoarjo',
  shortName: 'XII RPL 1',
  url: 'https://rpl1-antartika.sch.id',
  description:
    'Website resmi kelas XII RPL 1 (Rekayasa Perangkat Lunak) SMK Antartika 1 Sidoarjo. Profil kelas, struktur organisasi, 45 siswa, dan galeri momen.',
  locale: 'id_ID',
  themeColor: '#ffe600',
  school: {
    name: 'SMK Antartika 1 Sidoarjo',
    address: {
      street: 'Jl. Siwalanpanji',
      city: 'Buduran',
      region: 'Sidoarjo',
      postalCode: '61252',
      country: 'ID',
    },
    phone: '+62-31-8962851',
    email: 'smk.antartika1.sda@gmail.com',
    website: 'https://smkantartika1sda.sch.id',
  },
}

/** Absolute URL builder — Open Graph requires absolute URLs. */
export const absoluteUrl = (path = '/') =>
  `${site.url.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
