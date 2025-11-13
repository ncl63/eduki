export const EXERCISES = [
  {
    id: 'letter-find',
    titre: 'Trouve la lettre',
    niveau: 'CP',
    description: 'Clique toutes les lettres cibles parmi les distracteurs.',
    settingsPath: '/settings/letters',
  },
  {
    id: 'letter-sound',
    titre: 'Écoute la lettre',
    niveau: 'CP',
    description: "Écoute le son et sélectionne la lettre correspondante.",
    settingsPath: '/settings/letter-sound',
  },
  {
    id: 'feeding',
    titre: 'Mangeoire fantôme',
    niveau: 'CP',
    description: 'Glisse les carottes pour nourrir le lapin exactement comme demandé.',
    settingsPath: null,
  },
  {
    id: 'word-recompose',
    titre: 'Recompose le mot',
    niveau: 'CP',
    description: "Recompose le mot affiché en sélectionnant les lettres dans l'ordre.",
    settingsPath: '/settings/words',
  },
]

export function getExerciseById(id) {
  return EXERCISES.find((exercise) => exercise.id === id) ?? null
}
