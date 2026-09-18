<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

import { useLenis } from '@/composables/useLenis'
import classLogo from '@/assets/images/logo.jpeg'

const NAV_LINKS = [
  { label: 'Tentang', target: '#tentang' },
  { label: 'Struktur', target: '#struktur' },
  { label: 'Anggota', target: '#anggota' },
  { label: 'Galeri', target: '#galeri' },
  { label: 'Kontak', target: '#kontak' },
]

const { scrollTo } = useLenis()

const isOpen = ref(false)
const isScrolled = ref(false)

const goTo = (target) => {
  isOpen.value = false
  scrollTo(target)
}

const onScroll = () => {
  isScrolled.value = window.scrollY > 40
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b-4 border-ink transition-colors duration-200"
    :class="isScrolled ? 'bg-paper' : 'bg-acid'"
  >
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      aria-label="Navigasi utama"
    >
      <!-- Logo mark (the class badge) -->
      <a
        href="#"
        class="group flex items-center gap-3"
        aria-label="Kembali ke atas"
        @click.prevent="scrollTo(0)"
      >
        <img
          :src="classLogo"
          alt="Logo XII RPL — SMK Antartika 1 Sidoarjo"
          class="h-11 w-11 border-4 border-ink object-cover transition-transform duration-200 group-hover:-rotate-6 sm:h-12 sm:w-12"
        />
        <span
          class="hidden font-display text-lg font-bold tracking-tighter uppercase sm:block"
        >
          XII RPL 
        </span>
      </a>

      <!-- Desktop links -->
      <ul class="hidden items-center gap-1 md:flex">
        <li v-for="link in NAV_LINKS" :key="link.target">
          <a
            :href="link.target"
            class="block border-4 border-transparent px-3 py-1.5 font-display text-sm font-bold uppercase tracking-tight transition-all hover:border-ink hover:bg-ink hover:text-paper"
            @click.prevent="goTo(link.target)"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>

      <!-- Mobile toggle -->
      <button
        type="button"
        class="brutal-btn px-4 py-2 md:hidden"
        :aria-expanded="isOpen"
        aria-controls="mobile-menu"
        @click="isOpen = !isOpen"
      >
        {{ isOpen ? 'Tutup' : 'Menu' }}
      </button>
    </nav>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <ul
        v-if="isOpen"
        id="mobile-menu"
        class="border-t-4 border-ink bg-paper md:hidden"
      >
        <li v-for="link in NAV_LINKS" :key="link.target">
          <a
            :href="link.target"
            class="block border-b-4 border-ink px-5 py-4 font-display text-2xl font-bold uppercase tracking-tight transition-colors hover:bg-acid"
            @click.prevent="goTo(link.target)"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>
    </Transition>
  </header>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.2s var(--ease-brutal);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
