<script setup>
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import OrganizationSection from '@/components/sections/OrganizationSection.vue'
import RosterSection from '@/components/sections/RosterSection.vue'
import GallerySection from '@/components/sections/GallerySection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import MarqueeTicker from '@/components/ui/MarqueeTicker.vue'
import FrameworkStrip from '@/components/ui/FrameworkStrip.vue'
</script>

<template>
  <HeroSection />
  <FrameworkStrip />
  <AboutSection />
  <OrganizationSection />
  <RosterSection />
  <!--
    The marquee sits AFTER the gallery, not before it.
    GlyphPortal pins its stage with `position: sticky`, and a full-bleed
    band directly above would scroll into view mid-pin — visually
    clipping the effect and adding a scroll anchor that fights the
    travel. Placing it after keeps the pin uninterrupted.
  -->
  <GallerySection />
  <MarqueeTicker
    text="GALERI MOMEN · KELAS 12 RPL"
    surface="bg-electric text-paper"
    reverse
  />
  <ContactSection />
</template>
