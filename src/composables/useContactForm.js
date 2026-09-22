import { computed, reactive, ref } from 'vue'

/**
 * Contact form state + validation.
 *
 * ⚠️ There is NO backend wired up. `submit()` simulates a request and
 * resolves after a short delay. To go live, replace the marked block
 * with a real call — e.g. Formspree, Web3Forms, or your own endpoint:
 *
 *   await fetch('https://formspree.io/f/XXXX', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(form),
 *   })
 *
 * The form is intentionally uncontrolled by v-model on the *validated*
 * shape: validation runs on submit AND on blur, never on every keystroke,
 * so the user is not yelled at while still typing their email.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useContactForm() {
  const form = reactive({
    name: '',
    email: '',
    message: '',
  })

  /** Errors are only populated after a field has been touched. */
  const errors = reactive({
    name: '',
    email: '',
    message: '',
  })

  const touched = reactive({
    name: false,
    email: false,
    message: false,
  })

  const status = ref('idle') // idle | sending | success | error
  const serverError = ref('')

  const RULES = {
    name: (v) => {
      if (!v.trim()) return 'Nama wajib diisi.'
      if (v.trim().length < 2) return 'Nama minimal 2 karakter.'
      return ''
    },
    email: (v) => {
      if (!v.trim()) return 'Email wajib diisi.'
      if (!EMAIL_RE.test(v.trim())) return 'Format email tidak valid.'
      return ''
    },
    message: (v) => {
      if (!v.trim()) return 'Pesan wajib diisi.'
      if (v.trim().length < 10) return 'Pesan minimal 10 karakter.'
      return ''
    },
  }

  const validateField = (field) => {
    errors[field] = RULES[field](form[field])
  }

  /** Mark a field touched (on blur) and validate it. */
  const touch = (field) => {
    touched[field] = true
    validateField(field)
  }

  const isValid = computed(
    () => Object.keys(RULES).every((field) => RULES[field](form[field]) === ''),
  )

  const isSending = computed(() => status.value === 'sending')

  /**
   * @returns {Promise<{ok: boolean, name?: string}>}
   *   `ok: false` means validation failed and nothing was sent.
   */
  const submit = async () => {
    // Mark everything touched so all errors surface at once.
    Object.keys(RULES).forEach((field) => {
      touched[field] = true
      validateField(field)
    })

    if (!isValid.value) {
      // Move focus to the first invalid field for screen-reader users.
      const firstInvalid = Object.keys(RULES).find((f) => errors[f])
      document.getElementById(`contact-${firstInvalid}`)?.focus()
      return { ok: false }
    }

    status.value = 'sending'
    serverError.value = ''

    try {
      // ---- REPLACE THIS BLOCK WITH A REAL REQUEST ----
      await new Promise((resolve) => setTimeout(resolve, 700))
      // ------------------------------------------------

      const senderName = form.name.trim()

      // Reset before navigating so returning to the page is clean.
      Object.keys(RULES).forEach((field) => {
        form[field] = ''
        errors[field] = ''
        touched[field] = false
      })
      status.value = 'success'

      return { ok: true, name: senderName }
    } catch (err) {
      status.value = 'error'
      serverError.value =
        'Pesan gagal terkirim. Coba lagi, atau email langsung ke kelas12rpl@example.com.'
      return { ok: false }
    }
  }

  return {
    form,
    errors,
    touched,
    status,
    serverError,
    isSending,
    isValid,
    touch,
    submit,
  }
}
