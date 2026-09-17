import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_WORDS,
  loadWordSettings,
  sanitizeWordSettings,
  saveWordSettings,
} from '../exercises/WordRecompose.jsx'
import { LETTER_STYLE_OPTIONS, fontForStyle, formatStyleLabel, formatLetterCase } from '../utils/fontStyle.js'

export default function WordRecomposeSettings() {
  const [initialSettings] = useState(() => loadWordSettings())
  const [textValue, setTextValue] = useState(() => initialSettings.words.join('\n'))
  const [letterStyle, setLetterStyle] = useState(() => initialSettings.letterStyle)

  const sanitized = useMemo(
    () => sanitizeWordSettings({ words: textValue, letterStyle }),
    [textValue, letterStyle],
  )

  useEffect(() => {
    saveWordSettings(sanitized)
  }, [sanitized])

  function resetDefaults() {
    setTextValue(DEFAULT_WORDS.join('\n'))
    setLetterStyle('baton')
    saveWordSettings({ words: DEFAULT_WORDS, letterStyle: 'baton' })
  }

  return (
    <div className="settings-page min-h-screen p-6 md:p-10 space-y-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm ui-muted hover:underline">
          ⬅️ Accueil
        </Link>
        <h1 className="text-2xl font-bold">Réglages – Recompose le mot</h1>
        <Link to="/ex/word-recompose" className="text-sm ui-muted hover:underline">
          Retour au jeu →
        </Link>
      </header>

      <section className="space-y-4">
        <div className="p-4 rounded-2xl border ui-border ui-note text-sm ui-ink">
          Indique un mot par ligne. Ils seront affichés en lettres capitales dans le jeu et choisis aléatoirement à chaque manche.
          Les espaces sont retirés automatiquement.
        </div>

        <form className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted" htmlFor="letterStyle">
              Style de lettres
            </label>
            <select
              id="letterStyle"
              value={letterStyle}
              onChange={(event) => setLetterStyle(event.target.value)}
              className="w-full px-3 py-2 rounded-xl border ui-surface ui-shadow"
            >
              {LETTER_STYLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatStyleLabel(option)}
                </option>
              ))}
            </select>
            <div className="rounded-xl border border-dashed ui-border-strong p-3 text-center">
              <span
                className="text-3xl font-semibold"
                style={{ fontFamily: fontForStyle(letterStyle) }}
              >
                {formatLetterCase('ABC', letterStyle)}
              </span>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="font-semibold text-sm ui-muted" htmlFor="wordsList">
              Liste des mots ({sanitized.words.length})
            </label>
            <textarea
              id="wordsList"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded-xl border ui-surface ui-shadow font-mono text-sm tracking-wide"
              placeholder={'Ex.\nMATIJA\nLAPIN\nCAROTTE'}
            />
            <p className="text-xs ui-muted">
              Les mots vides sont ignorés. Les espaces sont supprimés. Les doublons sont retirés automatiquement.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted">Aperçu</label>
            <div className="rounded-xl border border-dashed ui-border-strong p-3 ui-surface ui-shadow text-sm ui-muted space-y-1">
              {sanitized.words.map((word) => (
                <div
                  key={word}
                  className="font-semibold ui-ink"
                  style={{ fontFamily: fontForStyle(letterStyle) }}
                >
                  {formatLetterCase(word, letterStyle)}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted">Conseil</label>
            <div className="rounded-xl border ui-border p-3 ui-surface ui-shadow text-sm ui-muted">
              Pour varier la difficulté, mélange des mots courts et longs. Le mot choisi apparaît en haut de l'écran pendant l'exercice.
            </div>
          </div>
        </form>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-4 py-2 rounded-xl border ui-border-strong ui-surface text-sm hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </section>
    </div>
  )
}

