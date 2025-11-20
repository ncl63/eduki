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
    id: 'word-recompose',
    titre: 'Recompose le mot',
    niveau: 'CP',
    description: "Recompose le mot affiché en sélectionnant les lettres dans l'ordre.",
    settingsPath: '/settings/words',
  },
  {
    id: 'feed-rabbit',
    titre: 'Nourrir le lapin',
    niveau: 'Maternelle',
    description: 'Donne le bon nombre de carottes au lapin (numération 1-3).',
    settingsPath: '/settings/feed-rabbit',
  },
]

export function getExerciseById(id) {
  return EXERCISES.find((exercise) => exercise.id === id) ?? null
}
