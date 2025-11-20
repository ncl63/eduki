import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExerciseById } from '../data/exercises.js'
import LetterFind from '../exercises/LetterFind.jsx'
import WordRecompose from '../exercises/WordRecompose.jsx'
import LetterSound from '../exercises/LetterSound.jsx'
import FeedRabbit from '../exercises/FeedRabbit.jsx'
import NumberMatch from '../exercises/NumberMatch.jsx'

const EXERCISE_COMPONENTS = {
  'letter-find': LetterFind,
  'letter-sound': LetterSound,
  'word-recompose': WordRecompose,
  'feed-rabbit': FeedRabbit,
  'number-match': NumberMatch,
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

  return <Component meta={meta} />
}
