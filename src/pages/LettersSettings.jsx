import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_SETTINGS,
  LETTER_STYLE_OPTIONS,
  fontForStyle,
  loadLetterSettings,
  sanitizeSettings,
  saveLetterSettings,
  STAR_GOAL,
} from '../exercises/LetterFind.jsx'

export default function LettersSettings() {
  const [settings, setSettings] = useState(() => loadLetterSettings())

  const targetCount = useMemo(() => {
    const normalized = sanitizeSettings(settings)
    const count = normalized.itemsCount
    const ratioTargets = Math.round(count * normalized.targetRatio)
    return Math.max(1, Math.min(count - 1, ratioTargets))
  }, [settings])

  function update(partial) {
    const next = sanitizeSettings({ ...settings, ...partial })
    setSettings(next)
    saveLetterSettings(next)
  }

  function resetDefaults() {
    setSettings(DEFAULT_SETTINGS)
    saveLetterSettings(DEFAULT_SETTINGS)
  }

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-gray-600 hover:underline">
          ⬅️ Accueil
        </Link>
        <h1 className="text-2xl font-bold">Réglages – Trouve la lettre</h1>
        <Link to="/ex/letter-find" className="text-sm text-gray-600 hover:underline">
          Retour au jeu →
        </Link>
      </header>

      <section className="space-y-4">
        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 text-sm text-indigo-900">
          Ajuste les paramètres du jeu. Les modifications sont sauvegardées automatiquement et une nouvelle manche se lance dès ton retour sur le jeu.
        </div>

        <form className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-700" htmlFor="targetLetter">
              Lettre cible
            </label>
            <input
              id="targetLetter"
              value={settings.targetLetter}
              onChange={(event) => update({ targetLetter: event.target.value })}
              maxLength={1}
              className="w-24 px-3 py-2 rounded-xl border bg-white shadow-sm text-center text-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-700" htmlFor="distractorLetters">
              Lettres distractrices
            </label>
            <input
              id="distractorLetters"
              value={settings.distractorLetters}
              onChange={(event) => update({ distractorLetters: event.target.value })}
              className="w-full px-3 py-2 rounded-xl border bg-white shadow-sm uppercase tracking-wide"
              placeholder="Ex. BCEFGH"
            />
            <p className="text-xs text-gray-500">
              MAJUSCULES, séparées ou non, la lettre cible est automatiquement exclue.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-700" htmlFor="itemsCount">
              Nombre de cartes ({settings.itemsCount})
            </label>
            <input
              id="itemsCount"
              type="range"
              min={8}
              max={30}
              value={settings.itemsCount}
              onChange={(event) => update({ itemsCount: Number(event.target.value) })}
            />
            <p className="text-xs text-gray-500">Entre 8 et 30 cartes.</p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-700" htmlFor="targetRatio">
              Ratio de lettres cibles ({targetCount} / {settings.itemsCount})
            </label>
            <input
              id="targetRatio"
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={settings.targetRatio}
              onChange={(event) => update({ targetRatio: Number(event.target.value) })}
            />
            <p className="text-xs text-gray-500">Entre 10% et 90% des cartes.</p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-700" htmlFor="letterStyle">
              Style de lettres
            </label>
            <select
              id="letterStyle"
              value={settings.letterStyle}
              onChange={(event) => update({ letterStyle: event.target.value })}
              className="w-full px-3 py-2 rounded-xl border bg-white shadow-sm"
            >
              {LETTER_STYLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatStyleLabel(option)}
                </option>
              ))}
            </select>
            <div className="rounded-xl border border-dashed border-indigo-200 p-3 text-center">
              <span
                className="text-3xl font-semibold"
                style={{ fontFamily: fontForStyle(settings.letterStyle) }}
              >
                ABC
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-700">Progression étoiles</label>
            <div className="rounded-xl border border-indigo-100 p-3 bg-white shadow-sm text-sm text-gray-600">
              Tu gagnes 1 ⭐ par victoire, jusqu'à {STAR_GOAL}. Les réglages sont partagés avec l'exercice.
            </div>
          </div>
        </form>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </section>
    </div>
  )
}

function formatStyleLabel(value) {
  switch (value) {
    case 'cursif':
      return 'Cursif'
    case 'script':
      return 'Script'
    case 'serif':
      return 'Serif'
    case 'baton':
    default:
      return 'Bâton'
  }
}

