import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_SETTINGS,
  loadLetterSettings,
  sanitizeSettings,
  saveLetterSettings,
  STAR_GOAL,
} from '../exercises/LetterFind.jsx'
import { LETTER_STYLE_OPTIONS, fontForStyle, formatStyleLabel, formatLetterCase } from '../utils/fontStyle.js'

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
    <div className="settings-page min-h-screen p-6 md:p-10 space-y-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm ui-muted hover:underline">
          ⬅️ Accueil
        </Link>
        <h1 className="text-2xl font-bold">Réglages – Trouve la lettre</h1>
        <Link to="/ex/letter-find" className="text-sm ui-muted hover:underline">
          Retour au jeu →
        </Link>
      </header>

      <section className="space-y-4">
        <div className="p-4 rounded-2xl border ui-border ui-note text-sm ui-ink">
          Ajuste les paramètres du jeu. Les modifications sont sauvegardées automatiquement et une nouvelle manche se lance dès ton retour sur le jeu.
        </div>

        <form className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted" htmlFor="targetLetter">
              Lettre cible
            </label>
            <input
              id="targetLetter"
              value={settings.targetLetter}
              onChange={(event) => update({ targetLetter: event.target.value })}
              maxLength={1}
              className="w-24 px-3 py-2 rounded-xl border ui-surface ui-shadow text-center text-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted" htmlFor="distractorLetters">
              Lettres distractrices
            </label>
            <input
              id="distractorLetters"
              value={settings.distractorLetters}
              onChange={(event) => update({ distractorLetters: event.target.value })}
              className="w-full px-3 py-2 rounded-xl border ui-surface ui-shadow uppercase tracking-wide"
              placeholder="Ex. BCEFGH"
            />
            <p className="text-xs ui-muted">
              MAJUSCULES, séparées ou non, la lettre cible est automatiquement exclue.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted" htmlFor="itemsCount">
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
            <p className="text-xs ui-muted">Entre 8 et 30 cartes.</p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted" htmlFor="targetRatio">
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
            <p className="text-xs ui-muted">Entre 10% et 90% des cartes.</p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted" htmlFor="letterStyle">
              Style de lettres
            </label>
            <select
              id="letterStyle"
              value={settings.letterStyle}
              onChange={(event) => update({ letterStyle: event.target.value })}
              className="w-full px-3 py-2 rounded-xl border ui-surface ui-shadow"
            >
              {LETTER_STYLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatStyleLabel(option)}
                </option>
              ))}
            </select>
            <div className="rounded-xl border border-dashed ui-border-strong p-3 text-center">
              {settings.letterStyle === 'mixte' ? (
                <span className="text-3xl font-semibold flex items-center justify-center gap-3">
                  <span style={{ fontFamily: fontForStyle('baton') }}>
                    {formatLetterCase('ABC', 'baton')}
                  </span>
                  <span className="ui-muted text-xl">/</span>
                  <span style={{ fontFamily: fontForStyle('script') }}>
                    {formatLetterCase('ABC', 'script')}
                  </span>
                </span>
              ) : (
                <span
                  className="text-3xl font-semibold"
                  style={{ fontFamily: fontForStyle(settings.letterStyle) }}
                >
                  {formatLetterCase('ABC', settings.letterStyle)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm ui-muted">Progression étoiles</label>
            <div className="rounded-xl border ui-border p-3 ui-surface ui-shadow text-sm ui-muted">
              Tu gagnes 1 ⭐ par victoire, jusqu'à {STAR_GOAL}. Les réglages sont partagés avec l'exercice.
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


