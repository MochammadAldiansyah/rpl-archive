/**
 * MOCK DATA — gallery slots.
 *
 * These are intentionally asset-free: each tile renders as a solid
 * brutalist colour block with a caption, so the layout is final and
 * real photos can be dropped in later without touching the grid.
 *
 * To use real images: add `src: '/images/moments/foo.jpg'` to an item
 * and GallerySection will render an <img> instead of the colour block.
 *
 * `span` controls the irregular grid placement on large screens.
 */
export const galleryItems = [
  {
    id: 1,
    caption: 'Praktikum pertama, error pertama.',
    tag: 'LAB',
    accent: 'acid',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    id: 2,
    caption: 'Deadline jam 23:59.',
    tag: 'SPRINT',
    accent: 'electric',
    span: '',
  },
  {
    id: 3,
    caption: 'Kopi keempat, entah jam berapa.',
    tag: 'NGEBUG',
    accent: 'blood',
    span: '',
  },
  {
    id: 4,
    caption: 'Presentasi proyek akhir.',
    tag: 'DEMO',
    accent: 'ink',
    span: 'lg:col-span-2',
  },
  {
    id: 5,
    caption: 'Foto bareng sebelum lulus.',
    tag: 'MOMEN',
    accent: 'slime',
    span: '',
  },
  {
    id: 6,
    caption: 'Rapat organisasi yang molor.',
    tag: 'RAPAT',
    accent: 'concrete',
    span: '',
  },
  {
    id: 7,
    caption: 'Turnamen futsal antar jurusan.',
    tag: 'OLAHRAGA',
    accent: 'acid',
    span: 'lg:col-span-2',
  },
]
