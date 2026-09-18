<script setup>
import { computed, ref } from 'vue'

import SectionHeading from '@/components/ui/SectionHeading.vue'
import { students } from '@/data/students'
import { getInitials, normalise, padIndex } from '@/utils/format'

/** Literal class maps so Tailwind can statically detect every class. */
const ACCENTS = {
  acid: {
    avatar: 'bg-acid text-ink',
    bar: 'bg-acid',
    role: 'bg-ink text-paper',
  },
  electric: {
    avatar: 'bg-electric text-paper',
    bar: 'bg-electric',
    role: 'bg-electric text-paper',
  },
  blood: {
    avatar: 'bg-blood text-paper',
    bar: 'bg-blood',
    role: 'bg-blood text-paper',
  },
  slime: {
    avatar: 'bg-slime text-ink',
    bar: 'bg-slime',
    role: 'bg-slime text-ink',
  },
}

const accentOf = (key) => ACCENTS[key] ?? ACCENTS.acid

const query = ref('')

const filtered = computed(() => {
  const q = normalise(query.value)
  if (!q) return students
  return students.filter((s) =>
    normalise(`${s.name} ${s.nickname} ${s.role} ${s.skills.join(' ')}`).includes(q),
  )
})
</script>

<template>
  <section id="anggota" class="border-b-4 border-ink bg-paper">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        label="// 03 — DAFTAR ANGGOTA"
        title="Orang-Orangnya"
        accent="bg-electric"
      />

      <!-- Search -->
      <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label class="relative block w-full sm:max-w-sm">
          <span class="sr-only">Cari anggota</span>
          <input
            v-model="query"
            type="search"
            placeholder="CARI NAMA / SKILL…"
            class="w-full border-4 border-ink bg-paper px-4 py-3 font-mono text-sm font-bold uppercase tracking-wide shadow-brutal-sm transition-shadow placeholder:text-ink/40 focus:shadow-brutal focus:outline-none"
          />
        </label>

        <p class="brutal-label text-ink/50">
          {{ filtered.length }} / {{ students.length }} ANGGOTA
        </p>
      </div>

      <!-- Cards -->
      <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li
          v-for="(student, index) in filtered"
          :key="student.id"
          class="group brutal-box brutal-interactive flex flex-col p-0"
        >
          <!-- Colour bar -->
          <div class="h-3 border-b-4 border-ink" :class="accentOf(student.accent).bar" />

          <div class="flex flex-1 flex-col p-5">
            <div class="flex items-start justify-between gap-3">
              <span
                class="flex h-14 w-14 shrink-0 items-center justify-center border-4 border-ink font-display text-xl font-bold transition-transform duration-200 group-hover:-rotate-6"
                :class="accentOf(student.accent).avatar"
              >
                {{ getInitials(student.name) }}
              </span>
              <span class="font-mono text-xs text-ink/40">
                {{ padIndex(index + 1) }}
              </span>
            </div>

            <h3
              class="mt-4 font-display text-xl leading-tight font-bold tracking-tight uppercase"
            >
              {{ student.name }}
            </h3>

            <p
              class="mt-2 inline-block self-start border-2 border-ink px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider"
              :class="accentOf(student.accent).role"
            >
              {{ student.role }}
            </p>

            <p class="mt-4 flex-1 font-mono text-xs leading-relaxed text-ink/60">
              “{{ student.quote }}”
            </p>

            <ul class="mt-4 flex flex-wrap gap-2">
              <li
                v-for="skill in student.skills"
                :key="skill"
                class="border-2 border-ink px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase transition-colors group-hover:bg-ink group-hover:text-paper"
              >
                {{ skill }}
              </li>
            </ul>
          </div>
        </li>
      </ul>

      <!-- Empty state -->
      <p
        v-if="filtered.length === 0"
        class="brutal-box bg-acid p-8 text-center font-display text-2xl font-bold uppercase"
      >
        Tidak ada yang cocok. Coba kata kunci lain.
      </p>
    </div>
  </section>
</template>
