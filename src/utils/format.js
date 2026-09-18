/**
 * Small, dependency-free helpers shared across sections.
 */

/**
 * Extract up to two uppercase initials from a full name.
 * "Rizky Maulana" -> "RM"
 */
export function getInitials(name) {
  if (!name) return '??'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase()
}

/**
 * Zero-pad a 1-based index for roster / gallery numbering.
 * 1 -> "01", 12 -> "12"
 */
export function padIndex(n, length = 2) {
  return String(n).padStart(length, '0')
}

/**
 * Normalise a string for case- and diacritic-insensitive search.
 * Combining marks are stripped with an explicit \u range so the
 * pattern survives any file-encoding round-trip.
 */
export function normalise(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}
