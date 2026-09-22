<script setup>
import { computed, ref, useId } from 'vue'

import { useGlyphPortal } from '@/composables/useGlyphPortal'

/**
 * Glyph Portal — a scroll-driven camera through live type.
 *
 * Ported from a React component (© Christian Katzmann, MIT).
 * The algorithm lives in src/composables/useGlyphPortal.js; this file is
 * the template and the theme.
 *
 * ── Theming ─────────────────────────────────────────────────────────
 * The original ships its own palette (green field, paper white). Here the
 * surface is supplied by the caller via the `background` slot and by CSS
 * variables, so the effect inherits the site's neo-brutalist language:
 * cream paper, off-black ink, acid accent — with the class photo behind
 * the letters rather than a gradient.
 */
const props = defineProps({
  /** The word the camera travels through. */
  word: { type: String, default: 'GALERI' },
  /** Prefer the first matching character. Omit for the largest safe patch. */
  focusChar: { type: String, default: '' },
  /** Hover, tap or arrow-key a letter before scrolling. */
  interactive: { type: Boolean, default: true },
  /** Scroll travel in viewport heights, clamped 1–8. */
  scrollLength: { type: Number, default: 2.4 },
  fontFamily: { type: String, default: '' },
  fontWeight: { type: Number, default: 900 },
  /** Show the measurement ticks and crosshair. */
  annotations: { type: Boolean, default: false },
  enterLabel: { type: String, default: 'Masuk ke galeri' },
})

const emit = defineEmits(['progress'])

const sectionRef = ref(null)

/**
 * Unique per instance.
 *
 * The content anchor and the SVG clip path both need IDs, and two portals
 * on one page would otherwise collide — the browser resolves a duplicate
 * ID to the first match, so the second portal's clip would silently
 * reference the first portal's glyph.
 */
const uid = `gp-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
const contentId = `${uid}-content`
const clipId = `${uid}-clip`

/** Options are read fresh each frame, so prop changes need no re-init. */
const getOptions = () => ({
  word: props.word,
  focusChar: props.focusChar,
  interactive: props.interactive,
  scrollLength: props.scrollLength,
  fontFamily: props.fontFamily,
  fontWeight: props.fontWeight,
  hasFront: true,
})

useGlyphPortal({
  sectionRef,
  getOptions,
  onProgress: (p) => emit('progress', p),
})

const characters = computed(() =>
  Array.from(props.word.trim().normalize('NFC') || 'GALERI').map((char, i) => ({
    char,
    index: i,
  })),
)

const letterCount = computed(() => characters.value.length)
</script>

<template>
  <!--
    The section carries the data attributes and CSS variables the
    composable writes to. `id` doubles as the content anchor.
  -->
  <section
    ref="sectionRef"
    class="glyph-portal"
    :id="uid"
    :aria-label="word"
    :style="{ '--gp-length': scrollLength, '--gp-characters': letterCount }"
  >
    <!-- Invisible 100svh probe: keeps mobile browser chrome from changing
         the scroll distance as the address bar collapses. -->
    <div data-gp-viewport aria-hidden="true" />

    <div data-gp-pin>
      <!--
        The clipped field. Everything inside is revealed through the
        letter as the camera moves in — here that is the class photo
        rather than the original's gradient.
      -->
      <div data-gp-field aria-hidden="true" inert>
        <slot name="background">
          <div class="glyph-portal__default-field" />
        </slot>
      </div>

      <svg data-gp-art aria-hidden="true" focusable="false">
        <defs>
          <clipPath :id="clipId" data-gp-clip clipPathUnits="userSpaceOnUse">
            <text
              data-gp-glyph
              x="0"
              y="0"
              :style="{
                fontFamily: fontFamily || undefined,
                fontWeight,
                fontSize: '100px',
                fontKerning: 'none',
                fontVariantLigatures: 'none',
                letterSpacing: 0,
              }"
            >
              {{ word }}
            </text>
          </clipPath>
        </defs>
        <g data-gp-marks :style="{ visibility: annotations ? 'visible' : 'hidden' }">
          <path />
        </g>
      </svg>

      <!--
        Per-letter hit targets, positioned over each rendered glyph by the
        composable. A radiogroup rather than a list of links because only
        one letter can be the chosen entry at a time.
      -->
      <div
        data-gp-choices
        role="radiogroup"
        aria-label="Pilih huruf untuk dimasuki"
        inert
      >
        <button
          v-for="(item, i) in characters"
          :key="item.index"
          type="button"
          role="radio"
          aria-checked="false"
          :tabindex="-1"
          :data-gp-letter="item.index"
          :aria-label="`${item.char}, huruf ${i + 1} dari ${letterCount}`"
        />
      </div>

      <!-- Coarse pointers get a native select instead of tapping glyphs. -->
      <label data-gp-touch-picker>
        <span class="sr-only">Huruf masuk</span>
        <select data-gp-select>
          <option value="" disabled>Pilih huruf</option>
          <option v-for="(item, i) in characters" :key="item.index" :value="item.index">
            {{ i + 1 }} · {{ item.char }}
          </option>
        </select>
      </label>

      <!-- Foreground composition for the opening frame. -->
      <div data-gp-front>
        <slot name="front" />
      </div>

      <!-- Shown before measurement completes, and with JS disabled. -->
      <span
        data-gp-fallback
        aria-hidden="true"
        :style="{ fontFamily: fontFamily || undefined, fontWeight }"
      >
        {{ word }}
      </span>

      <div data-gp-caption>
        <span data-gp-hint aria-hidden="true">
          {{ interactive ? 'Gulir untuk masuk.' : '' }}
        </span>
        <a data-gp-enter :href="`#${contentId}`">
          {{ enterLabel }}<span aria-hidden="true">↘</span>
        </a>
      </div>
    </div>

    <div :id="contentId" data-gp-content tabindex="-1">
      <slot />
    </div>
  </section>
</template>

<style scoped>
/*
  ── Theme ───────────────────────────────────────────────────────────
  Colours come from the site's tokens so this section cannot drift from
  the rest of the page. The original's green field is replaced by ink,
  and paper/acid carry the foreground.
*/
.glyph-portal {
  --gp-paper: var(--color-paper);
  --gp-ink: var(--color-ink);
  --gp-field: var(--color-ink);
  --gp-foreground: var(--color-paper);

  position: relative;
  isolation: isolate;
  background: var(--gp-paper);
  color: var(--gp-ink);
  font-family: var(--font-body);
}

.glyph-portal__default-field {
  position: absolute;
  inset: 0;
  transform: scale(var(--gp-field-scale, 1));
  background: var(--color-ink);
}

/* Invisible height probe. */
[data-gp-viewport] {
  position: absolute;
  inset: 0 auto auto 0;
  height: 100svh;
  width: 0;
  pointer-events: none;
  visibility: hidden;
}

[data-gp-pin] {
  position: relative;
  height: var(--gp-height, 100svh);
  overflow: clip;
  isolation: isolate;
  container-type: size;
}

[data-gp-field] {
  position: absolute;
  inset: 0;
  background: var(--gp-field);
  opacity: 0;
  pointer-events: none;
}

/* The field only appears once the composable has measured the glyphs. */
.glyph-portal[data-gp-ready] [data-gp-field] {
  opacity: 1;
}

[data-gp-art] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

[data-gp-marks] {
  fill: none;
  stroke: var(--gp-paper);
  opacity: 0.6;
}

[data-gp-choices] {
  position: absolute;
  inset: 0;
  visibility: hidden;
  pointer-events: none;
}

.glyph-portal[data-gp-choosing='true'] [data-gp-choices] {
  visibility: visible;
}

[data-gp-letter] {
  box-sizing: border-box;
  position: absolute;
  border: 0;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  touch-action: pan-y;
  border-radius: var(--radius-control);
}

[data-gp-letter]:disabled {
  pointer-events: none;
}

[data-gp-letter]:focus-visible {
  outline: 2px solid var(--color-acid);
  outline-offset: 5px;
}

/* Native picker for touch — tapping individual glyphs is unreliable. */
[data-gp-touch-picker] {
  display: none;
  position: absolute;
  top: calc(var(--gp-word-bottom, 50%) + 42px);
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
  gap: 12px;
  visibility: hidden;
}

.glyph-portal[data-gp-choosing='true'] [data-gp-touch-picker] {
  visibility: visible;
}

[data-gp-select] {
  min-height: 44px;
  min-width: 90px;
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-control);
  background: var(--color-paper);
  color: var(--color-ink);
  padding: 0 10px;
  font-family: var(--font-mono);
  font-size: 12px;
}

[data-gp-select]:focus-visible {
  outline: 2px solid var(--color-acid);
  outline-offset: 4px;
}

@media (any-pointer: coarse) {
  [data-gp-touch-picker] {
    display: flex;
  }
}

/*
  Poster text for no-JS and for the moment before measurement finishes.
  Sized by container query units so it always fits the stage.
*/
[data-gp-fallback] {
  position: absolute;
  inset: 0;
  display: none;
  place-items: center;
  font-size: min(calc(100cqw / var(--gp-characters)), 38cqh);
  line-height: 1;
  color: var(--gp-paper);
  text-transform: uppercase;
  letter-spacing: -0.03em;
}

.glyph-portal[data-gp-ready] [data-gp-fallback] {
  visibility: hidden;
}

[data-gp-caption] {
  position: absolute;
  inset: auto 8% 9%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-family: var(--font-mono);
  font-size: 12px;
  opacity: var(--gp-caption, 1);
  pointer-events: var(--gp-caption-hit, auto);
}

[data-gp-front] {
  position: absolute;
  inset: 0;
  opacity: var(--gp-caption, 1);
  pointer-events: none;
}

[data-gp-front] a,
[data-gp-front] button {
  pointer-events: var(--gp-caption-hit, auto);
}

[data-gp-front]:focus-within {
  opacity: 1;
}

[data-gp-hint] {
  max-width: 30ch;
  color: var(--gp-paper);
}

[data-gp-enter] {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  min-height: 44px;
  padding: 0 18px;
  border: 2px solid var(--color-paper);
  border-radius: var(--radius-control);
  color: var(--color-paper);
  font-family: var(--font-display);
  font-weight: 600;
  text-decoration: none;
  letter-spacing: -0.01em;
}

[data-gp-enter]:hover {
  background: var(--color-acid);
  border-color: var(--color-ink);
  color: var(--color-ink);
}

[data-gp-enter]:focus-visible {
  outline: 2px solid var(--color-acid);
  outline-offset: 5px;
}

[data-gp-caption]:focus-within {
  opacity: 1;
  pointer-events: auto;
}

/*
  Content revealed at the end of the travel.
  Sticky pinning is only enabled when motion is actually running —
  otherwise the section would pin forever on a reduced-motion device.
*/
[data-gp-content] {
  box-sizing: border-box;
  position: relative;
  min-height: var(--gp-height, 100svh);
  padding: clamp(32px, 7%, 100px);
  display: grid;
  align-content: center;
  color: var(--gp-foreground);
  background: var(--gp-field);
  overflow-wrap: anywhere;
}

.glyph-portal[data-gp-motion='on'] [data-gp-pin] {
  position: sticky;
  top: 0;
}

.glyph-portal[data-gp-motion='off'] [data-gp-hint] {
  display: none;
}

.glyph-portal[data-gp-motion='on'] [data-gp-content] {
  margin-top: calc((var(--gp-length) - 1) * var(--gp-height));
  background: transparent;
  opacity: var(--gp-reveal, 0);
  pointer-events: none;
}

.glyph-portal[data-gp-motion='on'][data-gp-entered='true'] [data-gp-content] {
  pointer-events: auto;
}

/*
  Keyboard users must be able to reach the content without scrolling
  through the whole travel — focusing anything inside drops the clip.
*/
.glyph-portal[data-gp-motion='on']:has([data-gp-content]:focus-within) [data-gp-field] {
  clip-path: none !important;
}

.glyph-portal[data-gp-motion='on'] [data-gp-content]:focus-within {
  opacity: 1;
  pointer-events: auto;
}

.glyph-portal:has([data-gp-content]:focus-within) [data-gp-caption],
.glyph-portal:has([data-gp-content]:focus-within) [data-gp-marks] {
  opacity: 0;
}

/*
  Reduced motion: no pinning, no travel. The content is simply there,
  and the word sits behind it as a poster.
*/
@media (prefers-reduced-motion: reduce) {
  [data-gp-pin] {
    position: relative !important;
  }

  [data-gp-content] {
    margin-top: 0 !important;
    opacity: 1 !important;
    background: var(--gp-field) !important;
    min-height: 0;
    padding-block: 64px;
  }

  [data-gp-caption] {
    opacity: 1 !important;
  }

  [data-gp-hint] {
    display: none;
  }
}
</style>
