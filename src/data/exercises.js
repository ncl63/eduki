export const EXERCISES = [
  {
    id: 'letter-find',
    titre: 'Trouve la lettre',
    niveau: 'CP',
    category: "Lettres",
    skill: "Reconnaissance",
    tone: "lavender",
    description: "Repérez une lettre parmi les autres.",
    settingsPath: '/settings/letters',
  },
  {
    id: 'letter-sound',
    titre: 'Écoute la lettre',
    niveau: 'CP',
    category: "Lettres",
    skill: "Écoute & association",
    tone: "blue",
    description: "Associez le son entendu à la bonne lettre.",
    settingsPath: '/settings/letter-sound',
  },
  {
    id: 'quantity-sound',
    titre: 'Écoute le nombre',
    niveau: 'GS',
    category: "Nombres",
    skill: "Écoute & quantités",
    tone: "sand",
    description: "Écoutez un nombre et retrouvez sa quantité.",
    settingsPath: '/settings/quantity-sound',
  },
  {
    id: 'word-recompose',
    titre: 'Recompose le mot',
    niveau: 'CP',
    category: "Mots",
    skill: "Lecture & assemblage",
    tone: "green",
    description: "Remettez les lettres dans le bon ordre.",
    settingsPath: '/settings/words',
  },
]

export function getExerciseById(id) {
  return EXERCISES.find((exercise) => exercise.id === id) ?? null
}
