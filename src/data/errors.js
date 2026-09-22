/**
 * Error page content, keyed by HTTP status code.
 *
 * One ErrorView renders all of these — the route's `meta.code` picks the
 * entry. Adding a new error code means adding one object here plus one
 * route; no new component.
 *
 * Tone note: the copy stays in the class's voice (dry, self-aware) but
 * never blames the visitor. A 404 is our broken link, not their mistake.
 */
export const errorPages = {
  403: {
    code: '403',
    title: 'Akses Ditolak',
    lead: 'Halaman ini bukan untuk umum.',
    body: 'Kalau kamu merasa seharusnya bisa masuk, hubungi pengurus kelas untuk minta akses.',
    accent: 'bg-blood',
    action: { label: 'Balik ke Home', to: '/' },
  },
  404: {
    code: '404',
    title: 'Halaman Hilang',
    lead: 'Halaman yang kamu cari tidak ada.',
    body: 'Mungkin salah ketik, mungkin link-nya sudah kedaluwarsa, atau mungkin kita memang belum pernah bikin halaman itu.',
    accent: 'bg-acid',
    action: { label: 'Balik ke Home', to: '/' },
    secondary: { label: 'Lihat Anggota', to: '/#anggota' },
  },
  500: {
    code: '500',
    title: 'Server Error',
    lead: 'Ada yang rusak di sisi kami.',
    body: 'Bukan salahmu. Ini bug di kode kami — dan kami sedang memperbaikinya. Coba muat ulang sebentar lagi.',
    accent: 'bg-electric',
    action: { label: 'Muat Ulang', reload: true },
    secondary: { label: 'Balik ke Home', to: '/' },
  },
  503: {
    code: '503',
    title: 'Sedang Maintenance',
    lead: 'Kami sedang beresin sesuatu.',
    body: 'Website ini sedang diperbarui. Coba lagi beberapa saat lagi — biasanya tidak lama.',
    accent: 'bg-slime',
    action: { label: 'Muat Ulang', reload: true },
  },
}

/** Fallback so an unknown code still renders something sensible. */
export const defaultError = errorPages[404]

export const errorOf = (code) => errorPages[code] ?? defaultError
