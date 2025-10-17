export const EXERCISES = [
  {
    id: 'letter-find',
    titre: 'Trouve la lettre',
    niveau: 'CP',
    description: 'Clique toutes les lettres cibles parmi les distracteurs.',
    settingsPath: '/settings/letters',
  },
  {
    id: 'feeding',
    titre: 'Mangeoire fantôme',
    niveau: 'CP',
    description: 'Glisse les carottes pour nourrir le lapin exactement comme demandé.',
    settingsPath: null,
  },
]

export function getExerciseById(id) {
  return EXERCISES.find((exercise) => exercise.id === id) ?? null
}
