import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_WORDS,
  loadWordSettings,
  sanitizeWordSettings,
  saveWordSettings,
} from '../exercises/WordRecompose.jsx'

export default function WordRecomposeSettings() {
  const [textValue, setTextValue] = useState(() => loadWordSettings().words.join('\n'))

  const sanitized = useMemo(
    () => sanitizeWordSettings({ words: textValue }),
    [textValue],
  )

  useEffect(() => {
    saveWordSettings(sanitized)
  }, [sanitized])

  function resetDefaults() {
    setTextValue(DEFAULT_WORDS.join('\n'))
    saveWordSettings({ words: DEFAULT_WORDS })
  }

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-gray-600 hover:underline">
          ⬅️ Accueil
        </Link>
        <h1 className="text-2xl font-bold">Réglages – Recompose le mot</h1>
        <Link to="/ex/word-recompose" className="text-sm text-gray-600 hover:underline">
          Retour au jeu →
        </Link>
      </header>

      <section className="space-y-4">
        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 text-sm text-indigo-900">
          Indique un mot par ligne. Ils seront affichés en lettres capitales dans le jeu et choisis aléatoirement à chaque manche.
          Les espaces sont retirés automatiquement.
        </div>

        <form className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="font-semibold text-sm text-gray-700" htmlFor="wordsList">
              Liste des mots ({sanitized.words.length})
            </label>
            <textarea
              id="wordsList"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded-xl border bg-white shadow-sm font-mono text-sm tracking-wide"
              placeholder={'Ex.\nMATIJA\nLAPIN\nCAROTTE'}
            />
            <p className="text-xs text-gray-500">
              Les mots vides sont ignorés. Les espaces sont supprimés. Les doublons sont retirés automatiquement.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-700">Aperçu</label>
            <div className="rounded-xl border border-dashed border-indigo-200 p-3 bg-white shadow-sm text-sm text-gray-600 space-y-1">
              {sanitized.words.map((word) => (
                <div key={word} className="font-semibold text-indigo-900">
                  {word}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-700">Conseil</label>
            <div className="rounded-xl border border-indigo-100 p-3 bg-white shadow-sm text-sm text-gray-600">
              Pour varier la difficulté, mélange des mots courts et longs. Le mot choisi apparaît en haut de l'écran pendant l'exercice.
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

