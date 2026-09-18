import React, { lazy } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExerciseById } from '../data/exercises.js'
import { getDesignationSet } from '../data/designationSets.js'
import { getTracingPack } from '../data/tracingPaths.js'
const LetterFind = lazy(() => import('../exercises/LetterFind.jsx'))
const WordRecompose = lazy(() => import('../exercises/WordRecompose.jsx'))
const LetterSound = lazy(() => import('../exercises/LetterSound.jsx'))
const QuantitySound = lazy(() => import('../exercises/QuantitySound.jsx'))
const Designation = lazy(() => import('../exercises/Designation.jsx'))
const FollowDots = lazy(() => import('../exercises/FollowDots.jsx'))

const EXERCISE_COMPONENTS = {
  'letter-find': LetterFind,
  'letter-sound': LetterSound,
  'quantity-sound': QuantitySound,
  'word-recompose': WordRecompose,
  'designation-shapes': Designation,
  'follow-dots': FollowDots,
}

export default function ExerciseRunner() {
  const { exerciseId } = useParams()
  const Component = EXERCISE_COMPONENTS[exerciseId]
  const meta = getExerciseById(exerciseId)

  if (!Component || !meta) {
    return (
      <div className="min-h-screen p-6 md:p-10 space-y-4">
        <h1 className="text-2xl font-bold">Exercice introuvable</h1>
        <p className="text-gray-600">Aucun exercice ne correspond à l'identifiant “{exerciseId}”.</p>
        <Link to="/" className="underline underline-offset-4">← Retour à l'accueil</Link>
      </div>
    )
  }

  if (meta.designationSetId) {
    const set = getDesignationSet(meta.designationSetId)
    if (!set) {
      return <div className="shell-state"><h1>Lot de désignation introuvable</h1><Link to="/">Retour aux exercices</Link></div>
    }
    return <Component meta={meta} set={set} />
  }

  if (meta.tracingPackId) {
    const pack = getTracingPack(meta.tracingPackId)
    if (!pack) {
      return <div className="shell-state"><h1>Parcours de graphisme introuvable</h1><Link to="/">Retour aux exercices</Link></div>
    }
    return <Component meta={meta} pack={pack} />
  }

  return <Component meta={meta} />
}
