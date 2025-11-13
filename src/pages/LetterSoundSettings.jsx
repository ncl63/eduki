import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_SOUND_SETTINGS,
  LETTERS,
  loadLetterSoundSettings,
  sanitizeLetterSoundSettings,
  saveLetterSoundSettings,
} from '../exercises/LetterSound.jsx'

export default function LetterSoundSettings() {
  const [settings, setSettings] = useState(() => loadLetterSoundSettings())

  const enabledCount = useMemo(() => settings.enabledLetters.length, [settings])

  function toggleLetter(letter) {
    setSettings((previous) => {
      const enabled = new Set(previous.enabledLetters)
      if (enabled.has(letter)) {
        enabled.delete(letter)
      } else {
        enabled.add(letter)
      }
      const next = sanitizeLetterSoundSettings({ enabledLetters: Array.from(enabled) })
      saveLetterSoundSettings(next)
      return next
    })
  }

  function selectAll() {
    const next = sanitizeLetterSoundSettings({ enabledLetters: LETTERS })
    setSettings(next)
    saveLetterSoundSettings(next)
  }

  function clearAll() {
    const next = { enabledLetters: [] }
    setSettings(next)
    saveLetterSoundSettings(next)
  }

  function resetDefaults() {
    const next = { enabledLetters: [...DEFAULT_SOUND_SETTINGS.enabledLetters] }
    setSettings(next)
    saveLetterSoundSettings(next)
  }

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-gray-600 hover:underline">
          ⬅️ Accueil
        </Link>
        <h1 className="text-2xl font-bold">Réglages – Écoute la lettre</h1>
        <Link to="/ex/letter-sound" className="text-sm text-gray-600 hover:underline">
          Retour au jeu →
        </Link>
      </header>

      <section className="space-y-4">
        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 text-sm text-indigo-900">
          Choisis les lettres que tu veux faire apparaître dans l'exercice d'écoute. Les réglages sont sauvegardés automatiquement.
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center">
          <span className="font-semibold text-indigo-900 text-lg">{enabledCount}</span>
          lettres actives
          <button type="button" onClick={selectAll} className="px-3 py-1 rounded-full border text-xs">
            Tout sélectionner
          </button>
          <button type="button" onClick={clearAll} className="px-3 py-1 rounded-full border text-xs">
            Tout désélectionner
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {LETTERS.map((letter) => {
            const enabled = settings.enabledLetters.includes(letter)
            return (
              <button
                key={letter}
                type="button"
                onClick={() => toggleLetter(letter)}
                className={`rounded-2xl border-2 py-3 text-xl font-semibold transition ${
                  enabled
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                    : 'bg-white text-indigo-700 border-indigo-100'
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-3">
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
