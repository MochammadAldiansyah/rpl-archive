<script setup>
import { useRouter } from 'vue-router'

import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useContactForm } from '@/composables/useContactForm'

const router = useRouter()

const CONTACT = [
  { label: 'Email', value: 'kelas12rpl@example.com', href: 'mailto:kelas12rpl@example.com' },
  { label: 'Instagram', value: '@rpl.society', href: 'https://instagram.com' },
  { label: 'GitHub', value: '/kelas-12-rpl', href: 'https://github.com' },
]

const { form, errors, touched, status, serverError, isSending, touch, submit } =
  useContactForm()

const onSubmit = async () => {
  const result = await submit()
  if (result.ok) {
    // Greet the sender by name on the thank-you page.
    router.push({ path: '/terima-kasih', query: { nama: result.name } })
  }
}
</script>

<template>
  <section id="kontak" class="bg-acid">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        label="// 05 — HUBUNGI KAMI"
        title="Ada Proyek? Ngobrol."
        accent="bg-ink"
      />

      <div class="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <p class="max-w-lg text-xl leading-relaxed sm:text-2xl">
            Mau kerja sama, undang kami lomba, atau sekadar tanya kenapa website
            ini kotak-kotak? Kirim pesan. Kami biasanya balas — kecuali sedang
            <span class="border-4 border-ink bg-ink px-1 text-acid">kejar deadline</span>.
          </p>

          <!--
            `overflow-hidden` clips the row dividers to the rounded
            corners; without it the first and last divider lines run
            straight through the curve.
          -->
          <dl
            class="brutal-box mt-8 divide-y-4 divide-ink overflow-hidden bg-paper"
          >
            <div
              v-for="item in CONTACT"
              :key="item.label"
              class="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <dt class="brutal-label text-ink/50">{{ item.label }}</dt>
              <dd>
                <a
                  :href="item.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-display text-lg font-bold tracking-tight underline-offset-4 transition-colors hover:bg-electric hover:text-paper hover:underline"
                >
                  {{ item.value }}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <!--
          Contact form.
          - `novalidate` because we render our own messages (native
            bubbles cannot be styled and are inconsistent across browsers).
          - Errors appear on blur and on submit, never while typing.
        -->
        <form
          novalidate
          class="brutal-box bg-paper p-6 sm:p-8"
          aria-labelledby="contact-form-heading"
          @submit.prevent="onSubmit"
        >
          <h3
            id="contact-form-heading"
            class="font-display text-2xl font-bold tracking-tight uppercase"
          >
            Kirim Pesan
          </h3>

          <!-- Server-side failure (only shown when a real request fails) -->
          <p
            v-if="serverError"
            role="alert"
            class="mt-5 rounded-[var(--radius-control)] border-4 border-blood bg-blood/10 p-4 font-mono text-sm font-bold text-blood"
          >
            {{ serverError }}
          </p>

          <!-- Name -->
          <div class="mt-6">
            <label
              for="contact-name"
              class="brutal-label mb-2 block"
            >
              Nama <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-name"
              v-model="form.name"
              type="text"
              name="name"
              autocomplete="name"
              required
              :aria-invalid="Boolean(errors.name && touched.name)"
              :aria-describedby="errors.name && touched.name ? 'contact-name-error' : undefined"
              class="w-full border-4 border-ink bg-paper px-4 py-3 font-mono text-sm transition-shadow focus:shadow-brutal-sm focus:outline-none"
              :class="errors.name && touched.name && 'border-blood'"
              @blur="touch('name')"
            />
            <p
              v-if="errors.name && touched.name"
              id="contact-name-error"
              role="alert"
              class="mt-2 font-mono text-xs font-bold text-blood"
            >
              {{ errors.name }}
            </p>
          </div>

          <!-- Email -->
          <div class="mt-5">
            <label for="contact-email" class="brutal-label mb-2 block">
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              v-model="form.email"
              type="email"
              name="email"
              autocomplete="email"
              required
              :aria-invalid="Boolean(errors.email && touched.email)"
              :aria-describedby="errors.email && touched.email ? 'contact-email-error' : undefined"
              class="w-full border-4 border-ink bg-paper px-4 py-3 font-mono text-sm transition-shadow focus:shadow-brutal-sm focus:outline-none"
              :class="errors.email && touched.email && 'border-blood'"
              @blur="touch('email')"
            />
            <p
              v-if="errors.email && touched.email"
              id="contact-email-error"
              role="alert"
              class="mt-2 font-mono text-xs font-bold text-blood"
            >
              {{ errors.email }}
            </p>
          </div>

          <!-- Message -->
          <div class="mt-5">
            <label for="contact-message" class="brutal-label mb-2 block">
              Pesan <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="contact-message"
              v-model="form.message"
              name="message"
              rows="5"
              required
              :aria-invalid="Boolean(errors.message && touched.message)"
              :aria-describedby="errors.message && touched.message ? 'contact-message-error' : undefined"
              class="w-full resize-y border-4 border-ink bg-paper px-4 py-3 font-mono text-sm transition-shadow focus:shadow-brutal-sm focus:outline-none"
              :class="errors.message && touched.message && 'border-blood'"
              @blur="touch('message')"
            />
            <p
              v-if="errors.message && touched.message"
              id="contact-message-error"
              role="alert"
              class="mt-2 font-mono text-xs font-bold text-blood"
            >
              {{ errors.message }}
            </p>
          </div>

          <BaseButton
            type="submit"
            block
            class="mt-7"
            :disabled="isSending"
          >
            {{ isSending ? 'Mengirim…' : 'Kirim →' }}
          </BaseButton>

          <p class="mt-4 font-mono text-xs text-ink/50">
            * wajib diisi. Pesan dikirim ke pengurus kelas.
          </p>
        </form>
      </div>
    </div>
  </section>
</template>
