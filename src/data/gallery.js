/**
 * Galeri & momen kelas.
 *
 * Foto asli ada di `src/assets/images/galeri/`. Di-import sebagai module
 * (bukan path string) supaya Vite mem-fingerprint filenya saat build.
 *
 * ⚠️ `2.jpeg` dan `3.jpeg` di folder itu adalah file yang SAMA
 * (md5 identik), jadi hanya satu yang dipakai. Ganti salah satunya
 * dengan foto berbeda lalu tambahkan entri baru di bawah kalau mau
 * menampilkannya.
 *
 * `span` mengatur penempatan di grid besar; `accent` hanya untuk warna
 * badge.
 */
import photo1 from '@/assets/images/galeri/1.jpeg'
import photo2 from '@/assets/images/galeri/2.jpeg'
import photo4 from '@/assets/images/galeri/4.jpeg'
import photo5 from '@/assets/images/galeri/5.jpeg'
import photo6 from '@/assets/images/galeri/6.jpeg'

export const galleryItems = [
  {
    id: 1,
    src: photo1,
    caption: 'Dukung teman di lomba solo vocal.',
    tag: 'LOMBA',
    accent: 'acid',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    id: 2,
    src: photo2,
    caption: 'Latihan bareng sebelum tampil.',
    tag: 'LATIHAN',
    accent: 'electric',
    span: '',
  },
  {
    id: 3,
    src: photo4,
    caption: 'Istirahat di sela pelajaran.',
    tag: 'ISTIRAHAT',
    accent: 'ink',
    span: 'lg:col-span-2',
  },
  {
    id: 4,
    src: photo5,
    caption: 'Kegiatan kelas di luar jam pelajaran.',
    tag: 'KEGIATAN',
    accent: 'slime',
    span: '',
  },
  {
    id: 5,
    src: photo6,
    caption: 'Foto bersama sebelum pulang.',
    tag: 'MOMEN',
    accent: 'concrete',
    span: '',
  },
]

export const TOTAL_MOMENTS = galleryItems.length
