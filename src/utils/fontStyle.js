// Utilitaires partagés pour la sélection de police dans les exercices de lettres.
// Deux modes : "baton" (majuscules sans-serif) et "script" (minuscules cursives Belle Allure).

export const LETTER_STYLE_OPTIONS = ['baton', 'script', 'mixte']
export const DEFAULT_LETTER_STYLE = 'baton'

/**
 * Retourne la valeur CSS font-family pour un style donné.
 */
export function fontForStyle(style) {
  switch (style) {
    case 'script':
      return '"Belle Allure", cursive'
    case 'baton':
    default:
      return '"Segoe UI", "Inter", system-ui, sans-serif'
  }
}

/**
 * Transforme la casse d'un caractère selon le style :
 * - baton → MAJUSCULE
 * - script → minuscule
 */
export function formatLetterCase(char, style) {
  if (!char) return ''
  if (style === 'script') return char.toLocaleLowerCase('fr-FR')
  return char.toLocaleUpperCase('fr-FR')
}

/**
 * Label français pour l'affichage dans les réglages.
 */
export function formatStyleLabel(style) {
  switch (style) {
    case 'script':
      return 'Script minuscule'
    case 'mixte':
      return 'Mixte'
    case 'baton':
    default:
      return 'Bâton'
  }
}

/**
 * Valide et normalise une valeur de style de lettre.
 * Les anciennes valeurs (cursif, serif, etc.) retombent sur 'baton'.
 */
export function sanitizeLetterStyle(value) {
  if (LETTER_STYLE_OPTIONS.includes(value)) return value
  return DEFAULT_LETTER_STYLE
}
