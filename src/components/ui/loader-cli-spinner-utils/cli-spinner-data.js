/**
 * CLI spinner frame sets.
 *
 * Each entry is a classic terminal spinner: `frames` are the characters
 * cycled through, `interval` is the base delay in milliseconds between
 * frames. A `speed` multiplier in the component divides that interval.
 *
 * All frames are single-width glyphs so the element does not jitter as
 * the character changes. This matters more than it looks: mixing a
 * braille glyph with a wide em-dash makes the surrounding text twitch
 * every frame.
 */
export const CLI_SPINNERS = {
  /** Eight-phase braille rotor. The classic "working" indicator. */
  'braille-spin': {
    interval: 80,
    frames: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
  },

  /** Filling block bar, then reset. Reads as a progress sweep. */
  aesthetic: {
    interval: 90,
    frames: [
      '▰▱▱▱▱▱▱',
      '▰▰▱▱▱▱▱',
      '▰▰▰▱▱▱▱',
      '▰▰▰▰▱▱▱',
      '▰▰▰▰▰▱▱',
      '▰▰▰▰▰▰▱',
      '▰▰▰▰▰▰▰',
      '▰▱▱▱▱▱▱',
    ],
  },

  /** ASCII rotor. The most universally supported — falls back well. */
  'line-dash': {
    interval: 130,
    frames: ['-', '\\', '|', '/'],
  },

  /** Ten-phase braille dots. Gentler than the rotor. */
  dots: {
    interval: 80,
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  },

  /** Half-circle arc sweep. */
  arc: {
    interval: 100,
    frames: ['◜', '◠', '◝', '◞', '◡', '◟'],
  },

  /** Rotating braille dot, eight phases. */
  bounce: {
    interval: 80,
    frames: ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
  },
}

/** Names only — useful for docs, tests, or a variant picker. */
export const CLI_SPINNER_VARIANTS = Object.keys(CLI_SPINNERS)

export default CLI_SPINNERS
