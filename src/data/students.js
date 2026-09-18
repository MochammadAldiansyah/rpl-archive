/**
 * DATA SISWA — 45 siswa kelas XII RPL 1.
 * Nama diambil dari daftar resmi kelas (SMK Antartika 1 Sidoarjo).
 *
 * ⚠️ CATATAN: `skills`, `quote`, dan `accent` di bawah ini MASIH MOCK /
 * placeholder. Ganti sesuai data asli masing-masing siswa.
 *
 * Format: [nama, panggilan, jabatan, skill[], quote, accent]
 *
 * `accent` WAJIB salah satu kunci di ACCENTS pada RosterSection.vue
 * (acid | electric | blood | slime). Tailwind tidak bisa membaca class
 * yang dirakit dari string, jadi warnanya harus lewat peta literal.
 *
 * Jabatan pengurus (baris 1–5) masih asumsi — sesuaikan dengan
 * struktur organisasi kelas yang sebenarnya.
 */
const RAW = [
  // --- Pengurus inti (asumsi — sesuaikan) ---
  ['Abiyan Abdhul Riesky', 'Abiyan', 'Ketua Kelas', ['Vue', 'Laravel'], 'Kode rapi, hidup rapi.', 'acid'],
  ['Abrisyam Ahnaf Santoso', 'Abrisyam', 'Wakil Ketua', ['UI/UX', 'Figma'], 'Desain dulu, ngoding kemudian.', 'electric'],
  ['Achmad Afril Bagus Prasetyo', 'Afril', 'Sekretaris', ['Node.js', 'MongoDB'], 'Kalau bisa diotomasi, kenapa manual?', 'blood'],
  ['Achmad Sandi Maulana Syifa', 'Sandi', 'Bendahara', ['Python', 'Data'], 'Anggaran dan algoritma sama-sama butuh presisi.', 'slime'],
  ['Badar Mac Fadhil', 'Badar', 'Koord. Keamanan', ['React', 'Tailwind'], 'Frontend itu seni yang bisa diklik.', 'electric'],

  // --- Anggota ---
  ['Claresta Aristawati', 'Claresta', 'Anggota', ['Flutter', 'Dart'], 'Satu kode, dua platform.', 'acid'],
  ['Fauzan Firdaus', 'Fauzan', 'Anggota', ['Java', 'Spring'], 'Backend kuat, tidur tenang.', 'blood'],
  ['Fauzi Al Ayubi', 'Fauzi', 'Anggota', ['PHP', 'MySQL'], 'Query yang benar tidak pernah bohong.', 'slime'],
  ['Firgo Noveldiansyah', 'Firgo', 'Anggota', ['Go', 'Docker'], 'Deploy Jumat? Berani banget.', 'electric'],
  ['Galang Nur Yudhistira', 'Galang', 'Anggota', ['Kotlin', 'Android'], 'Mobile first, bukan mobile nanti.', 'acid'],
  ['Habiburrahman Rafsanjani', 'Habib', 'Anggota', ['C#', 'Unity'], 'Bug itu fitur yang belum didokumentasikan.', 'blood'],
  ['Hidayatul Mustapid', 'Hidayat', 'Anggota', ['Testing', 'QA'], 'Kalau tidak dites, berarti tidak ada.', 'slime'],
  ['Joelio Abdiel Ferdinand', 'Joelio', 'Anggota', ['Vue', 'Pinia'], 'State yang jelas, hidup yang jelas.', 'electric'],
  ["Joevant O'Connor Renault", 'Jovant', 'Anggota', ['Figma', 'Illustrator'], 'Pixel yang salah bikin mata sakit.', 'acid'],
  ['Landra Eka Putri Risvalia', 'Landra', 'Anggota', ['Express', 'PostgreSQL'], 'Relasi tabel lebih rumit dari relasi manusia.', 'blood'],
  ['M. Ryan Arisandy', 'Ryan', 'Anggota', ['Tailwind', 'Vue'], 'Utility class itu puisi yang bisa dibaca.', 'slime'],
  ['Marvel Candra Winata', 'Marvel', 'Anggota', ['Laravel', 'Redis'], 'Cache yang tepat menyelamatkan nyawa.', 'electric'],
  ['Maulana Rasya Mahendra', 'Rasya', 'Anggota', ['Python', 'Pandas'], 'Data tidak pernah berbohong, orangnya iya.', 'acid'],
  ['Moch. Noval Rizky Ramadhan', 'Noval', 'Anggota', ['React', 'Next.js'], 'Render cepat, hati senang.', 'blood'],
  ['Mochammad Aldiansyah', 'Aldi', 'Anggota', ['Flutter', 'Firebase'], 'Realtime bukan berarti panik.', 'slime'],
  ['Mochammad Nindar Deo Praditya', 'Nindar', 'Anggota', ['Node.js', 'Socket.io'], 'Koneksi putus itu ujian kesabaran.', 'electric'],
  ['Mohammad Ibad Habibulloh', 'Ibad', 'Anggota', ['UI/UX', 'Prototyping'], 'Prototipe jelek lebih baik daripada tidak ada.', 'acid'],
  ['Muhamad Hafiz Mukti Wibowo', 'Hafiz', 'Anggota', ['TypeScript', 'Vue'], 'Tipe yang benar menghemat air mata.', 'blood'],
  ['Muhammad Nizar Candra Winata', 'Nizar', 'Anggota', ['Django', 'Python'], 'Framework hanyalah alat, bukan agama.', 'slime'],
  ['Muhammad Rifqi Hafizuddin', 'Rifqi', 'Anggota', ['Java', 'Android'], 'Build gagal? Coba bersihkan dulu.', 'electric'],
  ['Muhammad Zackly Ibrohim', 'Zackly', 'Anggota', ['Tailwind', 'Alpine'], 'Kecil, ringan, dan cepat.', 'acid'],
  ['Nayaka Putra Sadewa', 'Nayaka', 'Anggota', ['C++', 'Unreal'], 'Manajemen memori itu kedisiplinan.', 'blood'],
  ['Novan Arya Syahputra', 'Novan', 'Anggota', ['PHP', 'Laravel'], 'Eloquent bikin query jadi enak dibaca.', 'slime'],
  ['Novita Herawati Liono', 'Novita', 'Anggota', ['Go', 'gRPC'], 'Konkurensi itu indah kalau paham.', 'electric'],
  ['Pungky Rusmawan', 'Pungky', 'Anggota', ['SQL', 'Database'], 'Index yang tepat, query yang kilat.', 'acid'],
  ['Rafi Ihsanuddin Wafa', 'Rafi', 'Anggota', ['React', 'Redux'], 'Satu sumber kebenaran, satu state.', 'blood'],
  ['Rafrizza Herlambang Wijaya', 'Rafrizza', 'Anggota', ['Vue', 'Nuxt'], 'SEO dan kecepatan bisa akur.', 'slime'],
  ['Robert Stuart Eklessia', 'Robert', 'Anggota', ['Python', 'FastAPI'], 'Dokumentasi otomatis itu berkah.', 'electric'],
  ['Rossa Kartika Dwi Aprillia', 'Rossa', 'Anggota', ['CSS', 'Animation'], 'Animasi 60fps atau tidak sama sekali.', 'acid'],
  ['Royyan Dwi Subono', 'Royyan', 'Anggota', ['Node.js', 'Express'], 'Middleware itu penjaga gerbang.', 'blood'],
  ['Satria Mahatva Tungga', 'Satria', 'Anggota', ['Figma', 'Design System'], 'Konsistensi mengalahkan kreativitas liar.', 'slime'],
  ['Sheva Maulana Ramadhan', 'Sheva', 'Anggota', ['Kotlin', 'Jetpack'], 'Lifecycle itu bukan saran.', 'electric'],
  ['Syamsurizal Dwi Nur Aliansyah', 'Syamsu', 'Anggota', ['Flutter', 'REST API'], 'JSON masuk, widget keluar.', 'acid'],
  ['Tiara Putri Oktavia', 'Tiara', 'Anggota', ['Laravel', 'Livewire'], 'Fullstack tanpa ribet.', 'blood'],
  ['Valentino Athalla Akbar', 'Valentino', 'Anggota', ['UI/UX', 'Wireframe'], 'Wireframe dulu sebelum berantakan.', 'slime'],
  ['Vino Hafizh Khairuddin', 'Vino', 'Anggota', ['Docker', 'CI/CD'], 'Push, tes, deploy, tidur.', 'electric'],
  ['Wahyu Farras Satya Mahardika', 'Wahyu', 'Anggota', ['Python', 'ML'], 'Model pintar, data harus lebih pintar.', 'acid'],
  ['Yoga Pratama', 'Yoga', 'Anggota', ['Java', 'Spring Boot'], 'Arsitektur yang baik itu tak terlihat.', 'blood'],
  ['Zaky Avriano Nugroho', 'Zaky', 'Anggota', ['Vue', 'Tailwind'], 'Komponen kecil, aplikasi besar.', 'slime'],
  ['Zuumar Izzatul Zidna Fann', 'Zuumar', 'Anggota', ['React Native', 'Expo'], 'Satu basis kode, dua toko aplikasi.', 'electric'],
]

export const students = RAW.map(
  ([name, nickname, role, skills, quote, accent], index) => ({
    id: index + 1,
    name,
    nickname,
    role,
    skills,
    quote,
    accent,
  }),
)

/** Total siswa — dipakai hero stat agar tidak ada angka yang basi. */
export const TOTAL_STUDENTS = students.length
