import { useCallback, useRef } from 'react'
import { useProfile } from '../contexts/ProfileContext.jsx'
import { recordExerciseResult } from '../utils/tracking.js'

/**
 * Hook de suivi pour les exercices.
 * Retourne { startRound, recordError, completeRound }.
 * Si aucun profil actif, les fonctions sont des no-ops.
 */
export function useExerciseTracking(exerciseId) {
  const { activeProfile } = useProfile()
  const roundRef = useRef(null)

  const startRound = useCallback((details = {}) => {
    roundRef.current = {
      startedAt: Date.now(),
      errors: 0,
      details,
    }
  }, [])

  const recordError = useCallback(() => {
    if (roundRef.current) {
      roundRef.current.errors += 1
    }
  }, [])

  const completeRound = useCallback((extraDetails = {}) => {
    if (!activeProfile || !roundRef.current) return

    const duration = (Date.now() - roundRef.current.startedAt) / 1000

    recordExerciseResult(activeProfile.id, {
      exerciseId,
      duration,
      success: true,
      errors: roundRef.current.errors,
      details: { ...roundRef.current.details, ...extraDetails },
    })

    roundRef.current = null
  }, [activeProfile, exerciseId])

  return { startRound, recordError, completeRound }
}
