/**
 * Utilitaires de suivi des résultats d'exercices par élève.
 * Stocke les événements dans localStorage, indexés par profil.
 */

import { loadJSON, saveJSON } from './storage.js'

const STORAGE_PREFIX = 'eduki_tracking_'
const MAX_EVENTS = 500

function storageKey(profileId) {
  return `${STORAGE_PREFIX}${profileId}`
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Enregistre le résultat d'un tour d'exercice pour un profil donné.
 * @param {string} profileId
 * @param {object} data - { exerciseId, duration, success, errors, details }
 */
export function recordExerciseResult(profileId, data) {
  if (!profileId) return

  const event = {
    id: generateId(),
    exerciseId: data.exerciseId,
    timestamp: new Date().toISOString(),
    duration: Math.round(data.duration ?? 0),
    success: Boolean(data.success),
    errors: Math.max(0, Math.round(data.errors ?? 0)),
    details: data.details ?? {},
  }

  const events = loadJSON(storageKey(profileId), [])
  events.push(event)

  // Garder seulement les N derniers événements
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS)
  }

  saveJSON(storageKey(profileId), events)
}

/**
 * Récupère tous les résultats d'un profil, triés du plus récent au plus ancien.
 */
export function getResults(profileId) {
  if (!profileId) return []
  const events = loadJSON(storageKey(profileId), [])
  return events.slice().reverse()
}

/**
 * Récupère les résultats filtrés par exercice.
 */
export function getResultsByExercise(profileId, exerciseId) {
  return getResults(profileId).filter((e) => e.exerciseId === exerciseId)
}

/**
 * Supprime toutes les données de suivi d'un profil.
 */
export function clearResults(profileId) {
  if (!profileId || typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(storageKey(profileId))
  } catch {
    // ignore
  }
}
