/**
 * Utilitaires partagés pour la persistance localStorage.
 */

export function loadJSON(key, fallback = null) {
  if (typeof window === 'undefined') {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore write errors (quota exceeded, etc.)
  }
}

export function loadInt(key, fallback = 0) {
  if (typeof window === 'undefined') {
    return fallback
  }
  const raw = window.localStorage.getItem(key)
  const value = raw == null ? NaN : Number.parseInt(raw, 10)
  return Number.isNaN(value) ? fallback : value
}

export function saveInt(key, value) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // ignore write errors
  }
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function clampInt(value, min, max) {
  const n = Number.isFinite(value) ? Math.round(value) : Number(value) || 0
  return Math.min(max, Math.max(min, n))
}

export function clampRatio(value, min, max) {
  const n = Number.isFinite(value) ? value : Number(value)
  const normalized = Number.isFinite(n) ? n : min
  return Math.min(max, Math.max(min, normalized))
}

export function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export function randomPick(array) {
  if (!array || array.length === 0) {
    return undefined
  }
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Choisit un élément au hasard dans `array` en évitant les éléments de `recent`.
 * Si tous les éléments sont dans `recent`, on ignore la contrainte et on pioche librement.
 */
export function randomPickAvoiding(array, recent = []) {
  if (!array || array.length === 0) return undefined
  const recentSet = new Set(recent)
  const candidates = array.filter((item) => !recentSet.has(item))
  const pool = candidates.length > 0 ? candidates : array
  return pool[Math.floor(Math.random() * pool.length)]
}
