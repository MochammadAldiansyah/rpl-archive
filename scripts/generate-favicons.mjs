/**
 * Generate favicon + PWA icons from the class logo.
 *
 * Usage:
 *   npm install --no-save sharp
 *   npm run icons
 *
 * Reads  : src/assets/images/logo.jpeg
 * Writes : public/favicon-16x16.png
 *          public/favicon-32x32.png
 *          public/apple-touch-icon.png       (180x180)
 *          public/android-chrome-192x192.png
 *          public/android-chrome-512x512.png
 *          public/og-image.jpg               (1200x630, from the class photo)
 *
 * ⚠️ Install sharp dengan `--no-save` — JANGAN masuk package.json.
 * sharp mengunduh binary native per-platform, dan kalau ada di
 * devDependencies maka Vercel ikut meng-install-nya saat build,
 * yang membuat deploy jauh lebih lambat tanpa manfaat apa pun.
 *
 * Hasil PNG-nya di-commit ke git, jadi Vercel tidak perlu sharp.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LOGO = resolve(root, 'src/assets/images/logo.jpeg')
const PHOTO = resolve(root, 'src/assets/images/12rpl.jpeg')
const OUT = resolve(root, 'public')

/** Icons rendered straight from the square logo. */
const ICONS = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 },
]

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error(
    '\n✖ sharp tidak terpasang.\n' +
      '  Jalankan:  npm install --no-save sharp\n' +
      '  lalu ulangi: npm run icons\n' +
      '\n  (--no-save penting: agar tidak memperlambat build Vercel)\n',
  )
  process.exit(1)
}

if (!existsSync(LOGO)) {
  console.error(`\n✖ Logo tidak ditemukan: ${LOGO}\n`)
  process.exit(1)
}

await mkdir(OUT, { recursive: true })

// --- Icons from the logo -------------------------------------------------
const logoBuf = await readFile(LOGO)

for (const { file, size } of ICONS) {
  await sharp(logoBuf)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(OUT, file))
  console.log(`✓ ${file}  (${size}×${size})`)
}

// --- Open Graph image from the class photo -------------------------------
if (existsSync(PHOTO)) {
  await sharp(await readFile(PHOTO))
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(resolve(OUT, 'og-image.jpg'))
  console.log('✓ og-image.jpg  (1200×630)')
} else {
  console.warn(`⚠ Foto kelas tidak ditemukan, og-image.jpg dilewati: ${PHOTO}`)
}

console.log('\nSelesai. Semua ikon ada di folder public/\n')
