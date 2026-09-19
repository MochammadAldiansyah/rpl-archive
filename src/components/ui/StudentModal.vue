<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { getInitials, padIndex } from '@/utils/format'
import { useLenis } from '@/composables/useLenis'

const props = defineProps({
  /** Student object, or null when closed. */
  student: { type: Object, default: null },
  /** Size of the full roster, for the "03 / 45" counter. */
  total: { type: Number, default: 0 },
})

const emit = defineEmits(['close'])

const { stop: stopScroll, start: startScroll } = useLenis()

/** Literal class maps — Tailwind can only see classes written out. */
const ACCENTS = {
  acid: { panel: 'bg-acid', chip: 'bg-ink text-paper', strip: 'bg-acid' },
  electric: { panel: 'bg-electric', chip: 'bg-paper text-ink', strip: 'bg-electric' },
  blood: { panel: 'bg-blood', chip: 'bg-paper text-ink', strip: 'bg-blood' },
  slime: { panel: 'bg-slime', chip: 'bg-ink text-paper', strip: 'bg-slime' },
}

const accentOf = (key) => ACCENTS[key] ?? ACCENTS.acid

const isOpen = computed(() => props.student !== null)

/**
 * True when the student has no optional detail filled in yet.
 * Drives a hint instead of leaving five rows of "—" unexplained.
 */
const hasNoDetail = computed(() => {
  const s = props.student
  if (!s) return false
  return !['photo', 'birthDate', 'hobby', 'aspiration', 'instagram', 'github'].some(
    (key) => s[key],
  )
})

/** Detail rows — anything unfilled renders as an em dash. */
const DETAIL_ROWS = computed(() => {
  const s = props.student
  if (!s) return []

  const ig = s.instagram?.replace(/^@/, '')

  return [
    { label: 'Tanggal Lahir', value: s.birthDate },
    { label: 'Hobi', value: s.hobby },
    { label: 'Cita-cita', value: s.aspiration },
    {
      label: 'Instagram',
      value: s.instagram,
      href: ig ? `https://instagram.com/${ig}` : null,
    },
    {
      label: 'GitHub',
      value: s.github,
      href: s.github ? `https://github.com/${s.github}` : null,
    },
  ]
})

const panelRef = ref(null)
const closeRef = ref(null)
let previouslyFocused = null

// --- Scroll lock ---------------------------------------------------------
// Lenis drives the page, so pausing it (not just `overflow: hidden`) is
// what actually stops the background from moving. The body style is a
// fallback for when Lenis is absent (prefers-reduced-motion).
watch(isOpen, async (open) => {
  if (open) {
    previouslyFocused = document.activeElement
    stopScroll()
    document.body.style.overflow = 'hidden'
    await nextTick()
    closeRef.value?.focus()
  } else {
    startScroll()
    document.body.style.overflow = ''
    previouslyFocused?.focus?.()
  }
})

// --- Keyboard: Esc closes, Tab cycles inside the panel -------------------
function onKeydown(event) {
  if (!isOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key !== 'Tab' || !panelRef.value) return

  const focusable = panelRef.value.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  // Never leave the page frozen if this unmounts while open.
  if (isOpen.value) {
    startScroll()
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <!--
    Teleported to <body>: the roster section creates stacking contexts
    (isolate / z-index), and a fixed overlay inside one would be clipped
    or mis-layered.

    One Transition wraps the whole overlay. The panel's slam is driven by
    descendant selectors off the transition classes, which is more
    reliable than nesting a second Transition inside a leaving parent.
  -->
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-ink/80 p-3 sm:p-6"
        data-lenis-prevent
        @click.self="emit('close')"
      >
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`student-${student.id}-name`"
          class="slam-panel relative my-auto w-full max-w-4xl border-4 border-ink bg-paper shadow-[12px_12px_0px_0px_rgba(10,10,10,1)]"
        >
          <!-- Accent strip -->
          <div class="h-3 border-b-4 border-ink" :class="accentOf(student.accent).strip" />

          <!-- Header -->
          <div
            class="flex items-center justify-between gap-4 border-b-4 border-ink bg-ink px-4 py-3 sm:px-6"
          >
            <p class="font-mono text-xs font-bold tracking-[0.25em] text-acid">
              NO. {{ padIndex(student.number) }} / {{ padIndex(total) }}
            </p>

            <button
              ref="closeRef"
              type="button"
              class="cursor-pointer border-4 border-paper px-3 py-1 font-display text-sm font-bold tracking-tight text-paper uppercase transition-colors duration-150 hover:bg-blood"
              aria-label="Tutup detail siswa"
              @click="emit('close')"
            >
              Tutup ✕
            </button>
          </div>

          <!-- Body: photo left / info right -->
          <div class="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <!-- ============ LEFT: photo ============ -->
            <div
              class="flex flex-col items-center gap-4 border-b-4 border-ink p-6 sm:p-8 md:border-r-4 md:border-b-0"
              :class="accentOf(student.accent).panel"
            >
              <div
                class="aspect-square w-full max-w-[15rem] border-4 border-ink shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]"
              >
                <!-- Real photo once `photo` is filled in; initials until then. -->
                <img
                  v-if="student.photo"
                  :src="student.photo"
                  :alt="`Foto ${student.name}`"
                  class="h-full w-full object-cover"
                />
                <span
                  v-else
                  class="flex h-full w-full items-center justify-center bg-paper font-display text-6xl font-bold tracking-tighter sm:text-7xl"
                >
                  {{ getInitials(student.name) }}
                </span>
              </div>

              <p
                class="border-4 border-ink bg-paper px-3 py-1 font-mono text-sm font-bold tracking-wide"
              >
                “{{ student.nickname }}”
              </p>

              <p
                v-if="!student.photo"
                class="max-w-[15rem] text-center font-mono text-[0.65rem] leading-relaxed opacity-70"
              >
                Foto menyusul — sementara pakai inisial.
              </p>
            </div>

            <!-- ============ RIGHT: info ============ -->
            <div class="p-6 sm:p-8">
              <h3
                :id="`student-${student.id}-name`"
                class="font-display text-3xl leading-[0.95] font-bold tracking-tighter uppercase sm:text-4xl"
              >
                {{ student.name }}
              </h3>

              <p
                class="mt-3 inline-block border-4 border-ink px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em]"
                :class="accentOf(student.accent).chip"
              >
                {{ student.role }}
              </p>

              <!-- Skills -->
              <div class="mt-7">
                <p class="brutal-label mb-3 text-ink/50">// Keahlian</p>
                <ul class="flex flex-wrap gap-2">
                  <li
                    v-for="skill in student.skills"
                    :key="skill"
                    class="border-4 border-ink px-3 py-1 font-mono text-xs font-bold uppercase"
                  >
                    {{ skill }}
                  </li>
                </ul>
              </div>

              <!-- Detail rows -->
              <div class="mt-7">
                <p class="brutal-label mb-3 text-ink/50">// Detail</p>
                <dl class="border-4 border-ink">
                  <div
                    v-for="(row, i) in DETAIL_ROWS"
                    :key="row.label"
                    class="modal-row flex items-start justify-between gap-4 border-b-4 border-ink px-4 py-3 last:border-b-0"
                    :style="{ animationDelay: `${140 + i * 60}ms` }"
                  >
                    <dt class="font-mono text-xs font-bold tracking-wider uppercase">
                      {{ row.label }}
                    </dt>
                    <dd class="text-right font-mono text-xs font-bold">
                      <a
                        v-if="row.href && row.value"
                        :href="row.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="underline-offset-4 hover:bg-electric hover:text-paper hover:underline"
                      >
                        {{ row.value }}
                      </a>
                      <template v-else>{{ row.value || '—' }}</template>
                    </dd>
                  </div>
                </dl>

                <!-- Shown only while the optional fields are still empty. -->
                <p
                  v-if="hasNoDetail"
                  class="mt-3 border-4 border-dashed border-ink/40 p-3 font-mono text-[0.65rem] leading-relaxed text-ink/60"
                >
                  Detail belum diisi. Tambahkan di
                  <code class="bg-acid px-1 font-bold">src/data/students.js</code>
                  pada elemen ke-7 tiap siswa.
                </p>
              </div>

              <!-- Quote -->
              <blockquote
                class="modal-row mt-7 border-l-8 border-ink bg-acid p-4 font-display text-lg leading-tight font-bold tracking-tight"
                :style="{ animationDelay: '440ms' }"
              >
                “{{ student.quote }}”
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop: hard, fast fade — no soft blur. */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 180ms linear;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/*
  The "slam": the panel overshoots slightly, rotating in, then snaps
  upright. The cubic-bezier's >1 control point is what produces the
  recoil. Applied via the parent's transition classes so open and close
  are both covered without nesting Transitions.
*/
@keyframes slam-in {
  from {
    opacity: 0;
    transform: scale(1.15) rotate(-2deg);
    box-shadow: 0 0 0 0 rgba(10, 10, 10, 0);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    box-shadow: 12px 12px 0 0 rgba(10, 10, 10, 1);
  }
}

@keyframes slam-out {
  from {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  to {
    opacity: 0;
    transform: scale(0.96) rotate(1deg);
  }
}

.overlay-enter-active .slam-panel {
  animation: slam-in 280ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.overlay-leave-active .slam-panel {
  animation: slam-out 150ms ease-in both;
}

/* Info rows slide in one after another. */
@keyframes modal-row-in {
  from {
    opacity: 0;
    transform: translateX(-14px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.modal-row {
  animation: modal-row-in 260ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

/* Reduced motion: keep the fade, drop the movement. */
@media (prefers-reduced-motion: reduce) {
  .modal-row {
    animation: none;
  }
  .overlay-enter-active .slam-panel,
  .overlay-leave-active .slam-panel {
    animation: none;
  }
}
</style>
