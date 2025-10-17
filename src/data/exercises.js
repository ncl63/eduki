export const EXERCISES = [
  {
    id: 'letter-find',
    titre: 'Trouve la lettre',
    niveau: 'CP',
    description: 'Clique toutes les lettres cibles parmi les distracteurs.',
    settingsPath: '/settings/letters',
  },
]

export function getExerciseById(id) {
  return EXERCISES.find((exercise) => exercise.id === id) ?? null
}

